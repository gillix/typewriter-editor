import { AttributeMap, TextDocument, isEqual } from '@typewriter/document';
import { readable, writable } from 'easy-signal';
import { Editor } from './Editor';
export function editorStores(editor) {
    const editorStore = writable(editor);
    const active = activeStore(editorStore);
    const doc = docStore(editorStore);
    const selection = selectionStore(editorStore);
    const root = rootStore(editorStore);
    const focus = focusStore(editorStore);
    function updateEditor(value) {
        if (value === editor)
            return;
        editorStore.set(value);
    }
    return {
        active,
        doc,
        selection,
        root,
        focus,
        updateEditor,
    };
}
export function derivedEditorStore(editorStore, defaultValue, changeEvents, update, checkEquality) {
    let value = defaultValue;
    return readable(value, set => {
        let editor;
        const callUpdate = () => {
            value = editor ? update(editor) : defaultValue;
            if (checkEquality && isEqual(value, set))
                return;
            set(value);
        };
        const on = () => editor && changeEvents.forEach(event => editor.on(event, callUpdate));
        const off = () => editor && changeEvents.forEach(event => editor.off(event, callUpdate));
        const unsub = editorStore.subscribe(currentEditor => {
            off();
            editor = currentEditor;
            if (editor) {
                callUpdate();
                on();
            }
            else {
                set((value = defaultValue));
            }
        });
        return () => {
            off();
            unsub();
            editor = undefined;
            callUpdate();
        };
    });
}
export function activeStore(editorStore) {
    return derivedEditorStore(editorStore, {}, ['changed', 'format'], editor => editor.getActive(), true);
}
export function docStore(editorStore) {
    return derivedEditorStore(editorStore, new TextDocument(), ['changed'], editor => editor.doc);
}
export function selectionStore(editorStore) {
    return derivedEditorStore(editorStore, null, ['changed'], editor => editor.doc.selection);
}
export function focusStore(editorStore) {
    return derivedEditorStore(editorStore, false, ['changed'], editor => !!editor.doc.selection);
}
export function rootStore(editorStore) {
    return derivedEditorStore(editorStore, undefined, ['root'], editor => editor._root);
}
