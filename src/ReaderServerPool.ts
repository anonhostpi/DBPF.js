import * as Comlink from 'comlink';
import { Endpoint } from 'comlink/dist/umd/protocol'
import nodeEndpoint from 'comlink/dist/umd/node-adapter.js'

import { EngineDetails } from "./boilerplate"

import { Worker } from 'worker_threads';

const DEFAULTS = {
    MIN_POOLSIZE: 4,
    MAX_POOLSIZE: 16,
    MAX_IDLE_TIME: 30 * 1000, // 30 seconds
    MAX_REQUEST_TIME: 1.5 * 1000 // 1.5 seconds 
}

type EventEmitMethod = import("eventemitter3").EventEmitter["emit"];
export type GlobalEventEmitMethod = ( url: URL, event: string, ...args: any[] ) => void;

type RequestCallback = ( selected_reader: any ) => void;
type RequestGUID = string;

type GUIDArray = RequestGUID[] & {
    delete( request_id: RequestGUID ): void;
    generate(): RequestGUID;
}

class LoadMap extends Map<URL, GUIDArray> {
    get( url: URL ){
        let requests = super.get( url );
        if( !requests ){
            requests = (()=>{
                const array: RequestGUID[] = [];

                (array as GUIDArray).delete = ( request_id: RequestGUID ) => {
                    array.splice( array.indexOf( request_id ), 1 );
                    /* if( array.length === 0 ){ // performance cost is likely not worth it
                        this.delete( url );
                    } */
                }
                (array as GUIDArray).generate = () => {
                    const request_id = crypto.randomUUID();
                    array.push( request_id );
                    return request_id;
                }

                return array as GUIDArray;
            })()
            super.set( url, requests );
        }
        return requests;
    }
}

class ReaderServer {
    constructor(
        emitter: GlobalEventEmitMethod,
        lifecycle: {
            kill(): boolean;
            spawn(): ReaderServer | undefined;
        }
    ){
        let worker: Worker | Endpoint;
        if( EngineDetails.supports.node ){
            this._worker = worker = new Worker( new URL( '../ReaderServer.js', import.meta.url ) ) // NodeJS
            worker = nodeEndpoint( worker );
        } else {
            this._worker = worker = new Worker( new URL( '../ReaderServer', import.meta.url ) ) // Webpack 5
        }
        this._thread = Comlink.wrap( worker as Endpoint );

        (this._thread as any).setEmitter( emitter );

        this._lifecycle = lifecycle;
    }
    
    private _lifecycle: {
        kill(): boolean;
        spawn(): ReaderServer | undefined;
    }

    private _worker: Worker;
    private _thread: ReturnType<typeof Comlink.wrap>

    kill( force_kill: boolean = false ): void {
        if( this._lifecycle.kill() || force_kill ){
            this._worker.terminate();
            this._thread[ Comlink.releaseProxy ]();
        }
    }

    load: LoadMap = new LoadMap();
    total: number = 0;

    private _idleTimeout: NodeJS.Timeout | undefined;
    idle(): void{
        if( this._idleTimeout ){
            clearTimeout( this._idleTimeout );
            this._idleTimeout = undefined;
        }
        this._idleTimeout = setTimeout( () => {
            this.kill();
        }, DEFAULTS.MAX_IDLE_TIME );
    }

    async request( url: URL, callback: RequestCallback ): Promise<void> {
        clearTimeout( this._idleTimeout )
        this.total++;

        const requests = this.load.get( url )
        const request = requests.generate();

        const timeout = setTimeout(()=>{
            this._lifecycle.spawn()
        }, DEFAULTS.MAX_REQUEST_TIME );

        const reader = await (this._thread as any).request( url );
        callback( reader );

        clearTimeout( timeout );
        requests.delete( request );

        this.total--;

        if( this.total === 0 ){
            this.idle();
        }
    }
}

/**
 * Reader Thread Pool
 * 
 * A simple class to manage a pool of reader threads.
 * 
 * Each thread is a Web Worker (or Worker Thread in Node.js) that provides resources for reading DBPF files asynchronously.
 * 
 * Each of them contains a subpool of recyclable reader objects.
 * 
 * The intended load balancing pattern is to distribute the workload among threads with the following considerations:
 * - each thread should minimize the amount requests it takes for a given blob or file URL
 * - each thread should minimize the total amount of requests it takes
 * 
 * This doesn't mean that a thread *can't* take several requests for the same blob or file URL, but it should be avoided if possible.
 * 
 * The implemented load balancing pattern is an adjusted round-robin algorithm.
 * - The algorithm first searches for the thread with the least amount of requests for the given URL.
 * - If there are multiple threads with this amount, it selects the thread with the least amount of total requests.
 */
export class ReaderServerPool {

    constructor(
        poolsize: number = DEFAULTS.MIN_POOLSIZE
    ) {
        if( typeof poolsize !== 'number' ){
            throw new TypeError( `Expected poolsize to be a number, received ${typeof poolsize}` );
        }
        if( poolsize < 1 ){
            throw new RangeError(`Expected poolsize to be greater than 0, received ${poolsize}`);
        }

        poolsize = Math.max( poolsize, DEFAULTS.MIN_POOLSIZE );
        poolsize = Math.min( poolsize, DEFAULTS.MAX_POOLSIZE );

        for( let i = 0; i < poolsize; i++ ){
            this.spawn();
        }
    }

    private _servers: ReaderServer[] = [];
    get servers(){
        return [...this._servers];
    }

    spawn( 
        force_spawn: boolean = false
    ): ReaderServer | undefined {
        if( force_spawn || this._servers.length <= DEFAULTS.MAX_POOLSIZE ){
            const server = new ReaderServer(
                this._globalEmitter,
                {
                    kill: ()=>{
                        const id = this._servers.indexOf( server )
                        if( id !== -1 ){
                            if( this._servers.length > DEFAULTS.MIN_POOLSIZE ){
                                this._servers.splice( id, 1 );
                                return true;
                            }
                        } else
                            return true;
                        return false;
                    },
                    spawn: this.spawn.bind( this )
                }
            );
    
            this._servers.push( server );
            server.idle();
    
            return server;
        }
    }

    kill(
        server: ReaderServer | number,
        force_kill: boolean = false
    ): void {
        if( typeof server === 'number' ){
            const id = server
            this._servers[ id ]?.kill( force_kill )
        } else {
            server.kill( force_kill )
        }
    }

    killAll(
        servers: (ReaderServer | number)[] = this._servers
    ): void {
        servers = servers.map( server => {
            if( typeof server === "number" ){
                return this._servers[ server ]
            } else {
                return server
            }
        }).filter(Boolean);
        (servers as ReaderServer[]).forEach( server => {
            server.kill( true );
        })
    }

    private _selectServer( url: URL ){

        let selected = {
            server: 0,
            load: {
                url: Infinity,
                total: Infinity
            }
        }

        this._servers
            .forEach((
                server,
                index
            )=>{
                let total = server.total;
                let size = server.load.get( url )?.length || 0;

                /**
                 * Select the server with the least amount of requests for the given URL,
                 * and if there are multiple servers with the same amount of requests,
                 * select the server with the least amount of total requests.
                 */
                if( size < selected.load.url || (size === selected.load.url && total < selected.load.total) ){
                    selected.server = index;
                    selected.load.url = size;
                    selected.load.total = total;
                }
            })

        return this._servers[ selected.server ];
    }

    request( url: URL, callback: RequestCallback ): Promise<void>{
        return this._selectServer( url ).request( url, callback );
    }

    private _emitters: Map<URL, EventEmitMethod> = new Map();
    private _globalEmitter: GlobalEventEmitMethod = function(
        url: URL,
        event: string,
        ...args: any[]
    ){
        const emitter = this._emitters.get( url );
        if( emitter ){
            emitter( event, ...args );
        }
    }

    setEmitter( url: URL, emitter: EventEmitMethod ): void {
        this._emitters.set( url, emitter );
    }
}