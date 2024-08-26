import type { Editor } from './Editor';
export declare function asRoot(root: HTMLElement, editor: Editor): {
    update: (newEditor: Editor) => void;
    destroy: () => void;
};
