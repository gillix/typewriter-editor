import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        editor: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            commands: any;
            active: import("@typewriter/delta").AttributeMap;
            selection: import("@typewriter/document").EditorRange | null;
            focus: boolean;
        };
    };
};
export type ToolbarProps = typeof __propDef.props;
export type ToolbarEvents = typeof __propDef.events;
export type ToolbarSlots = typeof __propDef.slots;
export default class Toolbar extends SvelteComponentTyped<ToolbarProps, ToolbarEvents, ToolbarSlots> {
}
export {};
