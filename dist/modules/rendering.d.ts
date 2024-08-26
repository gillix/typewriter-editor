import { TextDocument } from '@typewriter/document';
import { Editor } from '../Editor';
export interface RenderWhat {
    old?: TextDocument;
    doc?: TextDocument;
}
export declare function rendering(editor: Editor): {
    render: (what?: RenderWhat) => void;
    destroy(): void;
};
