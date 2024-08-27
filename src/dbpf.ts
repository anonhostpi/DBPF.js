import {
    polyfill,
    deepFreeze
} from "./polyfill";

import {
    fs
} from "./polyfill.fs";

import {
    EventEmitter,
    EventEmitMethod,
    EventedPromise
} from "./polyfill.events"

import {
    NodeBufferStore,
    BrowserBufferStore,
    BufferStore,

    IBufferReader,

    Buffer,
    BufferLength,
    BufferOffset,
    
    OneByte,
    TwoBytes,
    ThreeBytes,
    FourBytes,
    FiveBytes,
    SixBytes,
    SevenBytes,
    EightBytes,

    PathString
} from "./bufferstore"

import {
    Deserialized, 
    JSONPrimitive
} from "./serde"

let polyfills: any[] = [
    { resolve: (...paths: string[]) => paths.join("/") }
]

if( polyfill.isNode )
    polyfills.push("node:path")

let {
    resolve
} = polyfill(
    ...polyfills
) as typeof import("path")

const {
    assign: obj_assign,
    getOwnPropertyDescriptor: obj_descriptor,
    getPrototypeOf: obj_prototype,
} = Object

export function MagicNumber( string: string ): FourBytes {
    string = string.padEnd( 4, '\0' )
    let out = 0;
    string.split('').forEach((
        char,
        index
    )=>{
        out |= char.charCodeAt(0) << (index * 8)
    })
    return out
}

const MAGICNUMBER:  FourBytes = MagicNumber("DBPF")
const HEADERLENGTH: FourBytes & BufferLength = 0x60 // 96 bytes

type NullableError = Error | null | undefined
type Unused = any

type DBPFHeader = {
    dbpf: DBPFInfoHeader,
    index: DBPFIndexHeader,
    trash: DBPFTrashHeader
}

type ErrorOnlyCallback = ( error: NullableError ) => void
type DBPFInfoHeader = {
    major:      FourBytes,
    minor:      FourBytes,
    usermajor:  FourBytes,
    userminor:  FourBytes,

    created:    FourBytes,
    modified:   FourBytes,
}
type DBPFIndexHeader = {
    major:      FourBytes,
    minor:      FourBytes,

    count:      FourBytes,
    first:      FourBytes,

    size:       FourBytes & BufferLength,
    offset:     FourBytes & BufferOffset,
}
type DBPFTrashHeader = {
    count:      FourBytes,
    offset:     FourBytes & BufferOffset,
    size:       FourBytes & BufferLength,
}

export class DBPF extends EventEmitter {
    protected static readonly HEADERLENGTH: BufferLength = HEADERLENGTH
    protected static readonly MAGICNUMBER: FourBytes = MAGICNUMBER
    get headerLength(): BufferLength {
        // extension-class-proofing
        const _proto: typeof DBPF = obj_prototype( this ).constructor
        return _proto.HEADERLENGTH
    }
    get magic(): FourBytes {
        // extension-class-proofing
        const _proto: typeof DBPF = obj_prototype( this ).constructor
        return _proto.MAGICNUMBER
    }

    private _filepath: PathString;
    get filepath(): PathString {
        return this._filepath
    }
    get filename(): PathString {
        return this._filepath.split(/[\/\\]/).pop() as PathString
    }
    get extension(): string {
        const segments = this.filename.split('.')
        if( segments.length < 2 )
            return ""
        return segments.pop() as string
    }

    private _filesize: BufferLength;
    get filesize(): BufferLength {
        return this._filesize
    }

    protected _header: DBPFHeader | undefined;
    get header(): DBPFHeader {
        if( !this._header )
            throw new Error("DBPF not initialized. Try awaiting .init() first")
        return this._header
    }

    protected _store: BufferStore
    protected _table: DBPFIndexTable | undefined;
    get table(): DBPFIndexTable {
        if( !this._table )
            throw new Error("DBPF not initialized. Try awaiting .init() first")
        return this._table
    }
    readonly plugins: Plugins = new Plugins()
    
    private constructor( file: File | Blob | PathString ){
        super()
        if( !polyfill.isNode && typeof file === "string" )
            throw new TypeError("Cannot use string path in browser environment")

        if( typeof file === "string" ){
            file = resolve( file )
            this._filepath = file
            this._filesize = fs.statSync( file ).size as BufferLength
        } else {
            if( file instanceof File )
                this._filepath = file.name as PathString
            else
                this._filepath = "Unnamed DBPF Blob" as PathString
            this._filesize = file.size as BufferLength
        }

        this._store = new (BufferStore as typeof NodeBufferStore)( file ) as BufferStore
    }

    protected _init: EventedPromise<void> | undefined;
    init(): EventedPromise<void> {
        return this._init || (this._init = new EventedPromise<void>(async (
                evented_resolve: () => void,
                evented_reject: ErrorOnlyCallback
            )=>{
                const reader = this._store.get( 0, this.headerLength )

                const _magic = await reader.getInt();
                if( _magic !== this.magic )
                    return evented_reject( new Error("Invalid magic number") )

                const major: FourBytes = await reader.getInt()
                const minor: FourBytes = await reader.getInt()

                const usermajor: FourBytes = await reader.getInt()
                const userminor: FourBytes = await reader.getInt()

                const unused: FourBytes & Unused = await reader.getInt()

                const created: FourBytes = await reader.getInt()
                const modified: FourBytes = await reader.getInt()

                const index_major: FourBytes = await reader.getInt()
                const index_count: FourBytes = await reader.getInt()
                const index_first: FourBytes = await reader.getInt()
                const index_size: FourBytes & BufferLength = await reader.getInt()

                const hole_count: FourBytes = await reader.getInt()
                const hole_offset: FourBytes & BufferOffset = await reader.getInt()
                const hole_size: FourBytes & BufferLength = await reader.getInt()

                const index_minor: FourBytes = await reader.getInt()
                const index_offset: FourBytes & BufferOffset = await reader.getInt()

                const _header_dbpf: DBPFInfoHeader = {
                    major,
                    minor,
                    usermajor,
                    userminor,
                    created,
                    modified
                }

                const _header_index: DBPFIndexHeader = {
                    major: index_major,
                    minor: index_minor,
                    count: index_count,
                    first: index_first,
                    size: index_size,
                    offset: index_offset
                }

                const _header_trash: DBPFTrashHeader = {
                    count: hole_count,
                    offset: hole_offset,
                    size: hole_size
                }

                this._header = {
                    dbpf: _header_dbpf,
                    index: _header_index,
                    trash: _header_trash
                }

                deepFreeze( this._header )

                this._table = await DBPFIndexTable.create( this, this._store )

                this._table.init()
                    .then(evented_resolve)
                    .catch(evented_reject)
            },
            {
                emit: this.emit,
                events: {
                    resolve: "init",
                    reject: "error"
                }
            }
        ))
    }
    static async create( file: File | Blob | PathString ){
        const dbpf = new DBPF( file )
        await dbpf.init()
        return dbpf
    }
}

type ResourceType = FourBytes
type ResourceGroup = FourBytes
enum DBPFIndexMode {
    ShortFile = 0x01,
    LongFile = 0x02,
}

export class DBPFIndexTable extends Map<number,Promise<DBPFEntry>> implements EventEmitter {

    private _emitter: EventEmitter;
    on: (event: string, listener: EventListener) => this
    off: (event: string, listener: EventListener) => this;
    emit: EventEmitMethod;
    once: (event: string, listener: EventListener) => this;

    private _DBPF: DBPF;
    private _reader: IBufferReader;

    private _offset: FourBytes & BufferOffset;
    readonly length: FourBytes & BufferLength;

    // tsc doesn't like override readonly, for some reason
    private _size: FourBytes & BufferLength;
    override get size(): number {
        return this._size
    }

    private constructor(
        DBPF: DBPF,
        store: BufferStore
    ){
        // WIP - ensure this acceptably extends Map
        super()

        this._DBPF = DBPF

        this._offset = DBPF.header.index.offset

        // prevent collision with `extends Map` properties
        this.length = DBPF.header.index.size
        this._size = DBPF.header.index.count

        this._reader = store.get( this._offset, this.length )

        this._emitter = new EventEmitter()
        this.on = (event, listener) => {
            this._emitter.on( event, listener )
            return this
        }
        this.off = (event, listener) => {
            this._emitter.off( event, listener )
            return this
        }
        this.emit = this._emitter.emit
        this.once = (event, listener) => {
            this._emitter.once( event, listener )
            return this
        }

        // the rest is done by init() (called by static create) to handle async
    }

    
    private _mode_flag: FourBytes | undefined;
    get mode(): FourBytes {
        if( this._mode_flag == null )
            throw new Error("DBPFIndexTable not initialized");
        return this._mode_flag
    }
    private _header_segments: Map<number,FourBytes> | undefined;
    get headerSegments(): number[] {
        if( !this._header_segments )
            throw new Error("DBPFIndexTable not initialized")
        return Array.from( this._header_segments.keys() )
    }
    private _entry_length: number | undefined;
    get entryLength(): number {
        if( !this._entry_length )
            throw new Error("DBPFIndexTable not initialized")
        return this._entry_length
    }
    // async constructor helpers
    private _init: Promise<void> | undefined;
    async init(){
        return this._init || (this._init = (async ()=>{
            this._mode_flag = await this._reader.getInt() // also referred to as type by other tools like SimPE and s4pi

            // according to s4pi, the size of the header entry is determined by the number of set bits
            // ... in the 4 least significant bits in the mode flag
            // - the size is variable from 0 to 4 4-byte segments
            // - see: https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi/Package/PackageIndex.cs#L38-L46
            
            /*
                According to s4pi, the resultant entries are of the same *total* size.
                The amount of memory used by the entries (in the file) varies based on the above math.
                
                The first chunk of data after the mode flag is the header entry. This is a partial entry that
                    all full entries are based on.

                The amount of 4-byte segments in the header entry is determined by the number of set bits in
                    the 4 least significant bits of the mode flag (note that the mode flag is 8 bytes or 32 bits long)

                The bits for binary nums 8, 4, 2, and 1 (bit indexes 3, 2, 1, and 0 respectively) determine what parts of
                    each full entry are pulled from the partial header entry.

                For example, for mode flag '3' (0b0011), 2 bits are set, so the header entry is only 2 4-byte segments long.
                Since, the set bits are in bits 1 and 2 ("right-to-left" order),
                    the placement of the first and second header segments are the 1st and 2nd 4-byte
                    segments of each entry respectively.
                
                For mode flag '6' (0b0110), 2 bits are also set, so the header is 2 still just 4-byte segments long.
                However, the set bits are in bits 2 and 3, so the placement of the first and second
                    shared header segments are in the 2nd and 3rd 4-byte segments of each entry respectively.
                    The first 4-byte segment is read normally from each entry iteration.
            */
            
            // binary math (based on s4pi):
            const set_bits = Array
                .from({length: Uint32Array.BYTES_PER_ELEMENT }) // form an undefined[] array with a length based on sizeof(uint)
                .map((unused, index) => index) // convert to an incrementing number array [0,1,2,...sizeof(uint)]
                .filter(index => ((this._mode_flag as FourBytes) >> index) & 1) // filter the 4 least significant bits for set bits
                // return their indexes
            
            this._header_segments = new Map<number,FourBytes>()
            for( let bit of set_bits ){
                const value = await this._reader.getInt()
                this._header_segments.set( bit, value )
            }
            const total_header_length = 4 + (4 * set_bits.length) // 4 bytes for mode flag integer + 4 for each header segment
            this._entry_length = ( this.length - total_header_length ) / this.size

            // ensure my math is right:
            if( this._entry_length % 4 )
                throw new Error(`Invalid entry length: ${this._entry_length}`)
        })());
    }
    static async create(
        DBPF: DBPF,
        store: BufferStore
    ){
        const table = new DBPFIndexTable( DBPF, store )
        await table.init()
        return table
    }

    // read-only overrides for Map<number,DBPFEntry>
    override set( key: number, value: Promise<DBPFEntry> ): this {
        throw new Error("DBPFIndexTable is read-only")
    }
    override delete( key: number ): boolean {
        throw new Error("DBPFIndexTable is read-only")
    }
    override clear(): void {
        throw new Error("DBPFIndexTable is read-only")
    }

    override async get( key: number ): Promise<DBPFEntry> {

        // TODO: This (and .init()) needs to be adapted for DBPF v1.x, currently this only supports v2.0 logic
        /*
        DBPF v1.x uses:
        - DBPF.header.index.first instead of DBPF.header.index.offset
        - entry size is determined by DBPF.header.index.minor instead of the mode flag
        - shorter entries (20/24 bytes instead of 32) often with 4 byte instances instead of 8
        */

        if( !this.has( key ) )
            throw new RangeError("Index out of bounds")

        await this._init

        let entry = await super.get( key )
        if( !entry ){
            this._reader.move( 4 + (4 * (this._header_segments!.size)) )
            this._reader.advance( this.entryLength * key )
            
            const type:             FourBytes & ResourceType    = this._header_segments!.get(0) || await this._reader.getInt()
            const group:            FourBytes & ResourceGroup   = this._header_segments!.get(1) || await this._reader.getInt()
            const instance_high:    FourBytes                   = this._header_segments!.get(2) || await this._reader.getInt()
            const instance_low:     FourBytes                   = this._header_segments!.get(3) || await this._reader.getInt()
            const offset:           FourBytes & BufferOffset    = await this._reader.getInt()
            const size_file:        FourBytes & BufferLength    = await this._reader.getInt()
            const size_memory:      FourBytes & BufferLength    = await this._reader.getInt()

            const size_compressed:  TwoBytes & BufferLength     = await this._reader.getShort()
            const unknown:          TwoBytes & Unused           = await this._reader.getShort()

            const instance: EightBytes = ( BigInt( instance_high ) << 32n ) | BigInt( instance_low )

            entry = new DBPFEntry(
                this._DBPF,
                type,
                group,
                instance,
                offset,
                {
                    file: size_file,
                    memory: size_memory,
                    compressed: size_compressed
                }
            )
            entry = this._DBPF.plugins.filter( plugin => {
                // WIP: implement plugin.filter logic
            }).reduce(( entry, plugin ) => plugin.script( entry ) as DBPFEntry, entry )
            super.set( key, Promise.resolve( entry ) )
        }
        return entry
    }

    override has( key: number ): boolean {
        return key >= 0 && key < this.size
    }

    override keys(): IterableIterator<number> {
        return Array.from({length: this.size}, (_, index) => index).values()
    }

    override values(): IterableIterator<Promise<DBPFEntry>> {
        return Array.from({length: this.size}, (_, index) => this.get( index )).values()
    }

    override entries(): IterableIterator<[number, Promise<DBPFEntry>]> {
        if( this.size !== super.size ){
            for( let index = 0; index < this.size; index++ ){
                this.get( index )
            }
        }
        return super.entries()
    }

    override forEach(
        callbackfn: (value: Promise<DBPFEntry>, key: number, map: Map<number, Promise<DBPFEntry>>) => void,
        thisArg?: any
    ): void {
        if( this.size !== super.size ){
            for( let index = 0; index < this.size; index++ ){
                this.get( index )
            }
        }
        super.forEach( callbackfn, thisArg )
    }

    override [Symbol.iterator](): IterableIterator<[number, Promise<DBPFEntry>]> {
        return this.entries()
    }
}

export class DBPFEntry {
    private _DBPF: DBPF;

    readonly type: FourBytes & ResourceType;
    readonly group: FourBytes & ResourceGroup;

    readonly instance: EightBytes;
    readonly offset: FourBytes & BufferOffset;

    readonly size: {
        file: FourBytes & BufferLength,
        memory: FourBytes & BufferLength
        compressed: FourBytes & BufferLength
    };

    constructor(
        DBPF: DBPF,
        type: FourBytes & ResourceType,
        group: FourBytes & ResourceGroup,
        instance: EightBytes,
        offset: FourBytes & BufferOffset,
        size: {
            file: FourBytes & BufferLength,
            memory: FourBytes & BufferLength,
            compressed: FourBytes & BufferLength
        }
    ){
        this._DBPF = DBPF;
        this.type = type;
        this.group = group;
        this.instance = instance;
        this.offset = offset;
        this.size = size;
        deepFreeze( this.size );
    }
}

export interface IDBPFEntry extends Omit<DBPFEntry, 'constructor'> {}

class Plugin extends Deserialized {
    filters!: Record<string, JSONPrimitive>; // set by super
    path: PathString;
    script: (entry: IDBPFEntry) => IDBPFEntry = (entry: IDBPFEntry) => entry;

    static override from(
        this: any,
        obj: any,
    ): Plugin {
        const self: any = this instanceof Plugin ? this : new Plugin( undefined );
        return Deserialized.from.call( self, obj ) as Plugin;
    }
    static override read(
        filepath?: string
    ): Plugin | void {
        filepath = (filepath ? resolve( filepath.trim() ) : "") as string;

        if( !filepath.length ){
            console.log(`Plugin-Deserializer: No file path provided`);
            return;
        }

        return new Plugin( filepath );
    }

    constructor( filepath?: string ){
        super( filepath );

        this.path = filepath as PathString;
    }
}

class Plugins extends Array<Plugin> {
    override push( ...items: (Plugin | string)[] ): number {
        return super.push( ...items.map( item => {
            if( typeof item === "string" )
                return Plugin.read( item ) as Plugin;
            return item;
        }));
    }
    override unshift( ...items: (Plugin | string)[] ): number {
        return super.unshift( ...items.map( item => {
            if( typeof item === "string" )
                return Plugin.read( item ) as Plugin;
            return item;
        }));
    }
    override indexOf( item: Plugin | string, fromIndex?: number ): number {
        if( typeof item === "string" )
            super.slice( fromIndex ).findIndex( plugin => plugin.path === item );
        return super.indexOf( item as Plugin, fromIndex );
    }
    override lastIndexOf( item: Plugin | string, fromIndex?: number): number {
        if( typeof item === "string" )
            super.slice( 0, fromIndex )
                .map(( plugin, index ) => [plugin, index])
                .reverse()
                .find(([plugin]) => (plugin as Plugin).path === item )?.[1] || -1;
        return super.lastIndexOf( item as Plugin, fromIndex );
    }
    override includes( item: Plugin | string, fromIndex?: number ): boolean {
        if( typeof item === "string" )
            super.slice( fromIndex ).some( plugin => plugin.path === item );
        return super.includes( item as Plugin, fromIndex );
    }
    override fill( value: Plugin | string, start?: number, end?: number ): this {
        throw new Error("Do not mass-overwrite plugins");
    }
}

// umd export
export const dbpf = {
    DBPF,
    DBPFEntry
}