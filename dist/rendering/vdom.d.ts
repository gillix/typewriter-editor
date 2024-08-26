export interface Props {
    [key: string]: any;
}
export type VChild = VNode | string;
export interface VNode {
    type: string;
    props: Props;
    children: VChild[];
    key: any;
}
export declare const options: {
    renderKeys: boolean;
};
type Node = Element | Text;
export declare const recycleNode: (dom: Node) => string | VNode;
export interface H {
    <T, P extends Props | null | undefined, C extends VChild | VChild[]>(type: (props: P, children: C) => T, props?: P, ch?: C): T;
    (type: string, props?: Props | null, ch?: VChild | VChild[]): VNode;
}
export declare const h: H;
export declare const React: {
    createElement: H;
};
export declare const patch: (dom: Node, vdom: VNode | VNode[], oldKids?: ChildNode[]) => Node;
export {};
