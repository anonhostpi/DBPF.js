import { polyfill } from "./polyfill";
import { fs, Buffer } from "./polyfill.fs";
import { EventEmitter } from "./polyfill.events";
import { ByteBuffer } from "./bytebuffer";
import { Deserialized, JSONPrimitive } from "./serde";

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

const HEADERLENGTH: number = 0x60; // 96 bytes
const ENTRYLENGTH: number = 0x20; // 32 bytes

type NullableError = Error | null | undefined;
type Unused = any;

type DBPFCallback = (err: NullableError, dbpf?: DBPF) => void;
type ErrorOnlyCallback = (err: NullableError) => void;
type DBPFHeader = {
    dbpf: {
        major: number,
        minor: number,
        created: number,
        modified: number,
    }
    index: {
        major: number,
        minor: number,
        count: number,
        first: number,
        size: number,
        offset: number,
    }
    hole: {
        count: number,
        offset: number,
        size: number,
    }
}

function MagicByte( string: string ): number {
    string = string.padEnd( 4, '\0' );
    const chars = string.split('');
    let out = 0;
    for( let i = 0; i < chars.length; i++ ){
        out += chars[i].charCodeAt(0) << (i * 8);
    }
    return out;
}

export class DBPF extends EventEmitter {
    static readonly magic: number = MagicByte("DBPF");
    public readonly magic: number = DBPF.magic; // for inheritance, in case I ever write a dbbf reader

    private _file: string | File = "";
    private _filepath: string = "";
    private _filename: string = "";
    private _extension: string = "";

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

    set file( file: string | File ){
        let blob: File | undefined;
        let filepath: string;
        if( file instanceof File ){
            blob = file;
            filepath = file.name;
        }
        else if( typeof file === "string" )
            filepath = file;
        else
            throw new Error(`DBPF: Invalid file: Invalid type for file argument`);

        if( !filepath.trim().length )
            throw new Error("DBPF: Invalid file: Nil filepath");
        // this.filepath = filepath;
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
            this.load();
    }

    private fullbuffer: Buffer | undefined;
    private headerbuffer: Buffer | undefined;
    private _header: DBPFHeader | undefined;
    get header(): DBPFHeader {
        if( !this._header )
            throw new Error("DBPF: No header data, try running load() or init() first");

        return this._header;
    }

    copy(): Buffer {
        if( !this.fullbuffer )
            throw new Error("DBPF: No buffer to copy, try running load() first");

        return Buffer.from( this.fullbuffer );
    }

    private _table: DBPFIndexTable | undefined;
    get table(): DBPFIndexTable {
        if( !this._table )
            throw new Error("DBPF: No index table, try running load() or init() first");

        return this._table;
    }

    private parseHeader(
        buffer: Buffer,
        callback?: ErrorOnlyCallback
    ): void {
        this.validate( callback );
        if( buffer.length < HEADERLENGTH ){
            const error = new Error("DBPF: Invalid buffer: Not enough data to parse the header");
            this.emit( "error", error );
            if( typeof callback === "function" )
                callback( error );
            else
                throw error;
        }

        this.headerbuffer = buffer.subarray( 0, HEADERLENGTH );
        const reader = new ByteBuffer( this.headerbuffer );

        const magic = reader.getInt(); // 0 -> 4 bytes

        if( magic !== this.magic ){
            const error = new Error("DBPF: Invalid buffer: Incorrect magic number");
            this.emit( "error", error );
            if( typeof callback === "function" )
                callback( error );
            else
                throw error;
        }

        const major = reader.getInt(); // 4 -> 8 bytes
        const minor = reader.getInt(); // 8 -> 12 bytes

        reader.advance( 12 ); // 12 -> 24 bytes
        const created = reader.getInt(); // 24 -> 28 bytes
        const modified = reader.getInt(); // 28 -> 32 bytes

        const index_major = reader.getInt(); // 32 -> 36 bytes
        const count = reader.getInt(); // 36 -> 40 bytes
        const first = reader.getInt(); // 40 -> 44 bytes
        const size = reader.getInt(); // 44 -> 48 bytes
        const hole_count = reader.getInt(); // 48 -> 52 bytes
        const hole_offset = reader.getInt(); // 52 -> 56 bytes
        const hole_size = reader.getInt(); // 56 -> 60 bytes
        const index_minor = reader.getInt(); // 60 -> 64 bytes
        const offset = reader.getInt(); // 64 -> 68 bytes

        this._header = {
            dbpf: {
                major,
                minor,
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

        this._table = new DBPFIndexTable( this );
    }

    constructor( file: string | File ){
        super();
        this.file = file;
    }

    validate( callback?: DBPFCallback ){
        if( !this.filepath.length ){
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
        length: number,
        offset: number = 0,
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
            if( this.file instanceof File ){
                const blobRead_promise = new Promise<Buffer>((
                    blobRead_resolve: (buffer: Buffer) => void,
                    blobRead_reject: (err: Error) => void
                ) => {
                    fs.read( this.file, out_buffer, 0, length, offset, (
                        err: NullableError,
                        bytesRead: Unused,
                        buffer: Unused
                    )=>{
                        if( err ){
                            blobRead_reject( new Error(`DBPF: Error reading file: ${err}`) );
                            return;
                        }
                        this.emit( "read", out_buffer );
                        blobRead_resolve( out_buffer );
                    });
                })

                blobRead_promise
                    .then( out_resolve )
                    .catch( emit_reject );
            } else if( !polyfill.isNode ){
                emit_reject( new Error("DBPF: Invalid file: In the browser, File must be a File object") );
            } else {
                const open_promise = new Promise<number>((
                    open_resolve: (fd: number) => void,
                    open_reject: (err: Error) => void
                ) => {
                    fs.open( this.filepath, 'r', (
                        err: NullableError,
                        fd: number | undefined
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
                    .then(( fd: number ) => {
                        const read_promise = new Promise<Buffer>((
                            read_resolve: (buffer: Buffer) => void,
                            read_reject: (err: Error) => void
                        )=>{
                            fs.read( fd, out_buffer, 0, length, offset, (
                                err: NullableError,
                                bytesRead: Unused,
                                buffer: Unused
                            )=>{
                                if( err ){
                                    read_reject( new Error(`DBPF: Error reading file: ${err}`) );
                                    return;
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
                    this.parseHeader( buffer, callback as ErrorOnlyCallback );
                    this.emit( "init", this );
                    out_resolve( this );
                })
                .catch( out_reject );
        })

        this._initializer = out;

        if( typeof callback === "function" )
            out.catch(( error: Error ) => {
                callback( error );
            });
        else
            return out;
    }

    // auto-promisified load method
    load( callback?: DBPFCallback ): void | Promise<DBPF> {
        this.validate( callback );

        const out: Promise<DBPF> = new Promise((
            out_resolve: (dbpf: DBPF) => void,
            out_reject: (err: Error) => void
        ) => {

            let filesize: number;

            if( this.file instanceof File )
                filesize = (this.file as File).size;
            else if( !polyfill.isNode )
                return out_reject( new Error("DBPF: Invalid file: In the browser, File must be a File object") );
            else
                filesize = fs.statSync( this.filepath ).size;

            this.read( filesize, 0, callback as ErrorOnlyCallback )
                .then(( buffer: Buffer ) => {
                    this.fullbuffer = buffer;
                    this.parseHeader( buffer, callback as ErrorOnlyCallback );
                    this.emit( "init", this );
                    this.emit( "load", this );
                    if( typeof callback === "function" )
                        callback( null, this );
                    out_resolve( this );
                })
        });

        this._initializer = out;

        if( typeof callback === "function" )
            out.catch(( error: Error ) => {
                callback( error );
            });
        else
            return out;
    }
}

type ResourceType = number;
type ResourceGroup = number;

export class DBPFEntry {
    // These fields are not part of the DBPF file format
    file: DBPF;

    // DBPF file format fields:
    // - categorization:
    type: ResourceType;
    group: ResourceGroup;

    // - index and identification:
    instance: number;
    offset: number;

    // - size:
    size: {
        file: number;
        memory: number;
        compressed: number;
    };

    // - unknown:
    unknown: number;

    constructor(
        file: DBPF,
        type: ResourceType,
        group: ResourceGroup,
        instance: number,
        offset: number,
        size: {
            file: number,
            memory: number,
            compressed: number
        },
        unknown: number
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
    private instance: DBPFIndexTable;
    private proxy: DBPFIndexTable;
    private _buffer: Buffer | undefined;
    private ready: Promise<void>;
    file: DBPF;

    init(): Promise<void>{
        return this.ready;
    }

    constructor(
        file: DBPF
    ){
        super();
        this.file = file;
        const table_offset = file.header.index.offset;
        const table_size = file.header.index.size;
        const table_count = file.header.index.count;

        this.ready = new Promise<void>((
            ready_resolve: () => void,
            ready_reject: (err: Error) => void
        )=>{
            file.read( table_size, table_offset ).then((
                buffer: Buffer
            )=>{
                this._buffer = buffer;
                ready_resolve();
            }).catch( ready_reject );
        }).then(()=>{
            this.emit( "init", this );
        }).catch(( error: Error )=>{
            this.emit( "error", error );
        });

        const entries = new Map<number, DBPFEntry>();
        const self = this.instance = this;

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

        return this.proxy = new Proxy( this, handler );
    }

    get(
        index: number
    ): DBPFExpandedEntry {
        if( !this.instance._buffer )
            throw new Error("DBPFIndexTable: No index table buffer, try awaiting init() first");

        const reader = new ByteBuffer( this.instance._buffer );

        reader.move( index * ENTRYLENGTH );

        const type: ResourceType = reader.getInt(); // 0 -> 4 bytes
        const group: ResourceGroup = reader.getInt(); // 4 -> 8 bytes
        const instance_low: number = reader.getInt(); // 8 -> 12 bytes
        const instance_high: number = reader.getInt(); // 12 -> 16 bytes
        const offset: number = reader.getInt(); // 16 -> 20 bytes
        const size_file: number = reader.getInt(); // 20 -> 24 bytes
        const size_memory: number = reader.getInt(); // 24 -> 28 bytes
        const size_compressed: number = reader.getShort(); // 28 -> 30 bytes
        const unknown: number = reader.getShort(); // 30 -> 32 bytes

        const instance = instance_high + instance_low;

        const base_entry = new DBPFEntry(
            this.instance.file,
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

    [index: number]: DBPFEntry;
}

export type DBPFExpandedEntry = DBPFEntry & {
    [key: string]: any;
}

// TypeScript doesn't allow us to extend a class with 2 parents, so we use typescript composition instead
// - this helps generate compiler errors for missing methods
type PluginsFinal = Array<Plugin> & Plugins;

class Plugins extends Deserialized { // extends Array<Plugin> via typescript composition
    private readonly instance: Plugins;
    private readonly proxy: PluginsFinal;

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

        const self = this.instance = this;

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

        return this.proxy = new Proxy( this, handler ) as PluginsFinal;
    }

    get length(): number {
        return this.instance._plugins.length;
    }

    pop(): Plugin | undefined {
        return this.instance._plugins.pop();
    }

    push( plugin: Plugin ): number {
        return this.instance._plugins.push( plugin );
    }

    shift(): Plugin | undefined {
        return this.instance._plugins.shift();
    }

    unshift( plugin: Plugin ): number {
        return this.instance._plugins.unshift( plugin );
    }

    concat( ...items: ConcatArray<Plugin>[] ): Plugin[] {
        return this.instance._plugins.concat( ...items );
    }

    slice( start?: number, end?: number ): Plugin[] {
        return this.instance._plugins.slice( start, end );
    }

    splice( start: number, deleteCount: number, ...items: Plugin[] ): Plugin[] {
        return this.instance._plugins.splice( start, deleteCount, ...items );
    }

    indexOf( searchElement: Plugin, fromIndex?: number ): number {
        return this.instance._plugins.indexOf( searchElement, fromIndex );
    }

    lastIndexOf( searchElement: Plugin, fromIndex?: number ): number {
        return this.instance._plugins.lastIndexOf( searchElement, fromIndex );
    }

    every<S extends Plugin>(
        predicate: (value: Plugin, index: number, array: Plugin[]) => value is S,
        thisArg?: any
    ): this is S[] {
        return this.instance._plugins.every( predicate, thisArg );
    }

    some( callback: (value: Plugin, index: number, array: Plugin[]) => boolean, thisArg?: any ): boolean {
        return this.instance._plugins.some( callback, thisArg );
    }

    forEach( callback: (value: Plugin, index: number, array: Plugin[]) => void, thisArg?: any ): void {
        this.instance._plugins.forEach( callback, thisArg );
    }

    map( callback: (value: Plugin, index: number, array: Plugin[]) => any, thisArg?: any ): any[] {
        return this.instance._plugins.map( callback, thisArg );
    }

    filter( callback: (value: Plugin, index: number, array: Plugin[]) => boolean, thisArg?: any ): Plugin[] {
        return this.instance._plugins.filter( callback, thisArg );
    }

    reduce(
        callback: (previousValue: Plugin, currentValue: Plugin, currentIndex: number, array: Plugin[]) => Plugin,
        initialValue?: Plugin
    ): Plugin {
        return this.instance._plugins.reduce( callback, initialValue as Plugin );
    }

    reduceRight(
        callback: (previousValue: Plugin, currentValue: Plugin, currentIndex: number, array: Plugin[]) => Plugin,
        initialValue?: Plugin
    ): Plugin {
        return this.instance._plugins.reduceRight( callback, initialValue as Plugin );
    }

    find( callback: (value: Plugin, index: number, array: Plugin[]) => boolean, thisArg?: any ): Plugin | undefined {
        return this.instance._plugins.find( callback, thisArg );
    }

    findIndex( callback: (value: Plugin, index: number, array: Plugin[]) => boolean, thisArg?: any ): number {
        return this.instance._plugins.findIndex( callback, thisArg );
    }

    includes( searchElement: Plugin, fromIndex?: number ): boolean {
        return this.instance._plugins.includes( searchElement, fromIndex );
    }

    keys(): IterableIterator<number> {
        return this.instance._plugins.keys();
    }

    values(): IterableIterator<Plugin> {
        return this.instance._plugins.values();
    }

    entries(): IterableIterator<[number, Plugin]> {
        return this.instance._plugins.entries();
    }

    join( separator?: string ): string {
        return this.instance._plugins.join( separator );
    }

    reverse(): Plugin[] {
        return this.instance._plugins.reverse();
    }

    sort( compareFn?: (a: Plugin, b: Plugin) => number ): Plugin[] {
        return this.instance._plugins.sort( compareFn );
    }

    fill( value: Plugin, start?: number, end?: number ): Plugin[] {
        return this.instance._plugins.fill( value, start, end );
    }

    copyWithin( target: number, start: number, end?: number ): Plugin[] {
        return this.instance._plugins.copyWithin( target, start, end );
    }

    flatMap( callback: (value: Plugin, index: number, array: Plugin[]) => any, thisArg?: any ): any[] {
        return this.instance._plugins.flatMap( callback, thisArg );
    }

    flat( depth?: number ): any[] {
        return this.instance._plugins.flat( depth );
    }

    at( index: number ): Plugin {
        return this.instance._plugins[index];
    }

    *[Symbol.iterator](): IterableIterator<Plugin>{
        for (let i = 0; i < this.instance.length; i++) {
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
    [key: number]: Plugin;
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
