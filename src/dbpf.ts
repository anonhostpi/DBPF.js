import {
    polyfill,
    deepFreeze
} from "./polyfill";
import {
    fs,
    Buffer,
    BufferOffset,
    BufferLength,
    FileDescriptor,
} from "./polyfill.fs";
import { EventEmitter } from "./polyfill.events";
import {
    BufferReader,
    OneByte,
    TwoBytes,
    FourBytes,
    EightBytes,
} from "./bytebuffer";
import { Deserialized, JSONPrimitive } from "./serde";
import { PromiseSafeBufferCache } from "./buffercache";

let {
    resolve
} = polyfill(
    { resolve: (...paths: string[]) => paths.join("/") },
    "node:path"
)

const {
    assign: obj_assign,
    getOwnPropertyDescriptor: obj_getOwnPropertyDescriptor,
} = Object

const HEADERLENGTH: BufferLength = 0x60; // 96 bytes
const ENTRYLENGTH: BufferLength = 0x20; // 32 bytes

type NullableError = Error | null | undefined;
type Unused = any;

type IndexNumeric = number;
type ArraylikeLength = number;
type IterationCount = number;

type DBPFCallback = (err: NullableError, dbpf?: DBPF) => void;
type ErrorOnlyCallback = (err: NullableError) => void;
type DBPFHeader = {
    dbpf: {
        major: FourBytes,
        minor: FourBytes,
        usermajor: FourBytes,
        userminor: FourBytes,
        created: FourBytes,
        modified: FourBytes,
    }
    index: {
        major: FourBytes,
        minor: FourBytes,
        count: FourBytes,
        first: FourBytes,
        size: BufferLength, // 4 bytes
        offset: BufferOffset, // 4 bytes
    }
    hole: {
        count: FourBytes,
        offset: BufferOffset, // 4 bytes
        size: BufferLength, // 4 bytes
    }
}

function MagicByte( string: string ): FourBytes {
    string = string.padEnd( 4, '\0' );
    const chars = string.split('');
    let out = 0;
    for( let i = 0; i < chars.length; i++ ){
        out += chars[i].charCodeAt(0) << (i * 8);
    }
    return out;
}

export class DBPF extends EventEmitter {
    static readonly magic: FourBytes = MagicByte("DBPF");
    public readonly magic: FourBytes = DBPF.magic; // for inheritance, in case I ever write a dbbf reader

    private _file: string | File = "";
    private _filepath: string = "";
    private _filename: string = "";
    private _extension: string = "";
    private _filesize: BufferLength = 0;

    get file(): string | File {
        return this._file as string | File;
    }
    get filepath(): string {
        return this._filepath as string;
    }
    get filename(): string {
        return this._filename as string;
    }
    get extension(): string {
        return this._extension as string;
    }
    get filesize(): BufferLength {
        return this._filesize
    }

    set file( file: string | File ){
        let blob: File | undefined;
        let filepath: string;
        if( file instanceof File ){
            blob = file;
            filepath = file.name;
            this._filesize = file.size;
        }
        else if( typeof file === "string" ){
            filepath = file;
            this._filesize = fs.statSync( file ).size;
        }
        else
            throw new Error(`DBPF: Invalid file: Invalid type for file argument`);

        if( !filepath.trim().length )
            throw new Error("DBPF: Invalid file: Nil filepath");
        let filename = filepath.split('/').pop() as string;
        if( !filename.trim().length )
            throw new Error("DBPF: Invalid file: Cannot be a directory");
        let extension = filename.split('.').pop() as string;
        if( !extension.trim().length )
            throw new Error("DBPF: Invalid file: Filepath must have an extension");

        this._file = blob || filepath;
        this._filepath = filepath;
        this._filename = filename;
        this._extension = extension;

        if( file instanceof File )
            this.loadAll();
        else
            this.init();
    }

    private _fullbuffer: Buffer | undefined;

    // provides safe access to a defragged buffer cache via a mutex protected set method
    private _cache: PromiseSafeBufferCache = new PromiseSafeBufferCache();
    clearCache(): Promise<void> {
        return this._cache.clear();
    }

    private _header: DBPFHeader | undefined;
    get header(): DBPFHeader {
        if( !this._header )
            throw new Error("DBPF: No header data, try running load() or init() first");

        return this._header;
    }

    private _table: DBPFIndexTable | undefined;
    get table(): DBPFIndexTable {
        if( !this._table )
            throw new Error("DBPF: No index table, try running load() or init() first");

        return this._table;
    }

    private _parseHeader(
        buffer: Buffer,
        callback?: ErrorOnlyCallback
    ): Promise<void> {
        this.validate( callback );
        if( buffer.length < HEADERLENGTH ){
            const error = new Error("DBPF: Invalid buffer: Not enough data to parse the header");
            this.emit( "error", error );
            if( typeof callback === "function" )
                callback( error );
            else
                throw error;
        }

        const headerbuffer = buffer.subarray( 0, HEADERLENGTH );
        const reader = new BufferReader( headerbuffer );

        const magic: FourBytes = reader.getInt(); // 0 -> 4 bytes

        if( magic !== this.magic ){
            const error = new Error("DBPF: Invalid buffer: Incorrect magic number");
            this.emit( "error", error );
            if( typeof callback === "function" )
                callback( error );
            else
                throw error;
        }

        const major: FourBytes = reader.getInt(); // 4 -> 8 bytes
        const minor: FourBytes = reader.getInt(); // 8 -> 12 bytes
        const usermajor: FourBytes = reader.getInt(); // 12 -> 16 bytes
        const userminor: FourBytes = reader.getInt(); // 16 -> 20 bytes
        const unused: FourBytes = reader.getInt(); // 20 -> 24 bytes

        const created: FourBytes = reader.getInt(); // 24 -> 28 bytes
        const modified: FourBytes = reader.getInt(); // 28 -> 32 bytes

        const index_major: FourBytes = reader.getInt(); // 32 -> 36 bytes
        const count: FourBytes = reader.getInt(); // 36 -> 40 bytes
        const first: FourBytes = reader.getInt(); // 40 -> 44 bytes
        const size: BufferLength = reader.getInt(); // 44 -> 48 bytes
        const hole_count: FourBytes = reader.getInt(); // 48 -> 52 bytes
        const hole_offset: BufferOffset = reader.getInt(); // 52 -> 56 bytes
        const hole_size: BufferLength = reader.getInt(); // 56 -> 60 bytes
        const index_minor: FourBytes = reader.getInt(); // 60 -> 64 bytes
        const offset: BufferOffset = reader.getInt(); // 64 -> 68 bytes

        this._header = {
            dbpf: {
                major,
                minor,
                usermajor,
                userminor,
                created,
                modified
            },
            index: {
                major: index_major,
                minor: index_minor,
                count,
                first,
                size,
                offset
            },
            hole: {
                count: hole_count,
                offset: hole_offset,
                size: hole_size
            }
        }

        deepFreeze( this._header );

        this._table = new DBPFIndexTable( this );

        return this._table.init()
    }

    constructor( file: string | File ){
        super();
        if( typeof file === "string" )
            file = file.trim();
        if( file instanceof File || (typeof file === "string" && file.length && polyfill.isNode) ){
            this.file = file;
        } else
            throw new Error("DBPF: Invalid file: File must be a string (node-only) or a File object");
    }

    validate( callback?: DBPFCallback ){
        if( !this._filepath.length ){
            const error = new Error("DBPF: No file path provided");
            this.emit( "error", error );
            if( typeof callback !== "function" )
                throw error;
            else {
                callback( error );
                return;
            }
        }
    }

    read(
        length: BufferLength = this._filesize,
        offset: BufferOffset = 0,
        callback?: ErrorOnlyCallback
    ): Promise<Buffer> {
        this.validate( callback );

        const out_buffer = Buffer.alloc( length );

        const out: Promise<Buffer> = new Promise( async ( out_resolve, out_reject ) => {
            const emit_reject = ( error: Error ) => {
                this.emit( "error", error );
                if( typeof callback === "function" )
                    callback( error );
                out_reject( error );
            }

            if( this._fullbuffer ){
                const fullbuffer = this._fullbuffer;
                if( offset + length > fullbuffer.length ){
                    emit_reject( new Error("DBPF: Invalid read: Out of range") );
                    return;
                }
                const buffer = fullbuffer.subarray( offset, offset + length );
                this.emit( "read", buffer );
                out_resolve( buffer );
                return;
            }
            const existingbuffer = await this._cache.get( offset, length );

            if( existingbuffer ){
                this.emit( "read", existingbuffer );
                out_resolve( existingbuffer );
                return;
            }

            if( this._file instanceof File ){
                const blobRead_promise = new Promise<Buffer>((
                    blobRead_resolve: (buffer: Buffer) => void,
                    blobRead_reject: (err: Error) => void
                ) => {
                    fs.read( this._file, out_buffer, 0, length, offset, async (
                        err: NullableError,
                        bytesRead: Unused,
                        buffer: Unused
                    )=>{
                        if( err ){
                            blobRead_reject( new Error(`DBPF: Error reading file: ${err}`) );
                            return;
                        }
                        await this._cache.set( offset, out_buffer );
                        
                        if(
                            !this._fullbuffer &&
                            this._cache.count === 1 &&
                            this._cache.start === 0 &&
                            this._cache.end  >= this._filesize
                        ){
                            this._fullbuffer = await this._cache.get( 0, this._filesize );
                            this.emit( "load", this );
                        }
                        this.emit( "read", out_buffer );
                        blobRead_resolve( out_buffer );
                    });
                })

                blobRead_promise
                    .then( out_resolve )
                    .catch( emit_reject );
            } else {
                const open_promise = new Promise<FileDescriptor>((
                    open_resolve: (fd: FileDescriptor) => void,
                    open_reject: (err: Error) => void
                ) => {
                    fs.open( this._filepath, 'r', (
                        err: NullableError,
                        fd: FileDescriptor | undefined
                    )=>{
                        if( err ){
                            open_reject( new Error(`DBPF: Error opening file: ${err}`) );
                            return;
                        }
                        if( !fd ){
                            open_reject( new Error(`DBPF: Error opening file: Nil file descriptor`) );
                            return;
                        }
                        open_resolve( fd );
                    });
                });

                open_promise
                    .then(( fd: FileDescriptor ) => {
                        const read_promise = new Promise<Buffer>((
                            read_resolve: (buffer: Buffer) => void,
                            read_reject: (err: Error) => void
                        )=>{
                            fs.read( fd, out_buffer, 0, length, offset, async (
                                err: NullableError,
                                bytesRead: Unused,
                                buffer: Unused
                            )=>{
                                if( err ){
                                    read_reject( new Error(`DBPF: Error reading file: ${err}`) );
                                    return;
                                }
                                await this._cache.set( offset, out_buffer );
                                if(
                                    !this._fullbuffer &&
                                    this._cache.count === 1 &&
                                    this._cache.start === 0 &&
                                    this._cache.end  >= this._filesize
                                ){
                                    this._fullbuffer = await this._cache.get( 0, this._filesize );
                                    this.emit( "load", this );
                                }
                                this.emit( "read", out_buffer );
                                read_resolve( out_buffer );

                                const close_promise = new Promise<void>((
                                    close_resolve: () => void,
                                    close_reject: (err: Error) => void
                                )=>{
                                    fs.close( fd, ( err: NullableError ) => {
                                        if( err ){
                                            close_reject( new Error(`DBPF: Error closing file: ${err}`) );
                                            return;
                                        }
                                        close_resolve();
                                    });
                                });

                                close_promise.catch( emit_reject );
                            });
                        });

                        read_promise
                            .then( out_resolve )
                            .catch( emit_reject );
                    })
                    .catch( emit_reject );
            }
        });

        if( typeof callback === "function" )
            out.catch(( error: Error ) => {
                callback( error );
            });
        
        return out;
    }

    private _initializer: Promise<DBPF> | undefined;

    init( callback?: DBPFCallback ): void | Promise<DBPF> {
        this.validate( callback );

        const out: Promise<DBPF> = this._initializer ? this._initializer : new Promise<DBPF>((
            out_resolve: (dbpf: DBPF) => void,
            out_reject: (err: Error) => void
        )=>{
            this.read( HEADERLENGTH, 0, callback as ErrorOnlyCallback )
                .then(( buffer: Buffer ) => {
                    this._parseHeader( buffer, callback as ErrorOnlyCallback )
                        .then(()=>{
                            this.emit( "load", this );
                            out_resolve( this );
                        }).catch( out_reject );
                })
                .catch( out_reject );
        })

        this._initializer = out;

        if( typeof callback === "function" )
            out.then(( dbpf: DBPF ) => {
                callback( null, dbpf );
            }).catch(( error: Error ) => {
                callback( error );
            });
        else
            return out;
    }

    // auto-promisified load method
    loadAll( callback?: DBPFCallback ): void | Promise<DBPF> {
        this.validate( callback );

        const out: Promise<DBPF> = new Promise((
            out_resolve: (dbpf: DBPF) => void,
            out_reject: (err: Error) => void
        ) => {
            this.read( this.filesize, 0, callback as ErrorOnlyCallback )
                .then(( buffer: Buffer ) => {
                    this._fullbuffer = buffer;
                    this._parseHeader( buffer, callback as ErrorOnlyCallback )
                        .then(()=>{
                            this.emit( "init", this );
                            this.emit( "load", this );
                            out_resolve( this );
                        }).catch( out_reject );
                })
        });

        this._initializer = out;

        if( typeof callback === "function" )
            out.then(( dbpf: DBPF ) => {
                callback( null, dbpf );
            }).catch(( error: Error ) => {
                callback( error );
            });
        else
            return out;
    }
}

type ResourceType = FourBytes;
type ResourceGroup = FourBytes;

export class DBPFEntry {
    // These fields are not part of the DBPF file format
    file:       DBPF;

    // DBPF file format fields:
    // - categorization:
    type:       ResourceType; // FourBytes
    group:      ResourceGroup; // FourBytes

    // - index and identification:
    instance:   EightBytes;
    offset:     BufferOffset; // FourBytes

    // - size:
    size: {
        file:           FourBytes;
        memory:         FourBytes;
        compressed:     TwoBytes;
    };

    // - unknown:
    unknown:    TwoBytes;

    constructor(
        file:               DBPF,
        type:               ResourceType, // FourBytes
        group:              ResourceGroup, // FourBytes
        instance:           EightBytes,
        offset:             BufferOffset, // FourBytes
        size: {
            file:           FourBytes,
            memory:         FourBytes,
            compressed:     TwoBytes
        },
        unknown:            TwoBytes
    ){
        this.file = file;
        this.type = type;
        this.group = group;
        this.instance = instance;
        this.offset = offset;
        this.size = size;
        this.unknown = unknown;
    }
}

class DBPFIndexTable extends EventEmitter {
    static plugins: Plugins | undefined;
    private _instance: DBPFIndexTable;
    private _proxy: DBPFIndexTable;
    private _buffer: Buffer | undefined;
    private _ready: Promise<void>;
    file: DBPF;

    init(): Promise<void>{
        return this._ready;
    }

    constructor(
        file: DBPF
    ){
        super();
        this.file = file;
        const table_offset = file.header.index.offset;
        const table_size = file.header.index.size;
        const table_count = file.header.index.count;

        this._ready = new Promise<void>((
            ready_resolve: () => void,
            ready_reject: (err: Error) => void
        )=>{
            file.read( table_size - 4, table_offset + 4 ).then((
                buffer: Buffer
            )=>{
                this._buffer = buffer;
                ready_resolve();
            }).catch( ready_reject );
        }).then(()=>{
            this.emit( "init", this );
        }).catch(( error: Error )=>{
            this.emit( "error", error );
            throw error;
        });

        const entries = new Map<IndexNumeric, DBPFEntry>();
        const self = this._instance = this;

        const handler: ProxyHandler<DBPFIndexTable> = {
            get: function( target: Unused, prop: any ){
                const asnum = Number( prop );
                if( !isNaN( asnum ) )
                    prop = asnum;
                if( typeof prop === "string" ){
                    return (self as any)[prop];
                }
                if( entries.has( asnum ) ){
                    return entries.get( asnum ) as DBPFEntry;
                } else {
                    const entry = self.get( asnum );
                    entries.set( asnum, entry );
                    return entry;
                }
            },
            getOwnPropertyDescriptor: function( target: Unused, prop: any ){
                if( entries.has( Number( prop ) ) )
                    return {
                        value: entries.get( Number( prop ) ),
                        writable: false,
                        enumerable: true,
                        configurable: true
                    }
                else if( !isNaN( Number( prop ) ) ){
                    const entry = self.get( Number( prop ) );
                    entries.set( Number( prop ), entry );
                    return {
                        value: entry,
                        writable: false,
                        enumerable: true,
                        configurable: true
                    }
                } else
                    return obj_assign(
                        {},
                        obj_getOwnPropertyDescriptor( self, prop ),
                        { writable: false, configurable: true }
                    )
            },
            getPrototypeOf: function(){
                return DBPFIndexTable.prototype;
            },
            has: function( target: Unused, prop: any ){
                return Number( prop ) < table_count;
            },
            ownKeys: function( target: Unused ){
                const count = table_count
                return Array.from( { length: count }, (_, i) => i.toString() );
            }
        }

        return this._proxy = new Proxy( this, handler );
    }

    get(
        index: IndexNumeric
    ): DBPFExpandedEntry {
        if( !this._instance._buffer )
            throw new Error("DBPFIndexTable: No index table buffer, try awaiting init() first");

        const reader = new BufferReader( this._instance._buffer );

        reader.move( index * ENTRYLENGTH );

        const type:             ResourceType = reader.getInt(); // 0 -> 4 bytes
        const group:            ResourceGroup = reader.getInt(); // 4 -> 8 bytes
        const instance_high:    FourBytes = reader.getInt(); // 8 -> 12 bytes
        const instance_low:     FourBytes = reader.getInt(); // 12 -> 16 bytes
        const offset:           BufferOffset = reader.getInt(); // 16 -> 20 bytes
        const size_file:        FourBytes = reader.getInt(); // 20 -> 24 bytes
        const size_memory:      FourBytes = reader.getInt(); // 24 -> 28 bytes
        const size_compressed:  TwoBytes = reader.getShort(); // 28 -> 30 bytes
        const unknown:          TwoBytes = reader.getShort(); // 30 -> 32 bytes

        // instance is a 128-bit number
        // the low and high parts are concatenated as individual 64-bit hex numbers
        const instance:         EightBytes = BigInt( instance_low ) + (BigInt( instance_high ) << BigInt( 32 ));

        const base_entry = new DBPFEntry(
            this._instance.file,
            type,
            group,
            instance,
            offset,
            {
                file: size_file,
                memory: size_memory,
                compressed: size_compressed
            },
            unknown
        );

        let modified_entry = base_entry;
        if( DBPFIndexTable.plugins ){
            const plugins = DBPFIndexTable.plugins;
            for( const plugin of plugins ){
                const filters = plugin.filters;
                // check that the entry passes all filters
                for( const key in filters ){
                    if( key in modified_entry ){
                        if( modified_entry[key as keyof typeof modified_entry] !== filters[key] ){
                            modified_entry = plugin.module( modified_entry as DBPFExpandedEntry ) as DBPFExpandedEntry;
                            break;
                        }
                    }
                }
            }
        }

        return modified_entry as DBPFExpandedEntry;
    }

    [index: IndexNumeric]: DBPFEntry;
}

export type DBPFExpandedEntry = DBPFEntry & {
    [key: string]: any;
}

// TypeScript doesn't allow us to extend a class with 2 parents, so we use typescript composition instead
// - this helps generate compiler errors for missing methods
type PluginsFinal = Array<Plugin> & Plugins;

class Plugins extends Deserialized { // extends Array<Plugin> via typescript composition
    private readonly _instance: Plugins;
    private readonly _proxy: PluginsFinal;

    static override from(
        this: any,
        obj: any,
    ): Plugins {
        const self: any = this instanceof Plugins ? this : new Plugins( undefined );
        return Deserialized.from.call( self, obj ) as Plugins;
    }
    static override read(
        filepath?: string
    ): Plugins | void {
        filepath = (filepath ? resolve( filepath.trim() ) : "") as string;

        if( !filepath.length ){
            console.log(`Plugin-Deserializer: No file path provided`);
            return;
        }

        return new Plugins( filepath );
    }
    constructor(
        filepath?: string
    ){
        super( filepath );
        
        for( const key in this ){
            if( typeof key !== "number")
                continue;
            else {
                // validate that this[key].action is a path to a js file, do not validate the filters

                if( polyfill.isNode ){
                    const path = resolve( this[key].path.trim() );
                    if( !path.length ){
                        throw new Error(`Plugin-Deserializer: Invalid path for plugin ${key}`);
                    }
                    if( !fs.existsSync( path ) ){
                        throw new Error(`Plugin-Deserializer: Plugin not found: ${path}`);
                    }

                    this[key].path = path;
                }

                this[key].module = polyfill.require( this[key].path ) as (entry: DBPFExpandedEntry) => DBPFExpandedEntry;

                this._plugins.push( this[key] );

                delete this[key];
            }
        }

        const self = this._instance = this;

        const handler: ProxyHandler<Plugins> = {
            get: function( target: Unused, prop: any ){
                if( typeof prop === "string" )
                    return (self as any)[prop];
                if( typeof prop === "number" && prop < self.length )
                    return self._plugins[ prop ] as Plugin;
            },
            getOwnPropertyDescriptor: function( target: Unused, prop: any ){
                if( typeof prop === "number" && prop < self.length )
                    return {
                        value: self._plugins[ prop ],
                        writable: false,
                        enumerable: true,
                        configurable: true
                    }
                else
                    return obj_assign(
                        {},
                        obj_getOwnPropertyDescriptor( self, prop ),
                        { writable: false, configurable: true }
                    )
            },
            getPrototypeOf: function(){
                return Plugins.prototype;
            },
            has: function( target: Unused, prop: any ){
                return typeof prop === "number" && prop < self.length;
            },
            ownKeys: function( target: Unused ){
                return Array.from( self._plugins.keys() ) as any;
            }
        };

        (this as PluginsFinal); // to generate compiler errors for missing methods

        return this._proxy = new Proxy( this, handler ) as PluginsFinal;
    }

    get length(): ArraylikeLength {
        return this._instance._plugins.length;
    }

    pop(): Plugin | undefined {
        return this._instance._plugins.pop();
    }

    push( plugin: Plugin ): ArraylikeLength {
        return this._instance._plugins.push( plugin );
    }

    shift(): Plugin | undefined {
        return this._instance._plugins.shift();
    }

    unshift( plugin: Plugin ): ArraylikeLength {
        return this._instance._plugins.unshift( plugin );
    }

    concat( ...items: ConcatArray<Plugin>[] ): Plugin[] {
        return this._instance._plugins.concat( ...items );
    }

    slice( start?: IndexNumeric, end?: IndexNumeric ): Plugin[] {
        return this._instance._plugins.slice( start, end );
    }

    splice( start: IndexNumeric, deleteCount: IterationCount, ...items: Plugin[] ): Plugin[] {
        return this._instance._plugins.splice( start, deleteCount, ...items );
    }

    indexOf( searchElement: Plugin, fromIndex?: IndexNumeric ): IndexNumeric {
        return this._instance._plugins.indexOf( searchElement, fromIndex );
    }

    lastIndexOf( searchElement: Plugin, fromIndex?: IndexNumeric ): IndexNumeric {
        return this._instance._plugins.lastIndexOf( searchElement, fromIndex );
    }

    every<S extends Plugin>(
        predicate: (value: Plugin, index: IndexNumeric, array: Plugin[]) => value is S,
        thisArg?: any
    ): this is S[] {
        return this._instance._plugins.every( predicate, thisArg );
    }

    some( callback: (value: Plugin, index: IndexNumeric, array: Plugin[]) => boolean, thisArg?: any ): boolean {
        return this._instance._plugins.some( callback, thisArg );
    }

    forEach( callback: (value: Plugin, index: IndexNumeric, array: Plugin[]) => void, thisArg?: any ): void {
        this._instance._plugins.forEach( callback, thisArg );
    }

    map( callback: (value: Plugin, index: IndexNumeric, array: Plugin[]) => any, thisArg?: any ): any[] {
        return this._instance._plugins.map( callback, thisArg );
    }

    filter( callback: (value: Plugin, index: IndexNumeric, array: Plugin[]) => boolean, thisArg?: any ): Plugin[] {
        return this._instance._plugins.filter( callback, thisArg );
    }

    reduce(
        callback: (previousValue: Plugin, currentValue: Plugin, currentIndex: IndexNumeric, array: Plugin[]) => Plugin,
        initialValue?: Plugin
    ): Plugin {
        return this._instance._plugins.reduce( callback, initialValue as Plugin );
    }

    reduceRight(
        callback: (previousValue: Plugin, currentValue: Plugin, currentIndex: IndexNumeric, array: Plugin[]) => Plugin,
        initialValue?: Plugin
    ): Plugin {
        return this._instance._plugins.reduceRight( callback, initialValue as Plugin );
    }

    find( callback: (value: Plugin, index: IndexNumeric, array: Plugin[]) => boolean, thisArg?: any ): Plugin | undefined {
        return this._instance._plugins.find( callback, thisArg );
    }

    findIndex( callback: (value: Plugin, index: IndexNumeric, array: Plugin[]) => boolean, thisArg?: any ): IndexNumeric {
        return this._instance._plugins.findIndex( callback, thisArg );
    }

    includes( searchElement: Plugin, fromIndex?: IndexNumeric ): boolean {
        return this._instance._plugins.includes( searchElement, fromIndex );
    }

    keys(): IterableIterator<IndexNumeric> {
        return this._instance._plugins.keys();
    }

    values(): IterableIterator<Plugin> {
        return this._instance._plugins.values();
    }

    entries(): IterableIterator<[IndexNumeric, Plugin]> {
        return this._instance._plugins.entries();
    }

    join( separator?: string ): string {
        return this._instance._plugins.join( separator );
    }

    reverse(): Plugin[] {
        return this._instance._plugins.reverse();
    }

    sort( compareFn?: (a: Plugin, b: Plugin) => number ): Plugin[] {
        return this._instance._plugins.sort( compareFn );
    }

    fill( value: Plugin, start?: IndexNumeric, end?: IndexNumeric ): Plugin[] {
        return this._instance._plugins.fill( value, start, end );
    }

    copyWithin( target: IndexNumeric, start: IndexNumeric, end?: IndexNumeric ): Plugin[] {
        return this._instance._plugins.copyWithin( target, start, end );
    }

    flatMap( callback: (value: Plugin, index: IndexNumeric, array: Plugin[]) => any, thisArg?: any ): any[] {
        return this._instance._plugins.flatMap( callback, thisArg );
    }

    flat( depth?: IterationCount ): any[] {
        return this._instance._plugins.flat( depth );
    }

    at( index: IndexNumeric ): Plugin {
        return this._instance._plugins[index];
    }

    *[Symbol.iterator](): IterableIterator<Plugin>{
        for (let i = 0; i < this._instance.length; i++) {
            yield this[i] as Plugin;
        }
    }

    get [Symbol.unscopables]() {
        return {
            ...Array.prototype[Symbol.unscopables],
            length: false
        }
    }

    [Symbol.toStringTag](): string {
        return "Plugins";
    }

    [Symbol.isConcatSpreadable](): boolean {
        return true;
    }

    [Symbol.toPrimitive](): string {
        return JSON.stringify( this );
    }

    private _plugins: Plugin[] = [];
    [key: IndexNumeric]: Plugin;
}

class Plugin {
    filters: Record<string, JSONPrimitive>;
    path: string;
    module: (entry: DBPFExpandedEntry) => DBPFExpandedEntry;
    constructor(
        filters: Record<string, JSONPrimitive>,
        path: string
    ){
        this.filters = filters;

        if( polyfill.isNode ){
            const resolved = resolve( path.trim() );
            if( !resolved.length ){
                throw new Error(`Plugin-Deserializer: Invalid path for plugin`);
            }
            if( !fs.existsSync( resolved ) ){
                throw new Error(`Plugin-Deserializer: Plugin not found: ${resolved}`);
            }

            this.path = resolved;
        } else {
            this.path = path.trim();
            if( !this.path.length ){
                throw new Error(`Plugin-Deserializer: Invalid path for plugin`);
            }
        }

        this.module = polyfill.require( this.path ) as (entry: DBPFExpandedEntry) => DBPFExpandedEntry;
    }
}

export function load(
    pluginsFile: string
): Plugins | undefined {
    return DBPFIndexTable.plugins = Plugins.read( pluginsFile ) as Plugins | undefined;
}

// umd export
export const dbpf = {
    DBPF,
    load,
    DBPFEntry
}