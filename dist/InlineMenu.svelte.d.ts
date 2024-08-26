import { SvelteComponentTyped } from "svelte";
import type { EditorRange, Line } from '@typewriter/document';
import type { Editor } from './Editor';
declare const __propDef: {
    props: {
        editor: Editor;
        atLine?: boolean;
        hover?: boolean;
        any?: boolean;
        class?: string;
        line?: Line | null;
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
        };
    };
};
export type InlineMenuProps = typeof __propDef.props;
export type InlineMenuEvents = typeof __propDef.events;
export type InlineMenuSlots = typeof __propDef.slots;
export default class InlineMenu extends SvelteComponentTyped<InlineMenuProps, InlineMenuEvents, InlineMenuSlots> {
}
export {};
