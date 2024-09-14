/**
 * DBPF Parser
 * 
 * DBPF is a file format used by Maxis in their games, including The Sims Series, SimCity, and Spore.
 * The following reader is an implementation of a DBPF reader in TypeScript.
 * 
 * The community spec for DBPF can be found at [docs/spec/README.md](docs/spec/README.md).
 */

import {
    Operations,
    EngineDetails,
    Polyfills,
} from "./boilerplate";

import * as fs from "fs";

import {
    EventedPromise
} from "./EventedPromise"

import {
    EventEmitter
} from "eventemitter3"

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

import {
    resolve,
    isAbsolute
} from "path"

import * as Threading from "./Threading"

const {
    assign: obj_assign,
    getOwnPropertyDescriptor: obj_descriptor,
    getPrototypeOf: obj_prototype,
} = Object

/**
 * A magic number generator for DBPF files in little-endian byte order.
 * - used in the DBPF header.
 * - see: [docs/spec/DBPF.md - Header](docs/spec/DBPF.md#header)
 * 
 * @param string The string to convert to a 4-byte magic number.
 * @returns {Number} The magic number.
 */
export function MagicNumberLE( string: string ): FourBytes {
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
 * A magic number generator for DBPF files in big-endian byte order.
 * - used in the DBPF header.
 * - see: [docs/spec/DBPF.md - Header](docs/spec/DBPF.md#header)
 * 
 * @param string The string to convert to a 4-byte magic number.
 * @returns {Number} The magic number.
 */
export function MagicNumberBE( string: string ): FourBytes {
    string = string.padEnd( 4, '\0' )
    let out = 0;
    string.split('').reverse().forEach((
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
 * - see: [../docs/spec/DBPF.md - Header](../docs/spec/DBPF.md#header)
 */
const MAGICNUMBER:  FourBytes = MagicNumberLE("DBPF")
/**
 * The length of the DBPF header. This may need to change for different versions of the DBPF format.
 * - see: [../docs/spec/DBPF.md - Header](../docs/spec/DBPF.md#header)
 */
const HEADERLENGTH: FourBytes & BufferLength = 0x60 // 96 bytes

type Unused = any

type NullableError = Error | null | undefined
type ErrorOnlyCallback = ( error: NullableError ) => void

/**
 * The DBPF Header structure.
 * - see: [../docs/spec/DBPF.md - Header](../docs/spec/DBPF.md#header)
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
 * This is the main class for the project. It is derived from the [Community Spec](../docs/spec/DBPF.md).
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
        if( !EngineDetails.supports.node && typeof file === "string" )
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
     * - see: [../docs/spec/DBPF.md - Header](../docs/spec/DBPF.md#header)
     * - see: [../docs/spec/DBPF.md - The Tables](../docs/spec/DBPF.md#the-tables)
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

                Operations.deepFreeze( this._header )

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
     * - see [../docs/spec/DBPF.md - Header](../docs/spec/DBPF.md#header)
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
     * 
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
     * 
     * These are applied in order to each entry in the DBPF file.
     * - @see {@link Plugins}
     * @readonly
     */
    readonly plugins: PluginsList = (()=>{
        const list = new PluginsList()
        list.push( ...PluginsList.default )
        return list
    })()

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
 * - see: [../docs/spec/DBPF.md - Table Entries (AKA "DBPF Resources")](../docs/spec/DBPF.md#table-entries-aka-dbpf-resources)
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
     * - see: [../docs/spec/DBPF.md - Header](../docs/spec/DBPF.md#header)
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
        super()

        this._DBPF = DBPF

        this._offset = DBPF.header.dbpf.major === 1 ? DBPF.header.index.first : DBPF.header.index.offset

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
        this.emit = (event, ...args: any ) => {
            let _event = event as string
            let parent_emit: boolean;
            if( _event === "error" ){
                args = new Polyfills.AggregateError( args, "DBPFIndexTable error" )
                parent_emit = DBPF.emit( "error", args )
            } else {
                parent_emit = DBPF.emit( `table_${_event}`, ...args )
            }
            const self_emit = this._emitter.emit( _event, ...args )
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
     * - see: [../docs/spec/DBPF.md - DBPF v2.0](../docs/spec/DBPF.md#dbpf-v20)
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
     * - see: [../docs/spec/DBPF.md - DBPF v2.0](../docs/spec/DBPF.md#dbpf-v20)
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
     * - see: [../docs/spec/DBPF.md - DBPF v2.0](../docs/spec/DBPF.md#dbpf-v20)
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
            if( this._DBPF.header.dbpf.major === 1 ){
                if( this._DBPF.header.dbpf.minor === 1 )
                    this._entry_length = 24   
                else 
                    this._entry_length = 20
            } else {
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
        return new EventedPromise<DBPFEntry>(async (
            evented_resolve: (entry: DBPFEntry) => void,
            evented_reject: ErrorOnlyCallback
        )=>{
            const await_wrap = async <T>(promise?: Promise<T>) => {
                if( !promise )
                    return
                promise.catch(evented_reject)
                return await promise
            }

            // TODO: This (and .init()) needs to be adapted for DBPF v1.x, currently this only supports v2.0 logic
            /*
            DBPF v1.x uses:
            - DBPF.header.index.first instead of DBPF.header.index.offset
            - entry size is determined by DBPF.header.index.minor instead of the mode flag
            - shorter entries (20/24 bytes instead of 32) often with 4 byte instances instead of 8
            */
    
            if( !this.has( key ) )
                throw new RangeError("Index out of bounds")
    
            await await_wrap( this.init() )
    
            let entry: IDBPFEntry | undefined = await await_wrap( super.get( key ) )
            if( !entry ){
                const v2_base_offset = this._DBPF.header.dbpf.major === 1 ? 0 : 4 // v1.x doesn't have a mode flag, and the offset is pulled from DBPF.header.index.first instead of DBPF.header.index.offset
                const v2_header_offset = 4 * (this._header_segments?.size || 0) // skip the header segments, since we already read them in init()
                this._reader.move( v2_base_offset + v2_header_offset ) // move to the start of the first entry
                this._reader.advance( this.entryLength * key ) // move to the start of the requested entry

                let type:                   FourBytes & Resource.Type | undefined               = this._header_segments?.get(0)
                if( type == null )
                    type                                                                        = await await_wrap( this._reader.getInt() ) as number
                let group:                  FourBytes & Resource.Group | undefined              = this._header_segments?.get(1)
                if( group == null )
                    group                                                                       = await await_wrap( this._reader.getInt() ) as number
                let instance_high:          FourBytes & Resource.Instance.Number | undefined    = this._header_segments?.get(2)
                if( instance_high == null )
                    instance_high                                                               = await await_wrap( this._reader.getInt() ) as number

                if( this._DBPF.header.dbpf.major === 1 ){
                    let instance_low:       FourBytes & Resource.Instance.Number | undefined;
                    if( this._DBPF.header.dbpf.minor === 1 )
                        instance_low = (await await_wrap( this._reader.getInt() )) as number
                    const offset:           FourBytes & Resource.Offset                         = (await await_wrap( this._reader.getInt() )) as number
                    const size_file:        FourBytes & Resource.Compression.Uncompressed       = (await await_wrap( this._reader.getInt() )) as number

                    const instance: (FourBytes & Resource.Instance.Number) | (EightBytes & Resource.Instance.BigInt) = instance_low != null ? ( BigInt( instance_high ) << 32n ) | BigInt( instance_low ) : instance_high

                    entry = new DBPFEntry(
                        this._DBPF,
                        type,
                        group,
                        instance,
                        offset,
                        {
                            file: {
                                raw: size_file,
                                reduced: size_file & 0x7FFFFFFF
                            }
                        }
                    )
                } else {
                    let instance_low:       FourBytes & Resource.Instance.Number | undefined    = this._header_segments!.get(3);
                    if( instance_low == null )
                        instance_low                                                            = await await_wrap( this._reader.getInt() ) as number

                    const offset:           FourBytes & Resource.Offset                         = (await await_wrap( this._reader.getInt() )) as number
                    const size_file:        FourBytes & Resource.Compression.Compressed         = (await await_wrap( this._reader.getInt() )) as number
                    const size_memory:      FourBytes & Resource.Compression.Uncompressed       = (await await_wrap( this._reader.getInt() )) as number
        
                    const size_flag:        TwoBytes & Resource.Compression.Flag                = (await await_wrap( this._reader.getShort() )) as number
                    const unknown:          TwoBytes & Unused                                   = (await await_wrap( this._reader.getShort() )) as number
        
                    const instance: EightBytes & Resource.Instance.BigInt = ( BigInt( instance_high ) << 32n ) | BigInt( instance_low )
        
                    entry = new DBPFEntry(
                        this._DBPF,
                        type,
                        group,
                        instance,
                        offset,
                        {
                            file: {
                                raw: size_file,
                                reduced: size_file & 0x7FFFFFFF
                            },
                            memory: size_memory,
                            flag: size_flag
                        }
                    )
                }

                let init: EventedPromise<void>;

                entry.init = () => {
                    return init! || (init = new EventedPromise<void>(
                        async (
                            evented_resolve: () => void,
                            evented_reject: ErrorOnlyCallback
                        )=>{
                            try {    
                                for( let [index, plugin] of this._DBPF.plugins.entries() ){
                                    entry = await plugin.parse( entry as IDBPFEntry )
                                }
                            } catch( error ){
                                evented_reject( error as NullableError )
                            }
                            evented_resolve()
                        },
                        {
                            emit: entry!.emit,
                            events: {
                                resolve: DBPFEntry.ON_INIT,
                                reject: DBPFEntry.ON_ERROR
                            }
                        })
                    )
                }

                super.set( key, Promise.resolve( entry as DBPFEntry ) )
            }
            evented_resolve( entry as DBPFEntry )
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
    on: <T extends string | symbol>(event: T, fn: (...args: any[]) => void, context?: any) => this
    off: <T extends string | symbol>(event: T, fn?: ((...args: any[]) => void) | undefined, context?: any, once?: boolean | undefined) => this;
    emit: <T extends string | symbol>(event: T, ...args: any[]) => boolean;
    once: <T extends string | symbol>(event: T, fn: (...args: any[]) => void, context?: any) => this;

    get addListener(){
        return this.on
    }
    get removeListener(){
        return this.off
    }

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

    get eventNames(){
        return this._emitter.eventNames
    }

    get listeners(){
        return this._emitter.listeners
    }

    get listenerCount(){
        return this._emitter.listenerCount
    }

    removeAllListeners(event?: string | symbol | undefined): this {
        this._emitter.removeAllListeners( event )
        return this
    }
}

/**
 * The DBPF Entry class.
 * 
 * It is a representation of a DBPF resource.
 * - see: [../docs/spec/DBPF.md - Table Entries (AKA "DBPF Resources")](../docs/spec/DBPF.md#table-entries-aka-dbpf-resources)
 */
export class DBPFEntry extends EventEmitter {

    /**
     * @param DBPF 
     * @param type 
     * @param group 
     * @param instance 
     * @param offset 
     * @param size 
     */
    constructor(
        DBPF: DBPF,
        type: FourBytes & Resource.Type,
        group: FourBytes & Resource.Group,
        instance: EightBytes & Resource.Instance.BigInt | FourBytes & Resource.Instance.Number,
        offset: FourBytes & Resource.Offset,
        size: {
            file: {
                raw: FourBytes & Resource.Compression.Compressed,
                reduced: FourBytes & Resource.Compression.Compressed,
            }
            memory?: FourBytes & Resource.Compression.Uncompressed,
            flag?: FourBytes & Resource.Compression.Flag
        }
    ){
        super();
        this._DBPF = DBPF;
        this.type = type;
        this.group = group;
        this.instance = instance;
        this.offset = offset;
        this.size = size;
        this.reader = DBPF.read( offset, size.file.reduced )
        Operations.deepFreeze( this.size );
    }

    /**
     * The event name for when the DBPF Entry is initialized.
     * @event
     */
    static readonly ON_INIT = "init"
    /**
     * The event name for when the DBPF Entry encounters an error.
     * @event
     */
    static readonly ON_ERROR = "error"

    /**
     * Initializes the DBPF Entry asynchronously, evented.
     */
    init: (() => EventedPromise<void>) | undefined;

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
        file: {
            raw: FourBytes & Resource.Compression.Compressed,
            reduced: FourBytes & Resource.Compression.Compressed,
        }
        /**
         * The amount of bytes the DBPF resource takes up uncompressed in memory.
         */
        memory?: FourBytes & Resource.Compression.Uncompressed,
        /**
         * The compression flag of the DBPF resource.
         * - see: [../docs/spec/DBPF.md - DBPF v2.0](../docs/spec/DBPF.md#dbpf-v20)
         */
        flag?: FourBytes & Resource.Compression.Flag
    };

    /**
     * The buffer reader for the DBPF resource.
     */
    readonly reader: IBufferReader;
    mimetype: string | undefined;

    /**
     * Retrive the DBPF resource as a Blob on demand. This is a memory-efficient way to handle the blobs read from the entry.
     * 
     * NOTE: This method is designed to be overwritten by plugins. While it is an option, it is not recommended, as overwriting this method in one plugin may break it for other plugins.
     * 
     * @param refresh Whether to refresh the blob. If set to `true`, the blob will be re-read from the entry.
     * @returns { Promise<Blob> } A promise that resolves with a Blob of the DBPF resource.
     */
    blob: ( refresh?: boolean ) => Promise<Blob> = async ( refresh?: boolean ) => {
        // this is all done for memory efficiency
        // the reason this is necessary is because this blob is backed by in-process memory (buffer), instead of a file. Meaning that this blob will not be paged.

        if( this._blob && this.mimetype && !refresh ) // if we already have the blob, the mimetype has been explicitly set, and we don't want to refresh, return the cached blob
            return this._blob

        const out = new Blob([await this.reader.get()], { type: this.mimetype })

        if( this.mimetype ) // only cache the blob if the mimetype is set. This ensures that the blob can be gc'd if it is unreferenced in the calling code.
            this._blob = out

        return out
    }
    private _blob: Blob | undefined;
}

/**
 * @see {@link DBPFEntry}
 */
export interface IDBPFEntry extends Omit<DBPFEntry, 'constructor'> {}
export type TaggedEntry = IDBPFEntry & {
    tag: string
    details?: any
};

/**
 * This is the planned structure for the plugin system.
 * 
 * This is a WIP.
 * @experimental
 */
class Plugin extends Deserialized {
    /**
     * The THUM Resource Type plugin.
     */
    static THUM: Plugin | undefined;
    /**
     * The path to the plugin file.
     */
    path: PathString;
    /**
     * The function to parse the DBPF entry.
     * 
     * When set, the provided function will automatically be bound to the plugin instance.
     */
    get parse(): (entry: IDBPFEntry, detailed?: boolean) => Promise<IDBPFEntry> {
        return this._parse
    }
    set parse( value: (entry: IDBPFEntry, detailed?: boolean) => Promise<IDBPFEntry> ){
        this._parse = value.bind( this )
    }
    private _parse: (entry: IDBPFEntry, detailed?: boolean) => Promise<IDBPFEntry> = (entry: IDBPFEntry) => Promise.resolve(entry);

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

        let script: string = filepath || "";
        script = script.trim();
        if( EngineDetails.supports.node && filepath ){
            script = isAbsolute( filepath ) ? filepath : resolve( filepath ); 
        }

        this.parse = script.length ? require( script )?.plugin || this.parse : this.parse;

        this.path = script as PathString;
    }
}

/**
 * An array of {@link Plugin} instances.
 * 
 * In addition to the [standard array methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array),
 * this class provides additional methods for convenience.
 * 
 * Additionally, this class overrides and wraps some of the standard array methods to allow for string paths to be used in place of {@link Plugin} instances.
 * 
 * @see {@link Plugin}
 * @experimental
 */
export class PluginsList extends Array<Plugin> {
    /**
     * The default list of plugins to apply to DBPF files. To control the default list, a {@link Plugins} export is provided.
     * 
     * Instances of the DBPF class contain a copy of this list, and can be modified separately. With that said, modifying this list will not propagate to existing DBPF instances.
     * However, note that the copy is shallow, so modifying the plugins themselves _will_ affect all instances.
     */
    static default: PluginsList = new PluginsList();
    /**
     * Adds a plugin to the list. Accepts either a {@link Plugin} instance or a string path to a plugin file.
     * 
     * @see [Array.push](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
     * @override
     */
    override push( ...items: (Plugin | string)[] ): number {
        return super.push( ...items.map( item => {
            if( typeof item === "string" )
                return Plugin.read( item ) as Plugin;
            return item;
        }));
    }
    /**
     * Alias for {@link PluginsList.push}
     */
    register( ...items: (Plugin | string)[] ): number {
        return this.push( ...items );
    }
    /**
     * Adds a plugin to the beginning of the list. Accepts either a {@link Plugin} instance or a string path to a plugin file.
     * 
     * @see [Array.unshift](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)
     * @override
     */
    override unshift( ...items: (Plugin | string)[] ): number {
        return super.unshift( ...items.map( item => {
            if( typeof item === "string" )
                return Plugin.read( item ) as Plugin;
            return item;
        }));
    }
    /**
     * Alias for {@link PluginsList.unshift}
     */
    prioritize( ...items: (Plugin | string)[] ): number {
        return this.unshift( ...items );
    }
    /**
     * Override for [Array.splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) to allow for string paths to be used in place of {@link Plugin} instances.
     * 
     * @see [Array.splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
     * @override
     */
    override splice(start: unknown, deleteCount?: unknown, ...rest: any[]): Plugin[] {
        rest = rest.map( item => {
            if( typeof item === "string" )
                return Plugin.read( item ) as Plugin;
            return item;
        })
        return super.splice( start as number, deleteCount as number, ...rest );
    }
    /**
     * Inserts a plugin at the specified index. Accepts either a {@link Plugin} instance or a string path to a plugin file.
     * 
     * @param index The index to insert the plugin at.
     * @param plugins The plugins to insert.
     */
    insert( index: number, ...plugins: (Plugin | string)[] ): void {
        this.splice( index, 0, ...plugins );
    }
    /**
     * Removes a plugin from the list. Accepts either a {@link Plugin} instance, a string path to a plugin file, or the index of the plugin to remove.
     * 
     * @param plugins The plugins to remove. Can be a {@link Plugin} instance, a string path to a plugin file, or the index of the plugin to remove.
     */
    remove( ...plugins: (Plugin | string | number)[] ): void {
        const indeces: number[] = plugins.map( plugin => {
            if( typeof plugin === "number" )
                return plugin;
            return this.indexOf( plugin );
        }).filter( index => index >= 0 );
        indeces.forEach( index => this.splice( index, 1 ) );
    }
    /**
     * Override for [Array.indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf) to allow for string paths to be used in place of {@link Plugin} instances.
     * 
     * @see [Array.indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
     * @override
     */
    override indexOf( item: Plugin | string, fromIndex?: number ): number {
        if( typeof item === "string" )
            super.slice( fromIndex ).findIndex( plugin => plugin.path === item );
        return super.indexOf( item as Plugin, fromIndex );
    }
    /**
     * Override for [Array.lastIndexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf) to allow for string paths to be used in place of {@link Plugin} instances.
     * 
     * @see [Array.lastIndexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf)
     * @override
     */
    override lastIndexOf( item: Plugin | string, fromIndex?: number): number {
        if( typeof item === "string" )
            super.slice( 0, fromIndex )
                .map(( plugin, index ) => [plugin, index])
                .reverse()
                .find(([plugin]) => (plugin as Plugin).path === item )?.[1] || -1;
        return super.lastIndexOf( item as Plugin, fromIndex );
    }
    /**
     * Override for [Array.includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes) to allow for string paths to be used in place of {@link Plugin} instances.
     * 
     * @see [Array.includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
     * @override
     */
    override includes( item: Plugin | string, fromIndex?: number ): boolean {
        if( typeof item === "string" )
            super.slice( fromIndex ).some( plugin => plugin.path === item );
        return super.includes( item as Plugin, fromIndex );
    }
    /**
     * @deprecated Throws. Do not use. Implemented for Array interface.
     */
    override fill( value: Plugin | string, start?: number, end?: number ): this {
        throw new Error("Do not mass-overwrite plugins");
    }
}
/**
 * @see {@link PluginsList.default}
 */
export const Plugins = PluginsList.default;

/**
 * Constant export for UMD
 */
export const dbpf = {
    Plugins,
    DBPF,
    DBPFEntry
}

// Plugins
import * as THUM from "./plugins/ResourceTypes/THUM/plugin"

function handleInternalPlugin(
    path: string,
    internal_plugin: {
        parse: (entry: IDBPFEntry, detailed?: boolean) => Promise<IDBPFEntry>,
    }
){
    const plugin = new Plugin()
    plugin.parse = internal_plugin.parse
    plugin.path = "[internal] " + path
    Object.freeze( plugin )
    Plugins.push( plugin )
    return plugin
}

Plugin.THUM = handleInternalPlugin( "Plugins/ResourceTypes/THUM", THUM )