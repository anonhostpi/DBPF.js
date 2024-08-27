import { polyfill } from "./polyfill";

export type EventListener = (...args: any[]) => void;
export type EventEmitMethod = (event: string, ...args: any[]) => boolean;

class _EventEmitter {
    private events?: { [key: string]: EventListener[] } = {}; // set as optional for the EventEmitter interface type

    on(event: string, listener: EventListener): this {
        if (!this.events![event]) {
            this.events![event] = [];
        }
        this.events![event].push(listener);
        return this;
    }

    off(event: string, listener: EventListener): this {
        if (!this.events![event]) return this;
        this.events![event] = this.events![event].filter(l => l !== listener);
        return this;
    }

    readonly emit: EventEmitMethod = (event: string, ...args: any[]) => {
        if (!this.events![event]) return false;
        this.events![event].forEach(listener => listener.apply(this, args));
        return true;
    }

    once(event: string, listener: EventListener): this {
        const onceListener: EventListener = (...args: any[]) => {
            this.off(event, onceListener);
            listener.apply(this, args);
        };
        this.on(event, onceListener);
        return this;
    }
}

let polyfills: any[] = [
    { EventEmitter: _EventEmitter }
]

if( polyfill.isNode )
    polyfills.push("node:events")

export const { EventEmitter } = polyfill(
    ...polyfills
) as {
    EventEmitter: typeof _EventEmitter
}
export type EventEmitter = _EventEmitter;
export type IEventEmitter = _EventEmitter;
