type EventEmitMethod = import("eventemitter3").EventEmitter["emit"];

/**
 * Evented Promisification
 * 
 * A Promise that emits events when resolved or rejected using a provided {@link EventEmitMethod} (EventEmitter.emit)
 */
type EmitterOptions = {
    emit: EventEmitMethod,
    events: {
        resolve: string,
        reject: string,
    }
}

const noOpEmitMethod: EventEmitMethod = (event: string | symbol, ...args: any[]) => false;

export class EventedPromise<T> extends Promise<T> {
    /**
     * @param executor The executor function to be passed to the Promise constructor 
     * @param emit An {@link EventEmitMethod} or an object with an emit method and events object or a set of options for emitting:
     * - emit: The method to emit events. @see {@link EventEmitMethod}
     * - events: An object with the keys `resolve` and `reject` that specify the event names to emit when resolving and rejecting. 
     */
    constructor(
        executor: (
            resolve: (value: T | PromiseLike<T>) => void,
            reject: (reason?: any) => void
        ) => void,
        emit: EventEmitMethod | EmitterOptions = {
            emit: noOpEmitMethod,
            events: {
                resolve: "resolve",
                reject: "reject"
            }
        }
    ){
        const options = typeof emit === "function" ?
            { emit, events: { resolve: "resolve", reject: "reject" } } : emit;

        function wrapped_executor (
            engine_provided_resolve: (value: T | PromiseLike<T>) => void,
            engine_provided_reject: (reason?: any) => void
        ){
            function emitting_resolve(value: T | PromiseLike<T>){
                engine_provided_resolve(value);
                options.emit(options.events.resolve, value);
            };
            function emitting_reject(reason?: any){
                engine_provided_reject(reason);
                options.emit(options.events.reject, reason);
            };
            try {
                const wrapped_out = executor(emitting_resolve, emitting_reject);
            } catch (e) {
                emitting_reject(e);
            }
        }

        super(wrapped_executor);
    }
}