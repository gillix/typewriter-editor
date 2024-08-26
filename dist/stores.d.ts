import { AttributeMap, TextDocument, type EditorRange } from '@typewriter/document';
import { type Readable } from 'easy-signal';
import { Editor } from './Editor';
export interface EditorStores {
    active: Readable<AttributeMap>;
    doc: Readable<TextDocument>;
    selection: Readable<EditorRange | null>;
    root: Readable<HTMLElement | undefined>;
    focus: Readable<boolean>;
    updateEditor(editor: Editor): void;
}
export declare function editorStores(editor: Editor): EditorStores;
export declare function derivedEditorStore<T>(editorStore: Readable<Editor>, defaultValue: T, changeEvents: string[], update: (editor: Editor) => T, checkEquality?: boolean): Readable<T>;
export declare function activeStore(editorStore: Readable<Editor>): Readable<AttributeMap>;
export declare function docStore(editorStore: Readable<Editor>): Readable<TextDocument>;
export declare function selectionStore(editorStore: Readable<Editor>): Readable<EditorRange | null>;
export declare function focusStore(editorStore: Readable<Editor>): Readable<boolean>;
export declare function rootStore(editorStore: Readable<Editor>): Readable<HTMLElement | undefined>;
