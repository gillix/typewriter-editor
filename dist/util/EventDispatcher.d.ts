export declare class EventDispatcher<T extends Record<string, any> = Record<string, Event>> {
    on<K extends keyof T>(type: K, listener: (event: T[K]) => any, options?: AddEventListenerOptions): void;
    on(type: string, listener: (event: Event) => any, options?: AddEventListenerOptions): void;
    off<K extends keyof T>(type: K, listener: (event: T[K]) => any, options?: AddEventListenerOptions): void;
    off(type: string, listener: (event: Event) => any, options?: AddEventListenerOptions): void;
    addEventListener<K extends keyof T>(type: K, listener: (event: T[K]) => any, options?: AddEventListenerOptions): void;
    addEventListener(type: string, listener: (event: Event) => any, options?: AddEventListenerOptions): void;
    removeEventListener<K extends keyof T>(type: K, listener: (event: T[K]) => any, options?: AddEventListenerOptions): void;
    removeEventListener(type: string, listener: (event: Event) => any, options?: AddEventListenerOptions): void;
    dispatchEvent(event: Event, catchErrors?: boolean): void;
}
