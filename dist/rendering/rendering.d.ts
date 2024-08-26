import { Line, TextDocument, type EditorRange } from '@typewriter/document';
import { Editor } from '../Editor';
import { type VChild, type VNode } from './vdom';
export type CombinedEntry = Line | Line[];
export type Combined = CombinedEntry[];
interface CombinedData {
    combined: Combined;
    byKey: Record<string, CombinedEntry>;
}
type LineRanges = [EditorRange, EditorRange];
export interface HTMLLineElement extends HTMLElement {
    key: string;
}
export declare function getLineNodeStart(root: HTMLElement, node: Node): number;
export declare function getLineNodeEnd(root: HTMLElement, node: Node): number;
export declare function setLineNodesRanges(editor: Editor): void;
export declare function render(editor: Editor, doc: TextDocument): void;
export declare function renderChanges(editor: Editor, oldDoc: TextDocument, newDoc: TextDocument): void;
export declare function renderDoc(editor: Editor, doc: TextDocument, forHTML?: boolean): VNode[];
export declare function renderCombined(editor: Editor, combined: Combined, forHTML?: boolean): VNode[];
export declare function renderLine(editor: Editor, line: CombinedEntry, forHTML?: boolean): VNode;
export declare function renderSingleLine(editor: Editor, line: Line, forHTML?: boolean): VNode;
export declare function renderMultiLine(editor: Editor, lines: Line[], forHTML?: boolean): VNode;
export declare function combineLines(editor: Editor, lines: Line[]): CombinedData;
export declare function getChangedRanges(oldC: Combined, newC: Combined): LineRanges;
export declare function renderInline(editor: Editor, line: Line, forHTML?: boolean): VChild[];
export {};
