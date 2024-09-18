import * as Comlink from 'comlink';
import { LoadMap } from './LoadMap';
type GlobalEventEmitMethod = ( url: URL, event: string, ...args: any[] ) => void;

const DEFAULTS = {
    MIN_POOLSIZE: 2,
    MAX_POOLSIZE: 16,
    MAX_IDLE_TIME: 30 * 1000, // 30 seconds
    MAX_REQUEST_TIME: 1.5 * 1000 // 1.5 seconds
}

/**
 * TODOS:
 * 
 * request( url ): Promise<Reader>
 * 
 * reader( url, emitter ): ReaderResource
 * reader.URL
 * 
 * reader.emit( event, ...args ): void {
 *     globalEventEmitMethod( this.URL, event, ...args )
 * }
 */

// WIP - needs reader implementation
// No-op class
class ReaderResource {
    constructor(
        emitter: GlobalEventEmitMethod,
        lifecycle: {
            kill(): boolean;
            spawn(): ReaderResource | undefined;
        }
    ){}
    release( force_kill: boolean ): void {}
    idle(): void {}
}

/**
 * ReaderController
 * 
 * This class is responsible for managing the DBPF readers on this thread.
 */
class ReaderResourcePool {
    constructor(
        poolsize: number = DEFAULTS.MIN_POOLSIZE,
    ){
        if( typeof poolsize !== 'number' ){
            throw new TypeError( `Expected poolsize to be a number, received ${typeof poolsize}` );
        }
        if( poolsize < 1 ){
            throw new RangeError( `Expected poolsize to be greater than 0, received ${poolsize}` );
        }

        poolsize = Math.max( poolsize, DEFAULTS.MIN_POOLSIZE );
        poolsize = Math.min( poolsize, DEFAULTS.MAX_POOLSIZE );
        for( let i = 0; i < poolsize; i++ ){
            this.spawn();
        }
    }

    private _readers: ReaderResource[] = [];
    get readers(){
        return [...this._readers];
    }

    load: LoadMap = new LoadMap();

    // WIP - needs reader implementation
    spawn(
        force_spawn: boolean = false
    ): ReaderResource | undefined {
        if( force_spawn || this._readers.length <= DEFAULTS.MAX_POOLSIZE ){
            const reader = new ReaderResource(
                this._globalEmitter,
                {
                    kill: ()=>{
                        const id = this._readers.indexOf( reader )
                        if( id !== -1 ){
                            if( this._readers.length > DEFAULTS.MIN_POOLSIZE ){
                                this._readers.splice( id, 1 );
                                return true;
                            }
                        } else
                            return true;
                        return false;
                    },
                    spawn: this.spawn.bind( this )
                }
            );
            this._readers.push( reader );
            reader.idle();
            return reader;
        }
    }

    // Readers are released, not killed
    // - JS/TS resource can't be forcefully disposed
    // - this also allows for any lasting operations to complete before garbage collection
    release(
        reader: ReaderResource | number,
        force_release: boolean = false
    ): void {
        if( typeof reader === 'number' ){
            const id = reader
            this._readers[ id ]?.release( force_release )
        } else {
            return;
        }
    }
    releaseAll(
        readers: (ReaderResource | number)[] = this._readers,
    ): void {
        readers = readers.map( reader => {
            if( typeof reader === 'number' ){
                return this._readers[ reader ];
            } else {
                return reader;
            }
        }).filter(Boolean);
        (readers as ReaderResource[]).forEach( reader => {
            reader.release( true );
        });
    }

    private _selectResource( url: URL ): ReaderResource {
        return ({} as ReaderResource)
    }

    request( url: URL ): Promise<ReaderResource> {
        return new Promise(( resolve, reject )=>{
            // force async/non-blocking
            setTimeout(()=>{
                try{
                    resolve( this._selectResource( url ) );
                } catch( error ){
                    reject( error );
                }
            }, 0);
        })
    }
    
    private _globalEmitter: GlobalEventEmitMethod;
    setEmitter( emitter: GlobalEventEmitMethod ): void {
        this._globalEmitter = emitter;
    }
}