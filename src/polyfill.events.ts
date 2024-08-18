import { polyfill } from "./polyfill";

export type EventListener = (...args: any[]) => void;

class _EventEmitter {
    private events: { [key: string]: EventListener[] } = {};

    on(event: string, listener: EventListener): this {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return this;
    }

    off(event: string, listener: EventListener): this {
        if (!this.events[event]) return this;
        this.events[event] = this.events[event].filter(l => l !== listener);
        return this;
    }

    emit(event: string, ...args: any[]): boolean {
        if (!this.events[event]) return false;
        this.events[event].forEach(listener => listener.apply(this, args));
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

const { EventEmitter } = polyfill(
    {
        EventEmitter: _EventEmitter
    },
    "events"
)

const out: typeof _EventEmitter = EventEmitter;

export { out as EventEmitter };