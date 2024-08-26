import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        editor: any;
        class?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type RootProps = typeof __propDef.props;
export type RootEvents = typeof __propDef.events;
export type RootSlots = typeof __propDef.slots;
export default class Root extends SvelteComponentTyped<RootProps, RootEvents, RootSlots> {
}
export {};
