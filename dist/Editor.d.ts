import { AttributeMap, Delta, Line, TextChange, TextDocument, type EditorRange } from '@typewriter/document';
import { Source, type SourceString } from './Source';
import type { DecorateEvent } from './modules';
import { Typeset, type Commands, type TypesetTypes } from './typesetting/typeset';
import { EventDispatcher } from './util/EventDispatcher';
export interface EditorOptions {
    identifier?: any;
    root?: HTMLElement | false;
    types?: TypesetTypes;
    doc?: TextDocument;
    modules?: ModuleInitializers;
    /**
     * Defaults to true. When true, the `modules` option will be patched on top of the default modules.
     * Disable this if you are providing all necessary modules in the `modules` option and want full control over module initialization order.
     */
    includeDefaultModules?: boolean;
    enabled?: boolean;
    text?: string;
    html?: string;
    dev?: boolean;
    throwOnError?: boolean;
}
export interface Shortcuts {
    [shortcut: string]: string;
}
export interface Module {
    init?: () => void;
    destroy?: () => void;
    shortcuts?: Shortcuts;
    commands?: Commands;
    getActive?: () => AttributeMap;
    trimSelection?: (range: EditorRange) => EditorRange;
    [name: string]: any;
}
export interface ModuleInitializers {
    [name: string]: ModuleInitializer;
}
export interface ModuleInitializer {
    (editor: Editor): Module;
}
export interface Modules {
    [name: string]: Module;
}
export interface EditorChangeEventInit extends EventInit {
    old: TextDocument;
    doc: TextDocument;
    change?: TextChange;
    changedLines?: Line[];
    source: SourceString;
}
export declare class EditorChangeEvent extends Event {
    old: TextDocument;
    doc: TextDocument;
    change?: TextChange;
    changedLines?: Line[];
    source: SourceString;
    constructor(type: string, init: EditorChangeEventInit);
    modify(delta: Delta): void;
}
export interface EditorFormatEventInit extends EventInit {
    formats: AttributeMap;
}
export interface EditorEventMap {
    enabledchange: Event;
    root: Event;
    changing: EditorChangeEvent;
    change: EditorChangeEvent;
    changed: EditorChangeEvent;
    format: EditorFormatEvent;
    focus: FocusEvent;
    blur: FocusEvent;
    keydown: KeyboardEvent;
    mousedown: MouseEvent;
    mouseup: MouseEvent;
    click: MouseEvent;
    decorate: DecorateEvent;
    [name: string]: Event;
}
export declare class EditorFormatEvent extends Event {
    formats: AttributeMap;
    constructor(type: string, init: EditorFormatEventInit);
}
export interface EditorTextChange extends TextChange {
    apply(source?: SourceString): Editor;
}
export declare class Editor extends EventDispatcher<EditorEventMap> {
    identifier: any;
    typeset: Typeset;
    doc: TextDocument;
    activeFormats: AttributeMap;
    commands: Commands;
    shortcuts: Shortcuts;
    modules: Modules;
    catchErrors: boolean;
    throwOnError: boolean;
    _root: HTMLElement;
    private _modules;
    private _enabled;
    constructor(options?: EditorOptions);
    get root(): HTMLElement;
    get enabled(): boolean;
    set enabled(value: boolean);
    get change(): EditorTextChange;
    setRoot(root: HTMLElement): this;
    update(changeOrDelta: TextChange | Delta, source?: SourceString): this;
    set(docOrDelta: TextDocument | Delta, source?: SourceString, change?: TextChange, changedLines?: Line[]): this;
    getHTML(): string;
    setHTML(html: string, selection?: EditorRange | null, source?: SourceString): this;
    getDelta(): Delta;
    setDelta(delta: Delta, selection?: EditorRange | null, source?: SourceString): this;
    getText(range?: EditorRange): string;
    setText(text: string, selection?: EditorRange | null, source?: SourceString): this;
    trimSelection(selection: EditorRange): EditorRange;
    getActive(): AttributeMap;
    select(at: EditorRange | number | null, source?: Source): this;
    insert(insert: string | object, format?: AttributeMap, selection?: EditorRange | null, options?: {
        dontFixNewline?: boolean;
    }): this;
    insertContent(content: Delta, selection?: EditorRange | null): this;
    delete(directionOrSelection?: -1 | 1 | EditorRange, options?: {
        dontFixNewline?: boolean;
    }): this;
    formatText(format: AttributeMap | string, selection?: EditorRange | null): this;
    toggleTextFormat(format: AttributeMap | 'string', selection?: EditorRange | null): this;
    formatLine(format: AttributeMap | string, selection?: EditorRange | number | null): this;
    toggleLineFormat(format: AttributeMap | string, selection?: EditorRange | null): this;
    indent(): this;
    outdent(): this;
    removeFormat(selection?: EditorRange | null): this;
    getBounds(range: EditorRange | number, relativeTo?: Element, relativeInside?: boolean): DOMRect | undefined;
    getAllBounds(range: EditorRange | number, relativeTo?: Element, relativeInside?: boolean): DOMRect[] | undefined;
    getIndexFromPoint(x: number, y: number): number | null;
    render(): this;
    init(): void;
    destroy(): void;
}
