import { AttributeMap, Line } from '@typewriter/document';
import { Editor, type Shortcuts } from '../Editor';
import type { VChild, VNode } from '../rendering/vdom';
export declare class Typeset {
    lines: Types<LineType>;
    formats: Types<FormatType>;
    embeds: Types<EmbedType>;
    static line: typeof line;
    static format: typeof format;
    static embed: typeof embed;
    constructor(types: TypesetTypes);
}
export declare function line(type: LineType): LineType;
export declare function format(type: FormatType): FormatType;
export declare function embed(type: EmbedType): EmbedType;
export type FromDom = (node: HTMLElement) => any;
export type LineData = [attributes: AttributeMap, children: VChild[], id: string];
export type Renderer = (attributes: AttributeMap, children: VChild[], line: Line, editor: Editor, forHTML?: boolean) => VNode;
export type MultiLineRenderer = (lines: LineData[], editor: Editor, forHTML?: boolean) => VNode;
export type ShouldCombine = (prev: AttributeMap, next: AttributeMap) => boolean;
export interface Commands {
    [name: string]: (...args: any[]) => any;
}
export interface BasicType {
    name: string;
    selector: string;
    styleSelector?: string;
    fromDom?: FromDom | false;
    commands?: (editor: Editor) => Commands | Function;
    shortcuts?: Shortcuts | string;
    render?: Renderer;
}
export interface FormatType extends BasicType {
    greedy?: boolean;
}
export interface EmbedType extends BasicType {
    noFill?: boolean;
}
export interface LineType extends BasicType {
    indentable?: boolean;
    child?: boolean;
    defaultFollows?: boolean;
    frozen?: boolean;
    contained?: boolean;
    onEnter?: (editor: Editor) => void;
    onTab?: (editor: Editor, shiftKey: boolean) => void;
    nextLineAttributes?: (attributes: AttributeMap) => AttributeMap;
    onEmptyEnter?: (editor: Editor, line: Line) => boolean;
    render?: Renderer;
    renderMultiple?: MultiLineRenderer;
    shouldCombine?: ShouldCombine;
}
export interface TypesetTypes {
    lines?: Array<string | LineType>;
    formats?: Array<string | FormatType>;
    embeds?: Array<string | EmbedType>;
}
export interface TypeMap<T extends BasicType = BasicType> {
    [name: string]: T;
}
/**
 * A type store to hold types and make it easy to manage them.
 */
export declare class Types<T extends BasicType = BasicType> {
    list: T[];
    selector: string;
    types: TypeMap<T>;
    priorities: {
        [name: string]: number;
    };
    constructor(types: T[]);
    get default(): T;
    init(): void;
    add(type: T): void;
    remove(type: T | string): void;
    get(name: string): T;
    priority(name: string): number;
    matches(node: Node | null): boolean | undefined;
    findByNode(node: Node, fallbackToDefault: true): T;
    findByNode(node: Node, fallbackToDefault?: boolean): T | undefined;
    findByAttributes(attributes: AttributeMap | undefined, fallbackToDefault: true): T;
    findByAttributes(attributes: AttributeMap | undefined, fallbackToDefault?: boolean): T | undefined;
}
