/**
 * BufferStore
 * 
 * A LFU+TTL cache for reading buffer segments from a file.
 */

'use strict';

import * as fs from "fs";
import {
    EngineDetails,
    BufferExtras
} from "./boilerplate"

export type BufferOffset = BufferExtras.BufferOffset;
export type BufferLength = BufferExtras.BufferLength;

import { Buffer } from "buffer";
export { Buffer } from "buffer";

import {
    LFUCache
} from "./LFUCache";
/**
 * This module provides a LFU+TTL cache implementation for reading file buffers.
 * 
 * It is optimized for use with Blobs and File objects, but is also designed to
 * work file paths in Node.js.
 * 
 * It caches the buffers in segments, with each segment being a small, but fixed size.
 */

/**
 * Default configuration for the buffer cache.
 * 
 * This object contains the default values for managing the cache, including
 * the segment size, capacity, and time-to-live (TTL) for each segment.
 * 
 * These are used to populate the {@link SegmentOptions} object, if the user omits the values.
 * 
 * @internal
 */
const DEFAULTS = {
    /**
     * The size of each segment in bytes.
     * 
     * This value defines the size of individual segments in the buffer.
     * 
     * @defaultValue 16KB (1024 * 16)
     */
    SEGMENT_SIZE: 1024 * 16, // 16KB

    /**
     * The number of segments in a buffer.
     * 
     * This value defines how many segments can be stored in cache before
     * cycling out least frequently used items (LFU).
     * 
     * @defaultValue 16 segments
     * total default capacity of 256KB (when multiplied by the `SEGMENT_SIZE`)
     */
    SEGMENT_CAPACITY: 16, // 16 * 16KB = 256KB

    /**
     * The time-to-live (TTL) for each segment in milliseconds.
     * 
     * This value defines how long a segment remains in the buffer before
     * it is considered stale and eligible for eviction. 
     * 
     * @defaultValue 30 seconds (1000 * 60 * 0.5)
     */
    SEGMENT_TTL: 1000 * 60 * 0.5 // 30 seconds
};

/**
 * Options for configuring the buffer cache.
 * 
 * @see {@link DEFAULTS} for default values.
 */
type SegmentOptions = {
    size: BufferLength;
    capacity: number;
    ttl: number;
}

/**
 * A string representing a file path.
 */
export type PathString = string;

/**
 * A number representing the index of a buffer segment.
 * 
 * @internal
 */
type StoreIndex = number;

/**
 * An abstraction of how the buffers are stored in the cache.
 * 
 * @internal
 */
type BufferStoreEntry = {
    index: StoreIndex;
    buffer: Buffer;
}

/**
 * A function that retrieves a buffer segment from the cache.
 * 
 * This is for sharing the cache getter with the {@link BufferReader} class.
 * 
 * @internal
 */
type BufferStoreGetter = ( index: StoreIndex ) => Promise<BufferStoreEntry>;

/**
 * A function that retrieves a buffer segment directly from the file system.
 * 
 * This is for sharing the direct buffer getter with the {@link BufferReader} class.
 * 
 * @internal
 */
type BufferStoreDirect = ( offset: BufferOffset, length: BufferLength ) => Promise<Buffer>;

/**
 * The parent class buffer store for both Node.js and browser environments.
 * 
 * This is the base buffer cache. It uses the file as a backing store.
 * It is most performant when the file is a Blob or File object, but
 * it can also work with file paths (in Node.js).
 * 
 * It is designed to be extended, then used
 * 
 * @internal
 */
abstract class BaseBufferStore {
    /**
     * Creates a new buffer store
     * 
     * Since the value of length will be calculated differently based on
     * engine and environment, length is required as an argument, and is intended
     * to be calculated by child classes.
     * 
     * This sets up an underlying LFU+TTL cache.
     * 
     * @param { File | Blob | string } file 
     * @param { number } length
     */
    constructor(
        file: File | Blob | PathString,
        length: BufferLength,
        {
            size: segment_size = DEFAULTS.SEGMENT_SIZE,
            capacity: segment_capacity = DEFAULTS.SEGMENT_CAPACITY,
            ttl: segment_ttl = DEFAULTS.SEGMENT_TTL
        }: Partial<SegmentOptions>
    ){
        if( segment_size < 8 )
            throw new Error("Segment size must be at least 8 bytes");
        (this as any)._file = file;
        if( !length )
            throw new Error("Invalid length");
        this.length = length;
        this.segment_size = segment_size;
        this.count = Math.ceil(length / segment_size);

        this._cache = new LFUCache<StoreIndex, BufferStoreEntry>( segment_capacity, segment_ttl );
    }

    /**
     * The length of the file in bytes.
     * 
     * @readonly
     * @public
     */
    readonly length: BufferLength;
    /**
     * The size of each segment in bytes.
     * 
     * @readonly
     * @public
     */
    readonly segment_size: BufferLength;
    /**
     * The number of segments in the cache.
     * 
     * @readonly
     * @public
     */
    readonly count: number;

    /**
     * The setter for the file property. Needs to be implemented by child classes.
     * @see {@link NodeBufferStore._file} and {@link BrowserBufferStore._file}
     */
    protected abstract set _file( file: File | Blob | PathString );
    /**
     * This is the cache fallthrough method for retrieving non-cached buffer segments.
     * 
     * It is implemented by child classes.
     * @see {@link NodeBufferStore._read} and {@link BrowserBufferStore._read}
     * @param index The index of the buffer segment to read from the file system.
     * @returns { Promise<BufferStoreEntry> }
     */
    protected abstract _read( index: StoreIndex ): Promise<BufferStoreEntry>;
    /**
     * This is the direct buffer getter for retrieving buffer segments directly from the file system.
     * 
     * It is implemented by child classes.
     * @see {@link NodeBufferStore._direct} and {@link BrowserBufferStore._direct}
     * @param offset The offset in the buffer to start reading from.
     * @param length The length of the buffer to read.
     * @returns { Promise<Buffer> }
     */
    protected abstract readonly _direct: BufferStoreDirect;

    /**
     * The underlying LFU+TTL cache for storing and retrieving cached buffer segments.
     */
    private _cache: LFUCache<StoreIndex, BufferStoreEntry>;

    /**
     * This is the primary method for retrieving buffer segments.
     * 
     * It first checks the cache, then falls back to the file system.
     * @param index The index of the buffer segment to retrieve.
     * @returns { Promise<BufferStoreEntry> }
     */
    private readonly _get: BufferStoreGetter = async ( index: StoreIndex ): Promise<BufferStoreEntry> => {
        let out = this._cache.get( index );
        if( !out )
            out = await this._read( index );
        this._cache.set( index, out );
        return out;
    }

    /**
     * Retrieves a buffer by its offset and length and wraps it in a {@link BufferReader}.
     * 
     * @param offset 
     * @param length 
     * @returns { BufferReader }
     * @public
     */
    get( offset: BufferOffset, length: BufferLength ): BufferReader {
        return new BufferReader( this._get, this._direct, this.segment_size, offset, length );
    }
}

/**
 * A buffer store for Node.js environments.
 * 
 * @remarks
 * This class is designed to work with both Blobs/File objects and file paths.
 */
export class NodeBufferStore extends BaseBufferStore {
    /**
     * @param file The Blob/File object or file path to read from. 
     * @param { Partial<SegmentOptions> } segment_options @see {@link SegmentOptions} 
     */
    constructor(
        file: File | Blob | PathString,
        segment_options: Partial<SegmentOptions> = {}
    ){
        const size = file instanceof Blob ? file.size : fs.statSync( file ).size;
        super( file, size, segment_options );
    }

    /**
     * The file property for the Node.js backing store, if it is a Blob or File object.
     */
    private _blob: File | Blob | undefined;
    /**
     * The file property for the Node.js backing store, if it is a file path.
     */
    private _path: PathString | undefined;
    /**
     * The setter for the file property.
     * @see {@link BaseBufferStore._file}
     */
    protected set _file( file: File | Blob | PathString ){
        if( file instanceof Blob )
            this._blob = file;
        else{
            if( typeof file !== "string" )
                throw new TypeError("Invalid argument for file, expected File, Blob, or string");
            if( !fs.existsSync( file ) )
                throw new Error(`File not found: ${ file }`);
            
            this._path = file;
        }
    }

    /**
     * The Node.js implementation of the cache fallthrough method for retrieving non-cached buffer segments.
     * @see {@link BaseBufferStore._read}
     * 
     * @param index The index of the buffer segment to read from the file system.
     * @returns { Promise<BufferStoreEntry> }
     */
    protected async _read( index: StoreIndex ): Promise<BufferStoreEntry> {
        if( index < 0 || index >= this.count )
            throw new RangeError(`Read out of range (by index): ${ index }/${ this.count }`);

        const offset = index * this.segment_size;
        const length = Math.min( this.segment_size, this.length - offset );

        return new Promise<BufferStoreEntry>((
            read_resolve: ( value: BufferStoreEntry ) => void,
            read_reject: ( reason: any ) => void
        )=>{
            this._direct( offset, length ).then(( buffer: Buffer ) => {
                read_resolve({
                    index,
                    buffer
                });
            }).catch( read_reject );
        })
    }

    /**
     * The Node.js implementation of the direct buffer getter for retrieving buffer segments directly from the file system.
     * @see {@link BaseBufferStore._direct}
     * 
     * @param offset The offset in the buffer to start reading from.
     * @param length The length of the buffer to read.
     * @returns { Promise<Buffer> }
     * @protected
     */
    protected readonly _direct: BufferStoreDirect = async ( offset: BufferOffset, length: BufferLength ): Promise<Buffer> => {
        if( offset < 0 || offset + length > this.length )
            throw new RangeError(`Read out of range (by length): ${ offset } + ${ length }/${ this.length }`);

        return new Promise<Buffer>((
            read_resolve: ( value: Buffer ) => void,
            read_reject: ( reason: any ) => void
        )=>{
            if( this._blob ){
                const subblob = this._blob.slice( offset, offset + length );
                subblob.arrayBuffer().then(( buffer: ArrayBuffer ) => {
                    read_resolve( Buffer.from( buffer ) );
                }).catch( read_reject );
            } else {
                fs.open( this._path as string, "r", ( err, fd ) => {
                    if( err ) return read_reject( err );
                    const outbuffer = Buffer.alloc( length );
                    fs.read( fd, outbuffer, 0, length, offset, ( err, bytesRead, buffer ) => {
                        if( err ) return read_reject( err );
                        if( !buffer || bytesRead !== buffer.length )
                            return read_reject( new Error("Read failed") );
                        read_resolve( outbuffer );
                    });
                });
            }
        })
    }
}

/**
 * A buffer store for browser environments.
 * 
 * @remarks
 * This class is designed to work only with Blobs and File objects.
 */
export class BrowserBufferStore extends BaseBufferStore {
    /**
     * @param file The Blob/File object to read from.
     * @param segment_options @see {@link SegmentOptions}
     */
    constructor(
        file: File | Blob,
        segment_options: Partial<SegmentOptions> = {}
    ){
        if( !(file instanceof Blob) )
            throw new TypeError("Invalid argument for file, expected File or Blob");

        super( file, file.size, segment_options );
    }

    /**
     * The file property for the browser backing store.
     */
    private _blob: File | Blob | undefined;
    /**
     * The setter for the file property.
     * @see {@link BaseBufferStore._file}
     */
    protected set _file( file: File | Blob ){
        if( !(file instanceof Blob) )
            throw new TypeError("Invalid argument for file, expected File or Blob"); 
        this._blob = file;
    }

    /**
     * The browser implementation of the cache fallthrough method for retrieving non-cached buffer segments.
     * @see {@link BaseBufferStore._read}
     * 
     * @param index The index of the buffer segment to read from the file system.
     * @returns { Promise<BufferStoreEntry> }
     */
    protected async _read( index: StoreIndex ): Promise<BufferStoreEntry> {
        if( index < 0 || index >= this.count )
            throw new RangeError(`Read out of range (by index): ${ index }/${ this.count }`);

        const offset = index * this.segment_size;
        const length = Math.min( this.segment_size, this.length - offset );

        const subblob = this._blob!.slice( offset, offset + length );
        const buffer = Buffer.from( await subblob.arrayBuffer() );

        return {
            index,
            buffer
        };
    }

    /**
     * The browser implementation of the direct buffer getter for retrieving buffer segments directly from the file system.
     * @see {@link BaseBufferStore._direct}
     * 
     * @param offset The offset in the buffer to start reading from.
     * @param length The length of the buffer to read.
     * @returns { Promise<Buffer> }
     * @protected
     */
    protected readonly _direct: BufferStoreDirect = async ( offset: BufferOffset, length: BufferLength ): Promise<Buffer> => {
        if( offset < 0 || offset + length > this.length )
            throw new RangeError(`Read out of range (by length): ${ offset } + ${ length }/${ this.length }`);

        const subblob = this._blob!.slice( offset, offset + length );
        return Buffer.from( await subblob.arrayBuffer() );
    }
}

/**
 * An abstraction for a series of bytes represented as a bigint
 */
export type MemoryAsBigInt = bigint;
/**
 * An abstraction for a series of bytes represented as a number
 */
export type MemoryAsNumber = number;

/**
 * A branded abstraction for a cursor position in a buffer.
 */
type Position = number & { __position: never };

/**
 * An abstraction for a single byte represented as a number
 */
export type OneByte = number;
/**
 * An abstraction for two bytes represented as a number
 */
export type TwoBytes = number;
/**
 * An abstraction for three bytes represented as a number
 */
export type ThreeBytes = number;
/**
 * An abstraction for four bytes represented as a number
 */
export type FourBytes = number;

/**
 * An abstraction for five bytes represented as a bigint
 */
export type FiveBytes = bigint;
/**
 * An abstraction for six bytes represented as a bigint
 */
export type SixBytes = bigint;
/**
 * An abstraction for seven bytes represented as a bigint
 */
export type SevenBytes = bigint;
/**
 * An abstraction for eight bytes represented as a bigint
 */
export type EightBytes = bigint;

/**
 * An interface for reading buffers based on {@link BufferReader}.
 */
export type IBufferReader = BufferReader;

/**
 * A wrapper for reading buffers from a {@link BufferStore}.
 * 
 * Provides quality of life methods for reading the data stored in the requested buffer.
 * @see {@link BufferStore.get}
 * @public
 */
class BufferReader {
    /**
     * The method for retrieving buffer segments from the cache, provided by said cache.
     * @private
     */
    private _getter: BufferStoreGetter;
    /**
     * The method for retrieving buffer segments directly, provided by the buffer store.
     * @private
     */
    private _direct: ( offset: BufferOffset, length: BufferLength ) => Promise<Buffer>;
    /**
     * The size of each segment in bytes.
     * @private
     */
    private _segment_size: BufferLength;

    /**
     * The prior segment in the buffer cache stored asynchronously.
     * @private
     */
    private _prior_segment: Promise<BufferStoreEntry> | undefined;
    /**
     * The current segment in the buffer cache stored asynchronously.
     * @private
     */
    private _current_segment: Promise<BufferStoreEntry>;
    /**
     * The next segment in the buffer cache stored asynchronously.
     * @private
     */
    private _next_segment: Promise<BufferStoreEntry> | undefined;

    /**
     * The number of segments readable by this BufferReader.
     * @private
     */
    private _count: number;

    private _offset: BufferOffset;
    private _length: BufferLength;

    private _first_index: StoreIndex;
    private _current_index: StoreIndex;
    private _last_index: StoreIndex;

    constructor(
        getter: BufferStoreGetter,
        direct: ( offset: BufferOffset, length: BufferLength ) => Promise<Buffer>,
        segment_size: BufferLength,
        offset: BufferOffset,
        length: BufferLength
    ){
        this._getter = getter;
        this._direct = direct;
        this._segment_size = segment_size;

        this._offset = offset;
        this._length = length;

        this._cursor = 0 as Position;


        this._current_index = this._first_index = Math.floor( offset / segment_size );
        // last index inclusive
        this._last_index = Math.floor( (offset + length - 1) / segment_size );

        this._count = this._last_index - this._first_index + 1;

        this._current_segment = getter( this._first_index );
        if( this._count > 1 )
            this._next_segment = getter( this._first_index + 1 );
    }

    private _cursor: Position;
    /**
     * The current position of the cursor in the buffer.
     */
    get cursor(): Position {
        return this._cursor;
    }

    /**
     * Moves the cursor to the specified position
     * 
     * @param position The position to move the cursor to. 
     * 
     * @remarks
     * If the position is out of range, it will wrap around to the beginning or end of the buffer.
     * 
     * This method also asynchronously polls the cache for the next segment if the cursor moves to a new segment.
     */
    async move( position: number ): Promise<void> {

        while( position < 0 || position >= this._length ){
            if( position < 0 ){
                position += this._length;
            } else {
                position -= this._length;
            }
        }

        this._cursor = position as Position;

        const current_index = this._current_index;
        const correct_index = Math.floor( (this._offset + position) / this._segment_size );
        if( correct_index === current_index )
            return;

        this._current_index = correct_index;

        const diff = correct_index - current_index;
        switch( diff ){
            case 1:
                this._prior_segment = this._current_segment;
                this._current_segment = this._next_segment!;
                if( current_index < this._last_index )
                    this._next_segment = this._getter( current_index + 1 );
                else
                    this._next_segment = this._getter( this._first_index );
                break;
            case -1:
                this._next_segment = this._current_segment;
                this._current_segment = this._prior_segment!;
                if( current_index > this._first_index )
                    this._prior_segment = this._getter( current_index - 1 );
                else
                    this._prior_segment = this._getter( this._last_index );
                break;
            default:
                this._current_segment = this._getter( correct_index );
                if( correct_index < this._last_index )
                    this._next_segment = this._getter( correct_index + 1 );
                else
                    this._next_segment = undefined;
                if( correct_index > this._first_index )
                    this._prior_segment = this._getter( correct_index - 1 );
                else
                    this._prior_segment = undefined;
                break;
        }
    }

    /**
     * Advances the cursor by the specified length.
     * 
     * @param length The length to advance the cursor by.
     * 
     * @remarks
     * {@link BufferReader.move} moves the cursor to an absolute position, while this method
     * advances the cursor to a position relative to the current position.
     */
    async advance( length: BufferLength = 1 ): Promise<void> {
        await this.move( this._cursor + length );
    }

    /**
     * This is the primary method for retrieving from the cached buffer.
     * 
     * @param length The length (in bytes) of the buffer to retrieve from the cursor position.
     * @returns { Promise<Buffer> }
     * 
     * @private
     */
    private async _getBuffer( length: BufferLength, offset: BufferOffset = this._cursor, moving:boolean = true ): Promise<Buffer> {
        if( offset + length > this._length )
            throw new RangeError(`Read out of range (by length): ${ offset }/${ this._length }`);

        if( length > 8 )
            throw new Error(`Read length too large`);

        // snapshot current state
        const current_offset_cursor = offset + this._offset;
        const current_index = this._current_index;

        const current_segment = await this._current_segment;
        const _next_segment = this._next_segment;

        // immediately advance cursor
        if( moving )
            this.advance( length );

        let buffers: Buffer[] = [];

        const skippedBeginning = current_offset_cursor % this._segment_size;

        if( this._segment_size >= length + skippedBeginning ){
            buffers.push( current_segment.buffer.subarray( skippedBeginning, skippedBeginning + length ) );
        } else {
            buffers.push( current_segment.buffer.subarray( skippedBeginning ) );
            const next_segment = await _next_segment;
            const remainingBytes = length - buffers[0].length;
            buffers.push( next_segment!.buffer.subarray( 0, remainingBytes ) );
        }

        return Buffer.concat( buffers )
    }

    /**
     * Retrieves a buffer from the buffer cache directly. Can be used for reading large segments.
     * 
     * @param offset The offset in the buffer to start reading from.
     * @param length The length of the buffer to read.
     * @returns { Promise<Buffer> }
     * 
     * @deprecated This method should be avoided and used sparingly, as it bypasses any memory optimizations.
     */
    async get( offset: BufferOffset = this._offset, length: BufferLength = this._length ): Promise<Buffer> {
        return await this._direct( offset, length );
    }

    /**
     * A method for retrieving an arbitrary number of bytes from the buffer as a number or bigint in little-endian order (least significant BYTE first).
     * 
     * @param length 
     * @returns { Promise<Number | BigInt> }
     * 
     * @remarks Maximum length is 8 bytes due to JavaScript's number precision.
     */
    async getBytesLE( length: BufferLength ): Promise<MemoryAsNumber | MemoryAsBigInt> {
        const bytes = await this._getBuffer( length );

        let little_three_bytes: FourBytes | undefined;
        let big_four_bytes: ThreeBytes;

        switch( length ){
            case 8: return bytes.readBigInt64LE( 0 ) as MemoryAsBigInt;
            case 7:
            case 6:
            case 5:
                little_three_bytes = bytes.readUIntLE( 3, length - 4 ) as ThreeBytes;
            default:
                big_four_bytes = bytes.readUIntLE( 0, Math.min( length, 4 ) ) as FourBytes;
        }

        if( little_three_bytes !== undefined )
            return BigInt( big_four_bytes ) << 32n | BigInt( little_three_bytes ) as MemoryAsBigInt;
        else
            return big_four_bytes as MemoryAsNumber;
    }

    /**
     * A method for retrieving an arbitrary number of bytes from the buffer as a number or bigint in big-endian order (most significant BYTE (and BIT) first).
     * 
     * @param length 
     * @returns { Promise<Number | BigInt> }
     * 
     * @remarks Maximum length is 8 bytes due to JavaScript's number precision.
     */
    async getBytesBE( length: BufferLength ): Promise<MemoryAsNumber | MemoryAsBigInt> {
        const bytes = await this._getBuffer( length );

        let little_four_bytes: FourBytes;
        let big_three_bytes: ThreeBytes | undefined;
        switch( length ){
            case 8: return bytes.readBigInt64BE( 0 ) as MemoryAsBigInt;
            case 7:
            case 6:
            case 5:
                big_three_bytes = bytes.readUIntBE( 0, length - 4 ) as ThreeBytes;
            default:
                little_four_bytes = bytes.readUIntBE( 0, Math.min( length, 4 ) ) as FourBytes;
        }

        if( big_three_bytes !== undefined )
            return BigInt( big_three_bytes ) << 32n | BigInt( little_four_bytes ) as MemoryAsBigInt;
        else
            return little_four_bytes as MemoryAsNumber;
    }

    /**
     * Retrieves a single byte from the buffer as a number.
     * @returns { Promise<Number> }
     */
    async getByte(): Promise<OneByte> {
        return (await this._getBuffer( 1 )).readUInt8( 0 );
    }

    /**
     * Retrieves two bytes from the buffer as a number.
     * @returns { Promise<Number> }
     */
    async getTwoBytes(): Promise<TwoBytes> {
        return (await this._getBuffer( 2 )).readUInt16LE( 0 );
    }
    async getShort(): Promise<TwoBytes> {
        return this.getTwoBytes();
    }

    /**
     * Retrieves three bytes from the buffer as a number.
     * @returns { Promise<Number> }
     */
    async getFourBytes(): Promise<FourBytes> {
        return (await this._getBuffer( 4 )).readUInt32LE( 0 );
    }
    /**
     * Alias for {@link BufferReader.getFourBytes}
     */
    async getInt(): Promise<FourBytes> {
        return this.getFourBytes();
    }
    /**
     * Alias for {@link BufferReader.getFourBytes}
     */
    async getFloat(): Promise<FourBytes> {
        return (await this._getBuffer( 4 )).readFloatLE( 0 );
    }

    /**
     * Retrieves eight bytes from the buffer as a bigint.
     * @returns { Promise<BigInt> }
     */
    async getEightBytes(): Promise<MemoryAsBigInt> {
        return (await this._getBuffer( 8 )).readBigInt64LE( 0 );
    }
    /**
     * Alias for {@link BufferReader.getEightBytes}
     */
    async getLong(): Promise<MemoryAsBigInt> {
        return this.getEightBytes();
    }

    /**
     * Retrieves a variable-length LEB128 encoded number from the buffer as a 32-bit unsigned number.
     * @returns { Promise<Number> }
     */
    async getUnsignedLEB128(): Promise<MemoryAsNumber> {
        let value = 0;
        let shift = 0;
        let byte: number;
        let bytelimit = 5;
        let i = 0;

        do {
            byte = await this.getByte();
            value |= (byte & 0x7f) << shift;
            shift += 7;
            i++;
        } while( (byte & 0x80) && i < bytelimit );

        if( (byte & 0x80) && i === bytelimit )
            throw new RangeError("LEB128 value too large for 32-bit");

        return value;
    }
    /**
     * Retrieves a variable-length LEB128 encoded number from the buffer as a 32-bit signed number.
     * @returns { Promise<Number> }
     */
    async getLEB128(): Promise<MemoryAsNumber> {
        let value = 0;
        let shift = 0;
        let byte: number;
        let bytelimit = 5;
        let i = 0;

        do {
            byte = await this.getByte();
            value |= (byte & 0x7f) << shift;
            shift += 7;
            i++;
        } while( (byte & 0x80) && i < bytelimit );

        if( (byte & 0x80) && i === bytelimit ){
            throw new RangeError("LEB128 value too large for 32-bit");
        }

        if( (byte & 0x40) && i < bytelimit ){
            value |= -(1 << shift);
        }

        return value as FourBytes;
    }

    /**
     * Retrieves a variable-length LEB128 encoded number from the buffer as a 64-bit unsigned bigint.
     * @returns { Promise<BigInt> }
     */
    async getUnsignedLEB128BigInt(): Promise<MemoryAsBigInt> {
        let value = 0n;
        let shift = 0n;
        let byte: number;
        let bytelimit = 9;
        let i = 0;
        do {
            byte = await this.getByte();
            value |= BigInt((byte & 0x7f)) << shift;
            shift += 7n;
            i++;
        } while( (byte & 0x80) && i < bytelimit );

        if( (byte & 0x80) && i === bytelimit )
            throw new RangeError("LEB128 value too large for 64-bit");

        return value as EightBytes;
    }
    /**
     * Retrieves a variable-length LEB128 encoded number from the buffer as a 64-bit signed bigint.
     * @returns { Promise<BigInt> }
     */
    async getLEB128BigInt(): Promise<MemoryAsBigInt> {
        let value = 0n;
        let shift = 0n;
        let byte: number;
        let bytelimit = 9;
        let i = 0;
        do {
            byte = await this.getByte();
            value |= BigInt((byte & 0x7f)) << shift;
            shift += BigInt(7);
            i++;
        } while( (byte & 0x80) && i < bytelimit );

        if( (byte & 0x80) && i === bytelimit )
            throw new RangeError("LEB128 value too large for 64-bit");

        if( (byte & 0x40) && i < bytelimit )
            value |= -(1n << shift);

        return value as EightBytes;
    }
}

/**
 * The buffer store for the current environment.
 * @see {@link NodeBufferStore} and {@link BrowserBufferStore}
 */
export const BufferStore = EngineDetails.supports.node ? NodeBufferStore : BrowserBufferStore;
/**
 * The type definition for the exported {@link BufferStore}.
 */
export type BufferStore = NodeBufferStore | BrowserBufferStore;