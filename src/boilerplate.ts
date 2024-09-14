const {
    freeze,
    getOwnPropertyNames: getProps,
} = Object;

/**
 * Operations
 * 
 * A utility class to perform operations on objects.
 */
export class Operations {
    /**
     * A function that recursively freezes an object.
     * 
     * @param obj The object to freeze
     * @returns The frozen object
     */
    static deepFreeze(obj: any) {
        const props = getProps( obj )
        for (const prop of props) {
            const value = obj[prop];
            if (value && typeof value === "object") {
                Operations.deepFreeze(value);
            }
        }
        return freeze(obj);
    }
}

/**
 * EngineDetails
 * 
 * A simple class to store useful information about the engine.
 */
export class EngineDetails {
    static supports = {
        /**
         * Whether the engine supports the `require` function.
         */
        require: typeof (globalThis.require || (typeof window !== "undefined" && window.require) || require) === 'function',
        /**
         * Whether the engine is Node.js.
         */
        node: !!(typeof process !== "undefined" && process.versions && process.release)
    }
}

console.log( EngineDetails.supports );

class AggregateError extends Error {
    errors: any[];
    constructor(errors: any[], message?: string, options?: { cause?: Error | string }) {
        super(message);
        this.errors = errors;
    }
    override name = 'AggregateError';
}

type EventListener = (...args: any[]) => void;
/**
 * @see {@link https://nodejs.org/api/events.html#emitteremiteventname-args}
 */
type EventEmitMethod = (event: string, ...args: any[]) => boolean;

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

export class Polyfills {
    static AggregateError = (globalThis as any).AggregateError as typeof AggregateError || AggregateError;
}

export namespace BufferExtras {
    /**
     * A number representing the offset of a buffer.
     */
    export type BufferOffset = number;
    /**
     * A number representing the length of a buffer.
     */
    export type BufferLength = number;
}

Operations.deepFreeze(Operations);
Operations.deepFreeze(EngineDetails);
freeze(Polyfills);
