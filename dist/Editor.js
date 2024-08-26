import { AttributeMap, Delta, Line, TextChange, TextDocument, hasFormat, isEqual, normalizeRange, } from '@typewriter/document';
import { Source } from './Source';
import { defaultModules } from './modules/defaults';
import { docFromHTML, docToHTML } from './rendering/html';
import { getBoudingBrowserRange, getIndexFromPoint } from './rendering/position';
import { defaultTypes } from './typesetting/defaults';
import { Types, Typeset } from './typesetting/typeset';
import { EventDispatcher } from './util/EventDispatcher';
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const PROXIED_EVENTS = ['focus', 'blur', 'keydown', 'mousedown', 'mouseup', 'click'];
const eventProxies = new WeakMap();
export class EditorChangeEvent extends Event {
    old;
    doc;
    change;
    changedLines;
    source;
    constructor(type, init) {
        super(type, init);
        this.old = init.old;
        this.doc = init.doc;
        this.change = init.change;
        this.changedLines = init.changedLines;
        this.source = init.source;
        // Fix Safari bug, see https://stackoverflow.com/a/58471803
        Object.setPrototypeOf(this, EditorChangeEvent.prototype);
    }
    // Modify the data during a "changing" event before doc is committed
    modify(delta) {
        if (!this.cancelable)
            throw new Error('Cannot modify an applied change, listen to the "changing" event');
        this.doc = this.doc.apply(delta);
        if (this.change)
            this.change.delta = this.change.delta.compose(delta);
        if (this.changedLines) {
            this.changedLines = this.old.lines === this.doc.lines ? EMPTY_ARR : getChangedLines(this.old, this.doc);
        }
    }
}
export class EditorFormatEvent extends Event {
    formats;
    constructor(type, init) {
        super(type, init);
        this.formats = init.formats;
    }
}
export class Editor extends EventDispatcher {
    identifier;
    typeset;
    doc;
    activeFormats = EMPTY_OBJ;
    commands = {};
    shortcuts = {};
    modules = {};
    catchErrors;
    throwOnError;
    _root;
    _modules;
    _enabled;
    constructor(options = {}) {
        super();
        this.catchErrors = !options.dev;
        this.identifier = options.identifier;
        this.typeset = new Typeset(options.types || defaultTypes);
        if (options.doc) {
            this.doc = options.doc;
        }
        else if (options.html) {
            this.doc = docFromHTML(this, options.html);
        }
        else if (options.text) {
            this.doc = new TextDocument(new Delta().insert(options.text));
        }
        else {
            this.doc = new TextDocument();
        }
        this.throwOnError = options.throwOnError || false;
        this._enabled = options.enabled === undefined ? true : options.enabled;
        const includeDefaultModules = options.includeDefaultModules ?? true;
        this._modules = includeDefaultModules ? { ...defaultModules, ...options.modules } : { ...options.modules };
        if (options.root)
            this.setRoot(options.root);
    }
    get root() {
        if (!this._root) {
            this.setRoot(document.createElement('div'));
        }
        return this._root;
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        value = !!value;
        const changed = this._enabled !== value;
        if (!value && this.doc.selection)
            this.select(null, Source.api);
        this._enabled = value;
        if (this._root)
            this._root.contentEditable = value ? 'true' : 'inherit';
        if (changed)
            this.dispatchEvent(new Event('enabledchange'));
    }
    get change() {
        const change = new TextChange(this.doc);
        change.apply = (source = Source.user) => this.update(change, source);
        return change;
    }
    setRoot(root) {
        if (!root)
            throw new TypeError('Root must be set, cannot be ' + root);
        this.destroy();
        this._root = root;
        this.init();
        this.dispatchEvent(new Event('root'));
        return this;
    }
    update(changeOrDelta, source = Source.user) {
        if (!this.enabled && source !== Source.api) {
            return this;
        }
        const change = changeOrDelta.ops
            ? new TextChange(this.doc, changeOrDelta)
            : changeOrDelta;
        const old = this.doc;
        const doc = old.apply(change, undefined, this.throwOnError);
        const changedLines = old.lines === doc.lines ? EMPTY_ARR : getChangedLines(old, doc);
        this.set(doc, source, change, changedLines);
        return this;
    }
    set(docOrDelta, source = Source.user, change, changedLines) {
        const old = this.doc;
        const doc = docOrDelta.ops ? new TextDocument(docOrDelta) : docOrDelta;
        if ((!this.enabled && source !== Source.api) || !doc || old.equals(doc)) {
            return this;
        }
        const changingEvent = new EditorChangeEvent('changing', {
            cancelable: true,
            old,
            doc,
            change,
            changedLines,
            source,
        });
        this.dispatchEvent(changingEvent, this.catchErrors);
        if (changingEvent.defaultPrevented || old.equals(changingEvent.doc))
            return this;
        this.activeFormats = change?.activeFormats ? change.activeFormats : getActiveFormats(this, changingEvent.doc);
        this.doc = changingEvent.doc;
        this.dispatchEvent(new EditorChangeEvent('change', { ...changingEvent, cancelable: false }), this.catchErrors);
        this.dispatchEvent(new EditorChangeEvent('changed', { ...changingEvent, cancelable: false }), this.catchErrors);
        return this;
    }
    getHTML() {
        return docToHTML(this, this.doc);
    }
    setHTML(html, selection = this.doc.selection, source) {
        return this.set(docFromHTML(this, html, selection), source);
    }
    getDelta() {
        return this.doc.toDelta();
    }
    setDelta(delta, selection = this.doc.selection, source) {
        return this.set(new TextDocument(delta, selection), source);
    }
    getText(range) {
        return this.doc.getText(range);
    }
    setText(text, selection = this.doc.selection, source) {
        return this.set(new TextDocument(new Delta().insert(text), selection), source);
    }
    trimSelection(selection) {
        if (!selection)
            return selection;
        const selectedText = this.getText(selection);
        const [from, to] = normalizeRange([...selection]);
        // don't trim if all spaces are selected
        if (selectedText.trim()) {
            const [_, lead, text, tail] = selectedText.match(/(^ *)((?:.|\r|\n)*?)( *$)/);
            if (text && (lead || tail)) {
                return [from + lead.length, to - tail.length];
            }
        }
        return selection;
    }
    getActive() {
        const { selection } = this.doc;
        let active = selection
            ? selection[0] === selection[1]
                ? { ...this.activeFormats, ...this.doc.getLineFormat(selection) }
                : { ...this.doc.getFormats(selection) }
            : {};
        Object.values(this.modules).forEach(module => {
            if (module.getActive)
                active = { ...active, ...module.getActive() };
        });
        return active;
    }
    select(at, source) {
        return this.update(this.change.select(at), source);
    }
    insert(insert, format, selection = this.doc.selection, options) {
        if (!selection)
            return this;
        const inPlace = isEqual(selection, this.doc.selection);
        if (format == null && typeof insert === 'string' && insert !== '\n') {
            format = inPlace ? this.activeFormats : getActiveFormats(this, this.doc, selection);
        }
        const type = this.typeset.lines.findByAttributes(format, true);
        const change = this.change.delete(selection);
        const at = normalizeRange(selection)[0];
        if (inPlace)
            change.setActiveFormats((insert !== '\n' && format) || getActiveFormats(this, this.doc, selection));
        if (insert === '\n' && type.frozen) {
            const lineFormat = { ...this.doc.getLineFormat(at) };
            const secondLine = { ...format };
            let lastLine = { ...lineFormat };
            const newlines = new Delta().insert('\n', lineFormat);
            if (this.doc.getLineRange(at)[1] - 1 !== at) {
                newlines.insert('\n', secondLine);
            }
            else {
                lastLine = secondLine;
            }
            change
                .insertContent(at, newlines)
                .formatLine(at, lastLine)
                .select(at + 2);
        }
        else {
            change.insert(at, insert, format, options);
        }
        return this.update(change);
    }
    insertContent(content, selection = this.doc.selection) {
        if (!selection)
            return this;
        const change = this.change.delete(selection).insertContent(selection[0], content);
        return this.update(change);
    }
    delete(directionOrSelection, options) {
        let range;
        let selectOffset = 0;
        const { typeset: { lines }, doc, } = this;
        if (Array.isArray(directionOrSelection)) {
            range = normalizeRange(directionOrSelection);
        }
        else {
            if (!this.doc.selection)
                return this;
            range = normalizeRange(this.doc.selection);
            if (directionOrSelection) {
                if (range[0] === range[1]) {
                    if (directionOrSelection < 0)
                        range = [range[0] + directionOrSelection, range[1]];
                    else
                        range = [range[0], Math.min(range[1] + directionOrSelection, this.doc.length - 1)];
                }
                else if (directionOrSelection < 0 &&
                    lines.findByAttributes(doc.getLineAt(range[0]).attributes, true).frozen) {
                    selectOffset = -1;
                }
            }
        }
        const formats = getActiveFormats(this, this.doc, [range[0] + 1, range[0] + 1]);
        const docLength = this.doc.length - (range[1] - range[0]);
        let select = Math.max(0, Math.min(docLength - 1, range[0] + selectOffset));
        const change = this.change.delete(range, options).select(select).setActiveFormats(formats);
        return this.update(change);
    }
    formatText(format, selection = this.doc.selection) {
        if (!selection)
            return this;
        if (typeof format === 'string')
            format = { [format]: true };
        if (selection[0] === selection[1]) {
            this.activeFormats = AttributeMap.compose(this.activeFormats, format) || EMPTY_OBJ;
            this.dispatchEvent(new EditorFormatEvent('format', { formats: this.activeFormats }));
            return this;
        }
        changeFormat(this, 'formatText', format, selection);
        return this;
    }
    toggleTextFormat(format, selection = this.doc.selection) {
        if (!selection)
            return this;
        if (typeof format === 'string')
            format = { [format]: true };
        if (selection[0] === selection[1]) {
            if (hasFormat(format, this.activeFormats))
                format = AttributeMap.invert(format);
            this.activeFormats = AttributeMap.compose(this.activeFormats, format) || EMPTY_OBJ;
            this.dispatchEvent(new EditorFormatEvent('format', { formats: this.activeFormats }));
            return this;
        }
        changeFormat(this, 'toggleTextFormat', format, selection);
        return this;
    }
    formatLine(format, selection = this.doc.selection) {
        if (typeof format === 'string')
            format = { [format]: true };
        changeFormat(this, 'formatLine', format, selection);
        return this;
    }
    toggleLineFormat(format, selection = this.doc.selection) {
        if (typeof format === 'string')
            format = { [format]: true };
        changeFormat(this, 'toggleLineFormat', format, selection);
        return this;
    }
    indent() {
        indentLines(this, 1);
        return this;
    }
    outdent() {
        indentLines(this, -1);
        return this;
    }
    removeFormat(selection = this.doc.selection) {
        changeFormat(this, 'removeFormat', null, selection);
        return this;
    }
    getBounds(range, relativeTo, relativeInside) {
        if (typeof range === 'number')
            range = [range, range];
        if (!range)
            return undefined;
        let rect = getBoudingBrowserRange(this, range)?.getBoundingClientRect();
        if (rect && relativeTo) {
            const relative = relativeTo.getBoundingClientRect();
            const leftOffset = (relativeInside ? relativeTo.scrollLeft : 0) - relative.x;
            const topOffset = (relativeInside ? relativeTo.scrollTop : 0) - relative.y;
            rect = new DOMRect(rect.x + leftOffset, rect.y + topOffset, rect.width, rect.height);
        }
        return rect;
    }
    getAllBounds(range, relativeTo, relativeInside) {
        if (typeof range === 'number')
            range = [range, range];
        const collection = getBoudingBrowserRange(this, range)?.getClientRects();
        let list = collection && Array.from(collection);
        if (list && relativeTo) {
            const relative = relativeTo.getBoundingClientRect();
            const leftOffset = (relativeInside ? relativeTo.scrollLeft : 0) - relative.x;
            const topOffset = (relativeInside ? relativeTo.scrollTop : 0) - relative.y;
            list = list.map(rect => new DOMRect(rect.x + leftOffset, rect.y + topOffset, rect.width, rect.height));
        }
        return list;
    }
    getIndexFromPoint(x, y) {
        return getIndexFromPoint(this, x, y);
    }
    render() {
        this.modules.decorations?.gatherDecorations();
        this.modules.rendering?.render();
        this.modules.selection?.renderSelection();
        return this;
    }
    init() {
        const root = this._root;
        if (root.editor)
            root.editor.destroy();
        root.editor = this;
        this.enabled = this._enabled;
        this.commands = {};
        PROXIED_EVENTS.forEach(type => this._root.addEventListener(type, getEventProxy(this)));
        this.typeset.lines.list.forEach(type => type.commands && mergeCommands(this, type.name, type.commands(this)));
        this.typeset.formats.list.forEach(type => type.commands && mergeCommands(this, type.name, type.commands(this)));
        this.typeset.embeds.list.forEach(type => type.commands && mergeCommands(this, type.name, type.commands(this)));
        Object.keys(this._modules).forEach(key => {
            if (!this._modules[key])
                return;
            const module = (this.modules[key] = this._modules[key](this));
            if (module.commands)
                mergeCommands(this, key, module.commands);
        });
        this.shortcuts = createShortcutMap(this);
        Object.keys(this.modules).forEach(key => this.modules[key].init?.());
        this.render();
    }
    destroy() {
        const root = this._root;
        if (!root)
            return;
        PROXIED_EVENTS.forEach(type => root.removeEventListener(type, getEventProxy(this)));
        Object.values(this.modules).forEach(module => module.destroy && module.destroy());
        this._root = undefined;
        delete root.editor;
    }
}
function changeFormat(editor, op, format, selection) {
    if (!selection)
        return;
    selection =
        typeof selection === 'number' ? [selection, selection] : editor?.trimSelection(selection);
    if (!(op in editor.change))
        throw new Error('Invalid operation: ' + op);
    const change = editor.change[op](selection, format);
    editor.update(change);
}
function getActiveFormats(editor, doc, selection = doc.selection) {
    const { formats } = editor.typeset;
    if (!selection || selection[0] === 0)
        return EMPTY_OBJ;
    const at = normalizeRange(selection)[0];
    // If start of a non-empty line, use the format of the first character, otherwise use the format of the preceeding
    let formatAt = at;
    let formatTo = at + 1;
    const attributes = doc.getTextFormat(formatAt);
    const nextAttributes = doc.getTextFormat(formatTo);
    const format = {};
    // Sort them by the order found in marks and be efficient
    Object.keys(attributes).forEach(name => {
        const type = formats.get(name);
        if (type && type.greedy !== false) {
            format[name] = attributes[name];
        }
    });
    Object.keys(nextAttributes).forEach(name => {
        const type = formats.get(name);
        if (type && type.greedy === false) {
            format[name] = attributes[name];
        }
    });
    return format;
}
function getChangedLines(oldDoc, newDoc) {
    const set = new Set(oldDoc.lines);
    return newDoc.lines.filter(line => !set.has(line));
}
function mergeCommands(editor, name, other) {
    if (!other)
        return;
    if (typeof other === 'function')
        editor.commands[name] = enhanceCommand(editor, other);
    else
        Object.keys(other).forEach(key => (editor.commands[key] = enhanceCommand(editor, other[key])));
}
function enhanceCommand(editor, command) {
    return (...args) => {
        const result = command(...args);
        if (editor.doc.selection)
            editor.root.focus();
        return result;
    };
}
function indentLines(editor, direction = 1) {
    const { typeset: { lines }, doc, } = editor;
    const { selection } = doc;
    if (!selection)
        return doc;
    const change = editor.change;
    doc.getLinesAt(selection).forEach(line => {
        const type = lines.findByAttributes(line.attributes, true);
        if (!type.indentable)
            return;
        const range = doc.getLineRange(line);
        let indent = (line.attributes.indent || 0) + direction;
        if (indent === 0)
            indent = null;
        change.formatLine(range[0], indent < 0 ? EMPTY_OBJ : { ...line.attributes, indent });
    });
    editor.update(change);
}
function getEventProxy(editor) {
    let proxy = eventProxies.get(editor);
    if (!proxy) {
        proxy = eventProxy.bind(editor);
        eventProxies.set(editor, proxy);
    }
    return proxy;
}
function eventProxy(event) {
    this.dispatchEvent(event);
}
function createShortcutMap(editor) {
    const all = {};
    const { typeset: { lines, formats, embeds }, modules, } = editor;
    mergeTypeShortcuts(lines, all);
    mergeTypeShortcuts(formats, all);
    mergeTypeShortcuts(embeds, all);
    mergeModuleShortcuts(modules, all);
    return all;
}
function mergeTypeShortcuts(types, shortcuts) {
    types.list.forEach(type => {
        const typeShortcuts = type.shortcuts;
        if (!typeShortcuts)
            return;
        if (typeof typeShortcuts === 'string') {
            shortcuts[typeShortcuts] = type.name;
        }
        else {
            mergeShortcuts(typeShortcuts, shortcuts);
        }
    });
}
function mergeModuleShortcuts(modules, all) {
    Object.keys(modules).forEach(name => {
        const shortcuts = modules[name]?.shortcuts;
        if (shortcuts)
            mergeShortcuts(shortcuts, all);
    });
}
function mergeShortcuts(shortcuts, all) {
    Object.keys(shortcuts).forEach(shortcut => (all[shortcut] = shortcuts[shortcut]));
}
