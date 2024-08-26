import { Delta, type EditorRange } from '@typewriter/document';
import { Editor } from '../Editor';
export interface PasteEventInit extends EventInit {
    delta: Delta;
    html?: string;
    text?: string;
}
export declare class PasteEvent extends Event {
    delta: Delta;
    html?: string;
    text?: string;
    constructor(type: string, init: PasteEventInit);
}
export interface PasteOptions {
    text?: string;
    html?: string;
    selection?: EditorRange | null;
}
export interface PasteModuleOptions {
    htmlParser?: (editor: Editor, html: string) => Delta;
    allowHTMLPaste?: boolean;
}
export declare function paste(editor: Editor, options?: PasteModuleOptions): {
    commands: {
        paste: ({ selection, text, html }: PasteOptions) => void;
    };
    init(): void;
    destroy(): void;
};
