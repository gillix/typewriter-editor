import { TextDocument, type EditorRange } from '@typewriter/document';
import { Editor } from '../Editor';
export interface VirtualRenderWhat {
    old?: TextDocument;
    doc?: TextDocument;
    selection: EditorRange | null;
}
export declare function virtualRendering(editor: Editor): {
    render: (what?: VirtualRenderWhat) => void;
    init(): void;
    destroy(): void;
};
