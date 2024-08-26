import { SvelteComponentTyped } from "svelte";
import { type Placement } from '@popperjs/core';
import type { EditorRange } from '@typewriter/document';
import type { Editor } from './Editor';
declare const __propDef: {
    props: {
        editor: Editor;
        class?: string;
        offset?: number;
        padding?: number;
        for?: string | undefined;
        placement?: Placement;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            commands: import("./typesetting").Commands;
            active: import("@typewriter/document").AttributeMap;
            selection: EditorRange | null;
            focus: boolean;
            placement: Placement;
        };
    };
};
export type BubbleMenuProps = typeof __propDef.props;
export type BubbleMenuEvents = typeof __propDef.events;
export type BubbleMenuSlots = typeof __propDef.slots;
export default class BubbleMenu extends SvelteComponentTyped<BubbleMenuProps, BubbleMenuEvents, BubbleMenuSlots> {
}
export {};
