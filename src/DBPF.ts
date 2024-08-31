/**
 * DBPF Parser
 * 
 * DBPF is a file format used by Maxis in their games, including The Sims Series, SimCity, and Spore.
 * The following reader is an implementation of a DBPF reader in TypeScript.
 * 
 * The community spec for DBPF can be found at [spec/README.md](spec/README.md).
 */

/**
 * @ignore
 */
import {
    polyfill,
    deepFreeze,
    AggregateError
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
} from "./BufferStore"

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

/**
 * A magic number generator for DBPF files.
 * - used in the DBPF header.
 * - see: [spec/DBPF.md - Header](spec/DBPF.md#header)
 * 
 * @param string The string to convert to a 4-byte magic number.
 * @returns {Number} The magic number.
 */
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

/**
 * The magic number for DBPF files. DBBF files may use a different magic number.
 * - used in the DBPF header.
 * - see: [../spec/DBPF.md - Header](../spec/DBPF.md#header)
 */
const MAGICNUMBER:  FourBytes = MagicNumber("DBPF")
/**
 * The length of the DBPF header. This may need to change for different versions of the DBPF format.
 * - see: [../spec/DBPF.md - Header](../spec/DBPF.md#header)
 */
const HEADERLENGTH: FourBytes & BufferLength = 0x60 // 96 bytes

type Unused = any

type NullableError = Error | null | undefined
type ErrorOnlyCallback = ( error: NullableError ) => void

/**
 * The DBPF Header structure.
 * - see: [../spec/DBPF.md - Header](../spec/DBPF.md#header)
 */
export type DBPFHeader = {
    /**
     * Header information for the entire DBPF file.
     */
    dbpf: DBPFInfoHeader,
    /**
     * Header information for the index table.
     */
    index: DBPFIndexHeader,
    /**
     * Header information for the trash table (also referred to as the hole table).
     */
    trash: DBPFTrashHeader
}

/**
 * The DBPF Info Header structure.
 * 
 * This is a sub-structure of the parsed DBPF header.
 * - @see {@link DBPFHeader}
 */
export type DBPFInfoHeader = {
    /**
     * The major version of the DBPF file format.
     */
    major:      FourBytes,
    /**
     * The minor version of the DBPF file format.
     */
    minor:      FourBytes,
    /**
     * The major version provided by the user (supposedly used for modding).
     */
    usermajor:  FourBytes,
    /**
     * The minor version provided by the user (supposedly used for modding).
     */
    userminor:  FourBytes,

    /**
     * The date the DBPF file was created as tracked by the DBPF file itself.
     */
    created:    FourBytes,
    /**
     * The date the DBPF file was last modified as tracked by the DBPF file itself.
     */
    modified:   FourBytes,
}
/**
 * The DBPF Index Header structure.
 * 
 * This is a sub-structure of the parsed DBPF header.
 * - @see {@link DBPFHeader}
 */
export type DBPFIndexHeader = {
    /**
     * The major version of the index table.
     */
    major:      FourBytes,
    /**
     * The minor version of the index table.
     */
    minor:      FourBytes,

    /**
     * The number of entries in the index table.
     */
    count:      FourBytes,
    /**
     * The offset of the first entry in the index table (v1.x).
     */
    first:      FourBytes,

    /**
     * The size of the index table.
     */
    size:       FourBytes & BufferLength,
    /**
     * The offset of the index table (v2.0).
     */
    offset:     FourBytes & BufferOffset,
}
/**
 * The DBPF Trash Header structure.
 * 
 * This is a sub-structure of the parsed DBPF header.
 * - @see {@link DBPFHeader}
 */
export type DBPFTrashHeader = {
    /**
     * The number of holes in the DBPF file.
     */
    count:      FourBytes,
    offset:     FourBytes & BufferOffset,
    size:       FourBytes & BufferLength,
}

/**
 * The DBPF reader class.
 * 
 * This is the main class for the project. It is derived from the [Community Spec](../spec/DBPF.md).
 */
export class DBPF extends EventEmitter {
    /**
     * Creates a new DBPF reader asynchronously, evented.
     * @param { File | Blob | string } file The DBPF file to read.
     * @public
     */
    static create( file: File | Blob | PathString ): EventedPromise<DBPF>{
        const dbpf = new DBPF( file )
        return new EventedPromise<DBPF>((
            evented_resolve: (dbpf: DBPF) => void,
            evented_reject: ErrorOnlyCallback
        )=>{
            dbpf.init()
                .then(()=>evented_resolve( dbpf ))
                .catch(evented_reject)
        },{
            emit: dbpf.emit,
            events: {
                resolve: DBPF.ON_CREATE,
                reject: DBPF.ON_ERROR
            }
        })
    }
    /**
     * The internal constructor for the DBPF reader.
     * 
     * In JS, the constructor is public, but it is not recommended to use it directly.
     * Instead, use {@link DBPF.create}.
     * 
     * If you must use the constructor directly, ensure to await the {@link DBPF.init} method before using the instance.
     * 
     * @param { File | Blob | string } file The DBPF file to read.
     * @internal @deprecated
     */
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

    /**
     * Initializes the DBPF reader asynchronously, evented. Only intended for internal use, but is exposed for advanced users.
     * 
     * The body of this method contains the logic for reading the DBPF header and preparing the DBPF index table.
     * - see: [../spec/DBPF.md - Header](../spec/DBPF.md#header)
     * - see: [../spec/DBPF.md - The Tables](../spec/DBPF.md#the-tables)
     * @returns { EventedPromise<void> } An evented promise that resolves when the DBPF reader is initialized.
     * @public @deprecated use {@link DBPF.create} instead
     */
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

                this._table = await DBPFIndexTable.create( this )

                this._table.init()
                    .then(evented_resolve)
                    .catch(evented_reject)
            },
            {
                emit: this.emit,
                events: {
                    resolve: DBPF.ON_INIT,
                    reject: DBPF.ON_ERROR
                }
            }
        ))
    }
    protected _init: EventedPromise<void> | undefined;

    /**
     * The length of the DBPF header.
     * - @see {@link HEADERLENGTH}
     * @readonly
     */
    get headerLength(): BufferLength {
        // extension-class-proofing
        const _proto: typeof DBPF = obj_prototype( this ).constructor
        return _proto.HEADERLENGTH
    }
    protected static readonly HEADERLENGTH: BufferLength = HEADERLENGTH
    /**
     * The magic number for DBPF files.
     * - @see {@link MAGICNUMBER}
     * @readonly
     */
    get magic(): FourBytes {
        // extension-class-proofing
        const _proto: typeof DBPF = obj_prototype( this ).constructor
        return _proto.MAGICNUMBER
    }
    protected static readonly MAGICNUMBER: FourBytes = MAGICNUMBER

    /**
     * The path to the DBPF file.
     * @remarks
     * In the browser environment, this and {@link DBPF.filename} are the same.
     * @readonly
     */
    get filepath(): PathString {
        return this._filepath
    }
    private readonly _filepath: PathString;

    /**
     * The name of the DBPF file.
     * @remarks
     * In the browser environment, this and {@link DBPF.filepath} are the same.
     * @readonly
     */
    get filename(): PathString {
        return this._filepath.split(/[\/\\]/).pop() as PathString
    }
    /**
     * The extension of the DBPF file.
     * @readonly
     */
    get extension(): string {
        const segments = this.filename.split('.')
        if( segments.length < 2 )
            return ""
        return segments.pop() as string
    }

    /**
     * The size of the DBPF file.
     * @readonly
     */
    get filesize(): BufferLength {
        return this._filesize
    }
    private _filesize: BufferLength;

    /**
     * The DBPF header.
     * - @see {@link DBPFHeader}
     * - see [../spec/DBPF.md - Header](../spec/DBPF.md#header)
     * @readonly
     */
    protected _header: DBPFHeader | undefined;
    get header(): DBPFHeader {
        if( !this._header )
            throw new Error("DBPF not initialized. Try awaiting .init() first")
        return this._header
    }

    /**
     * The LFU+TTL Buffer cache for the DBPF file.
     * This is used to improve performance when reading large DBPF files.
     * - @see {@link BufferStore}
     * @readonly
     */
    protected _store: BufferStore
    /**
     * The DBPF Index Table.
     * - @see {@link DBPFIndexTable}
     * @readonly
     */
    get table(): DBPFIndexTable {
        if( !this._table )
            throw new Error("DBPF not initialized. Try awaiting .init() first")
        return this._table
    }
    protected _table: DBPFIndexTable | undefined;

    /**
     * The DBPFEntry plugins to apply to the DBPF file.
     * - @see {@link Plugins}
     * @readonly
     */
    readonly plugins: Plugins = new Plugins()

    /**
     * Returns a {@link IBufferReader} from the DBPF file (using the LFU+TTL cache) at the specified offset and length.
     * 
     * @param offset The offset to read from.
     * @param length The length to read.
     * @returns { IBufferReader } The buffer reader.
     */
    read( offset: BufferOffset, length: BufferLength ): IBufferReader{
        try {
            const out = this._store.get( offset, length )
            this.emit( "read", out )
            return out
        } catch( error ){
            this.emit( "error", error )
            throw error
        }
    }

    /**
     * The event name for when the DBPF reader is created properly.
     * @event
     */
    static readonly ON_CREATE = "create"
    /**
     * The event name for when the DBPF reader is initialized.
     * @event
     */
    static readonly ON_INIT = "init"
    /**
     * The event name for when the DBPF reader reads data.
     * @event
     */
    static readonly ON_READ = "read"
    /**
     * The event name for when the DBPF reader encounters an error.
     * @event
     */
    static readonly ON_ERROR = "error"
}

/**
 * This namespace provides types for the DBPF entry structure.
 * - see: [../spec/DBPF.md - Table Entries (AKA "DBPF Resources")](../spec/DBPF.md#table-entries-aka-dbpf-resources)
 * - @see {@link DBPFEntry}
 */
export namespace Resource {
    export type Type = FourBytes
    export type Group = FourBytes
    export namespace Instance {
        export type Number = FourBytes
        export type BigInt = EightBytes
    }
    export type Offset = FourBytes & BufferOffset
    export namespace Compression {
        export type Compressed = FourBytes & BufferLength
        export type Uncompressed = FourBytes & BufferLength
        export type Flag = TwoBytes
    }
}

/**
 * The DBPF Index Table class.
 * 
 * This class is a Map of DBPF entries.
 * - @see {@link DBPFEntry}
 * 
 * It implements an EventEmitter interface.
 * - @see {@link EventEmitter}
 */
export class DBPFIndexTable extends Map<number,Promise<DBPFEntry>> implements EventEmitter {

    /**
     * Creates a new DBPF Index Table asynchronously, evented.
     * @param DBPF The DBPF reader to read the index table from.
     * @returns { EventedPromise<DBPFIndexTable> } An evented promise that resolves when the DBPF Index Table is created.
     * @public
     */
    static create(
        DBPF: DBPF
    ): EventedPromise<DBPFIndexTable> {
        const self = new DBPFIndexTable( DBPF )
        return new EventedPromise<DBPFIndexTable>((
            evented_resolve: (table: DBPFIndexTable) => void,
            evented_reject: ErrorOnlyCallback
        )=>{
            self
                .init()
                .then(()=>evented_resolve( self ))
                .catch(evented_reject)
        },{
            emit: self.emit,
            events: {
                resolve: DBPFIndexTable.ON_CREATE,
                reject: DBPFIndexTable.ON_ERROR
            }
        })
    }

    private _DBPF: DBPF;
    private _reader: IBufferReader;

    private _offset: FourBytes & BufferOffset;

    /**
     * The size of the DBPF Index Table.
     * - see: [../spec/DBPF.md - Header](../spec/DBPF.md#header)
     * - @see {@link DBPFIndexHeader.size}
     */
    readonly length: FourBytes & BufferLength;

    // tsc doesn't like override readonly, for some reason
    private _size: FourBytes & BufferLength;
    override get size(): number {
        return this._size
    }

    /**
     * The internal constructor for the DBPF Index Table.
     * 
     * Much like the DBPF reader, this constructor is public, but it is not recommended to use it directly.
     * Instead, use {@link DBPF.create} which will create and await the DBPF Index Table for you.
     * 
     * If you must use the constructor directly, ensure to await the {@link DBPFIndexTable.init} method before using the instance.
     * 
     * @param DBPF The DBPF reader instance to read the index table from.
     * @internal @deprecated
     */
    private constructor(
        DBPF: DBPF
    ){
        // WIP - ensure this acceptably extends Map
        super()

        this._DBPF = DBPF

        this._offset = DBPF.header.index.offset

        // prevent collision with `extends Map` properties
        this.length = DBPF.header.index.size
        this._size = DBPF.header.index.count

        this._reader = DBPF.read( this._offset, this.length )

        this._emitter = new EventEmitter()
        this.on = (event, listener) => {
            this._emitter.on( event, listener )
            return this
        }
        this.off = (event, listener) => {
            this._emitter.off( event, listener )
            return this
        }
        this.emit = (event, ...args) => {
            let parent_emit: boolean;
            if( event === "error" ){
                args = new AggregateError( args, "DBPFIndexTable error" )
                parent_emit = DBPF.emit( "error", args )
            } else {
                parent_emit = DBPF.emit( `table_${event}`, ...args )
            }
            const self_emit = this._emitter.emit( event, ...args )
            return parent_emit && self_emit
        }
        this.once = (event, listener) => {
            this._emitter.once( event, listener )
            return this
        }

        // the rest is done by init() (called by static create) to handle async
    }

    /**
     * The DBPF v2.0 mode flag (AKA the "Index Table Type").
     * - see: [../spec/DBPF.md - DBPF v2.0](../spec/DBPF.md#dbpf-v20)
     * 
     * @readonly
     */
    get mode(): FourBytes {
        if( this._mode_flag == null )
            throw new Error("DBPFIndexTable not initialized");
        return this._mode_flag
    }
    private _mode_flag: FourBytes | undefined;
    /**
     * An array of indexes (in order) of where each header segment is reused in each entry.
     * - see: [../spec/DBPF.md - DBPF v2.0](../spec/DBPF.md#dbpf-v20)
     * - note: The header segments are shared segments between each entry, and are a way to save space in the DBPF file.
     *   - this means that the amount of bytes used by each entry is reduced by the amount of bytes used for the header segments.
     * 
     * @readonly
     */
    get headerSegments(): number[] {
        if( !this._header_segments )
            throw new Error("DBPFIndexTable not initialized")
        return Array.from( this._header_segments.keys() )
    }
    private _header_segments: Map<number,FourBytes> | undefined;
    /**
     * The amount of memory used by each entry in the DBPF file.
     * - see: [../spec/DBPF.md - DBPF v2.0](../spec/DBPF.md#dbpf-v20)
     * - note: That this may not be the full 32 bytes, as the header segments are shared and reused in each entry.
     */
    get entryLength(): number {
        if( !this._entry_length )
            throw new Error("DBPFIndexTable not initialized")
        return this._entry_length
    }
    private _entry_length: number | undefined;

    /**
     * Initializes the DBPF Index Table asynchronously, evented.
     * @returns { EventedPromise<void> } An evented promise that resolves when the DBPF Index Table is initialized.
     * @public @deprecated use {@link DBPFIndexTable.create} instead
     */
    init(): EventedPromise<void> {
        return this._init || (this._init = new EventedPromise<void>(async (
            evented_resolve: () => void,
            evented_reject: ErrorOnlyCallback
        )=>{
            try {
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
            } catch ( error ){
                evented_reject( error as Error )
            }

            evented_resolve()
        },{
            emit: this.emit,
            events: {
                resolve: DBPFIndexTable.ON_INIT,
                reject: DBPFIndexTable.ON_ERROR
            }
        }))
    }
    private _init: EventedPromise<void> | undefined;

    /**
     * @override @deprecated No-ops. Implemented for Map interface.
     */
    override set( key: number, value: Promise<DBPFEntry> ): this {
        throw new Error("DBPFIndexTable is read-only")
    }
    /**
     * @override @deprecated No-ops. Implemented for Map interface.
     */
    override delete( key: number ): boolean {
        throw new Error("DBPFIndexTable is read-only")
    }
    /**
     * @override @deprecated No-ops. Implemented for Map interface.
     */
    override clear(): void {
        throw new Error("DBPFIndexTable is read-only")
    }
    /**
     * Gets a DBPF entry from the DBPF Index Table by index
     * @param key 
     * @returns { EventedPromise<DBPFEntry> } An evented promise that resolves with the DBPF entry.
     * @override
     */
    override get( key: number ): EventedPromise<DBPFEntry> {
        return new EventedPromise<DBPFEntry>(async ()=>{

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
                
                const type:             FourBytes & Resource.Type                       = this._header_segments!.get(0) || await this._reader.getInt()
                const group:            FourBytes & Resource.Group                      = this._header_segments!.get(1) || await this._reader.getInt()
                const instance_high:    FourBytes & Resource.Instance.Number            = this._header_segments!.get(2) || await this._reader.getInt()
                const instance_low:     FourBytes & Resource.Instance.Number            = this._header_segments!.get(3) || await this._reader.getInt()
                const offset:           FourBytes & Resource.Offset                     = await this._reader.getInt()
                const size_file:        FourBytes & Resource.Compression.Compressed     = await this._reader.getInt()
                const size_memory:      FourBytes & Resource.Compression.Uncompressed   = await this._reader.getInt()
    
                const size_flag:        TwoBytes & Resource.Compression.Flag            = await this._reader.getShort()
                const unknown:          TwoBytes & Unused                               = await this._reader.getShort()
    
                const instance: EightBytes & Resource.Instance.BigInt = ( BigInt( instance_high ) << 32n ) | BigInt( instance_low )
    
                entry = new DBPFEntry(
                    this._DBPF,
                    type,
                    group,
                    instance,
                    offset,
                    {
                        file: size_file,
                        memory: size_memory,
                        flag: size_flag
                    }
                )
                entry = this._DBPF.plugins.filter( plugin => {
                    // WIP: implement plugin.filter logic
                }).reduce(( entry, plugin ) => plugin.script( entry ) as DBPFEntry, entry )
                super.set( key, Promise.resolve( entry ) )
            }
            return entry
        },{
            emit: this.emit,
            events: {
                resolve: DBPFIndexTable.ON_GET,
                reject: DBPFIndexTable.ON_ERROR
            }
        })
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

    private _emitter: EventEmitter;
    on: (event: string, listener: EventListener) => this
    off: (event: string, listener: EventListener) => this;
    emit: EventEmitMethod;
    once: (event: string, listener: EventListener) => this;

    /**
     * The event name for when the DBPF Index Table is created properly.
     * @event
     */
    static readonly ON_CREATE = "create"
    /**
     * The event name for when the DBPF Index Table is initialized.
     * @event
     */
    static readonly ON_INIT = "init"
    /**
     * The event name for when the DBPF Index Table retrieves an entry.
     */
    static readonly ON_GET = "get"
    /**
     * The event name for when the DBPF Index Table encounters an error.
     * @event
     */
    static readonly ON_ERROR = "error"
}

/**
 * The DBPF Entry class.
 * 
 * It is a representation of a DBPF resource.
 * - see: [../spec/DBPF.md - Table Entries (AKA "DBPF Resources")](../spec/DBPF.md#table-entries-aka-dbpf-resources)
 */
export class DBPFEntry {
    private _DBPF: DBPF;

    /**
     * The type id of the DBPF resource.
     */
    readonly type: FourBytes & Resource.Type;
    /**
     * The group id of the DBPF resource.
     */
    readonly group: FourBytes & Resource.Group;

    /**
     * The instance id of the DBPF resource.
     */
    readonly instance: EightBytes & Resource.Instance.BigInt | FourBytes & Resource.Instance.Number;
    /**
     * The offset of the DBPF resource in the DBPF file.
     */
    readonly offset: FourBytes & Resource.Offset;

    /**
     * The compression information about the DBPF resource.
     */
    readonly size: {
        /**
         * The amount of bytes the DBPF resource takes up in the DBPF file.
         */
        file: FourBytes & Resource.Compression.Compressed,
        /**
         * The amount of bytes the DBPF resource takes up uncompressed in memory.
         */
        memory: FourBytes & Resource.Compression.Uncompressed,
        /**
         * The compression flag of the DBPF resource.
         * - see: [../spec/DBPF.md - DBPF v2.0](../spec/DBPF.md#dbpf-v20)
         */
        flag: FourBytes & Resource.Compression.Flag
    };

    constructor(
        DBPF: DBPF,
        type: FourBytes & Resource.Type,
        group: FourBytes & Resource.Group,
        instance: EightBytes & Resource.Instance.BigInt | FourBytes & Resource.Instance.Number,
        offset: FourBytes & Resource.Offset,
        size: {
            file: FourBytes & Resource.Compression.Compressed,
            memory: FourBytes & Resource.Compression.Uncompressed,
            flag: FourBytes & Resource.Compression.Flag
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

/**
 * @see {@link DBPFEntry}
 */
export interface IDBPFEntry extends Omit<DBPFEntry, 'constructor'> {}

/**
 * This is the planned structure for the plugin system.
 * 
 * This is a WIP and is not yet implemented.
 * @experimental
 */
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

/**
 * @see {@link Plugin}
 * @experimental
 */
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

/**
 * Constant export for UMD
 */
export const dbpf = {
    DBPF,
    DBPFEntry
}