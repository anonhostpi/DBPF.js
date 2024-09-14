import * as Comlink from 'comlink';
import { Endpoint } from 'comlink/dist/umd/protocol'
import nodeEndpoint from 'comlink/dist/umd/node-adapter.js'

import { EngineDetails } from "./boilerplate"

import { Worker } from 'worker_threads';

function linkedWorkerFactory(){
    let worker: Worker | Endpoint;
    if( EngineDetails.supports.node ){
        worker = new Worker( new URL( '../thread.js', import.meta.url ) ) // NodeJS
        worker = nodeEndpoint( worker );
    } else {
        worker = new Worker( new URL( '../thread', import.meta.url ) ) // Webpack 5
    }
    return Comlink.wrap( worker as Endpoint );
}

type ThreadType = ReturnType<typeof linkedWorkerFactory>;

export class ThreadPool {
    private _threads: ThreadType[] = [];
    get threads(){
        return [...this._threads];
    }

    constructor(
        poolSize: number,
    ) {
        if( typeof poolSize !== 'number' ){
            throw new TypeError('Expected a number');
        }
        if( poolSize < 1 ){
            throw new RangeError('Expected a number greater than 0');
        }
        for( let i = 0; i < poolSize; i++ ){
            this._threads.push( linkedWorkerFactory() );
        }
    }

    spawn(){
        const thread = linkedWorkerFactory();
        this._threads.push( thread );
        return thread;
    }

    kill( thread: ThreadType | number ){
        const index = typeof thread === 'number' ? thread : this._threads.indexOf( thread );
        if( index !== -1 ){
            this._threads.splice( index, 1 );
        }
    }
}