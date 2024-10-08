const dispatcherEvents = new WeakMap();
const onceListeners = new WeakMap();
export class EventDispatcher {
    on(type, listener, options) {
        this.addEventListener(type, listener, options);
    }
    off(type, listener, options) {
        this.removeEventListener(type, listener, options);
    }
    addEventListener(type, listener, options) {
        if (options?.once)
            listener = getOnceListener(this, type, listener, true);
        getEventListeners(this, type, true).add(listener);
    }
    removeEventListener(type, listener, options) {
        if (options?.once)
            listener = getOnceListener(this, type, listener);
        if (!listener)
            return;
        const events = getEventListeners(this, type);
        events && events.delete(listener);
    }
    dispatchEvent(event, catchErrors) {
        let stopped = false;
        if (event.bubbles) {
            event.stopImmediatePropagation = event.stopPropagation = () => (stopped = true);
        }
        const events = getEventListeners(this, event.type);
        if (!events)
            return;
        for (let listener of events) {
            if (catchErrors) {
                try {
                    listener.call(this, event);
                }
                catch (err) {
                    try {
                        this.dispatchEvent(new ErrorEvent('error', { error: err }));
                    }
                    catch (err) { }
                }
            }
            else {
                listener.call(this, event);
            }
            if (stopped)
                break;
        }
    }
}
function getEventListeners(obj, type, autocreate = false) {
    let events = dispatcherEvents.get(obj);
    if (!events && autocreate)
        dispatcherEvents.set(obj, (events = Object.create(null)));
    return (events && events[type]) || (autocreate && (events[type] = new Set()));
}
function getOnceListener(obj, type, listener, autocreate = false) {
    let events = onceListeners.get(obj);
    if (!events && autocreate)
        dispatcherEvents.set(obj, (events = Object.create(null)));
    const map = (events && events[type]) || (autocreate && (events[type] = new Map()));
    if (!map.has(listener) && autocreate) {
        const wrapper = (event) => {
            const events = getEventListeners(obj, type);
            events && events.delete(listener);
            listener.call(obj, event);
        };
        map.set(listener, wrapper);
    }
    return map && map.get(listener);
}
