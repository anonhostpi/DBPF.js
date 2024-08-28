/*
NOTE:
- I would like for there to be a way to make these synchronous, but there are a few challenges:
  - The Blob API is asynchronous. We can use blob urls and the XHR API to get around
    this, but that isn't ideal, and as far as I know, there is no XHR API in node, and
    no npm modules are designed to work with blob urls synchronously.
*/

'use strict';

import {
    polyfill
} from "./polyfill";

import {
    fs,
} from "./polyfill.fs";

import {
    Buffer,
    BufferOffset,
    BufferLength
} from "./polyfill.Buffer";

export {
    Buffer,
    BufferOffset,
    BufferLength
} from "./polyfill.Buffer";

import {
    LFUCache
} from "./LFUCache";

const DEFAULT_SEGMENT_SIZE = 1024 * 16 // 16KB
const DEFAULT_SEGMENT_CAPACITY = 16; // 16 * 16KB = 256KB
const DEFAULT_SEGMENT_TTL = 1000 * 60 * 0.5; // 30 seconds

type SegmentOptions = {
    size: BufferLength;
    capacity: number;
    ttl: number;
}

export type PathString = string;
type StoreIndex = number;


type BufferStoreEntry = {
    index: StoreIndex;
    buffer: Buffer;
}

type BufferStoreGetter = ( index: StoreIndex ) => Promise<BufferStoreEntry>;

abstract class BaseBufferStore {
    constructor(
        file: File | Blob | PathString,
        length: BufferLength,
        {
            size: segment_size = DEFAULT_SEGMENT_SIZE,
            capacity: segment_capacity = DEFAULT_SEGMENT_CAPACITY,
            ttl: segment_ttl = DEFAULT_SEGMENT_TTL
        }: Partial<SegmentOptions>
    ){
        if( segment_size < 8 )
            throw new Error("Segment size must be at least 8 bytes");
        (this as any)._file = file;
        this.length = length;
        this.segment_size = segment_size;
        this.count = Math.ceil(length / segment_size);

        this._cache = new LFUCache<StoreIndex, BufferStoreEntry>( segment_capacity, segment_ttl );
    }

    readonly length: BufferLength;
    readonly segment_size: BufferLength;
    readonly count: number;

    protected abstract set _file( file: File | Blob | PathString );
    protected abstract _read( index: StoreIndex ): Promise<BufferStoreEntry>;

    private _cache: LFUCache<StoreIndex, BufferStoreEntry>;

    private readonly _get: BufferStoreGetter = async ( index: StoreIndex ): Promise<BufferStoreEntry> => {
        return this._cache.get( index ) || this._cache.set( index, await this._read( index ) );
    }

    get( offset: BufferOffset, length: BufferLength ): BufferReader {
        return new BufferReader( this._get, this.segment_size, offset, length );
    }
}

export class NodeBufferStore extends BaseBufferStore {
    constructor(
        file: File | Blob | PathString,
        segment_options: Partial<SegmentOptions> = {}
    ){
        const size = file instanceof Blob ? file.size : fs.statSync( file ).size;
        super( file, size, segment_options );
    }

    private _blob: File | Blob | undefined;
    private _path: PathString | undefined;
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

    protected async _read( index: StoreIndex ): Promise<BufferStoreEntry> {
        if( index < 0 || index >= this.count )
            throw new RangeError(`Read out of range`);

        const offset = index * this.segment_size;
        const length = Math.min( this.segment_size, this.length - offset );

        return new Promise<BufferStoreEntry>((
            read_resolve: ( value: BufferStoreEntry ) => void,
            read_reject: ( reason: any ) => void
        )=>{
            if( this._blob ){
                const subblob = this._blob.slice( offset, offset + length );
                subblob.arrayBuffer().then(( buffer: ArrayBuffer ) => {
                    read_resolve({
                        index,
                        buffer: Buffer.from( buffer )
                    });
                }).catch( read_reject );
            } else {
                fs.open( this._path as string, "r", ( err, fd ) => {
                    if( err ) return read_reject( err );
                    const outbuffer = Buffer.alloc( length );
                    fs.read( fd, outbuffer, 0, length, offset, ( err, bytesRead, buffer ) => {
                        if( err ) return read_reject( err );
                        if( !buffer || bytesRead !== buffer.length )
                            return read_reject( new Error("Read failed") );
                        read_resolve({
                            index,
                            buffer: outbuffer
                        });
                    });
                });
            }
        })
    }
}

export class BrowserBufferStore extends BaseBufferStore {
    constructor(
        file: File | Blob,
        segment_options: Partial<SegmentOptions> = {}
    ){
        if( !(file instanceof Blob) )
            throw new TypeError("Invalid argument for file, expected File or Blob");

        super( file, file.size, segment_options );
    }

    private _blob: File | Blob | undefined;
    protected set _file( file: File | Blob ){
        if( !(file instanceof Blob) )
            throw new TypeError("Invalid argument for file, expected File or Blob"); 
        this._blob = file;
    }

    protected async _read( index: StoreIndex ): Promise<BufferStoreEntry> {
        if( index < 0 || index >= this.count )
            throw new RangeError(`Read out of range`);

        const offset = index * this.segment_size;
        const length = Math.min( this.segment_size, this.length - offset );

        const subblob = this._blob!.slice( offset, offset + length );
        const buffer = Buffer.from( await subblob.arrayBuffer() );

        return {
            index,
            buffer
        };
    }
}

export type MemoryAsBigInt = bigint;
export type MemoryAsNumber = number;

type Position = number & { __position: never };

export type OneByte = number;
export type TwoBytes = number;
export type ThreeBytes = number;
export type FourBytes = number;

export type FiveBytes = bigint;
export type SixBytes = bigint;
export type SevenBytes = bigint;
export type EightBytes = bigint;

export type IBufferReader = BufferReader;
class BufferReader {
    private _getter: BufferStoreGetter;
    private _segment_size: BufferLength;

    private _prior_segment: Promise<BufferStoreEntry> | undefined;
    private _current_segment: Promise<BufferStoreEntry>;
    private _next_segment: Promise<BufferStoreEntry> | undefined;

    private _count: number;
    private _cursor: Position;

    private _offset: BufferOffset;
    private _length: BufferLength;

    private _first_index: StoreIndex;
    private _current_index: StoreIndex;
    private _last_index: StoreIndex;

    constructor(
        getter: BufferStoreGetter,
        segment_size: BufferLength,
        offset: BufferOffset,
        length: BufferLength
    ){
        this._getter = getter;
        this._segment_size = segment_size;

        this._offset = offset;
        this._length = length;

        this._count = Math.ceil( (offset + length) / segment_size );
        this._cursor = 0 as Position;


        this._current_index = this._first_index = Math.floor( offset / segment_size );
        // last index inclusive
        this._last_index = Math.floor( (offset + length - 1) / segment_size );

        this._current_segment = getter( this._first_index );
        if( this._count > 1 )
            this._next_segment = getter( this._first_index + 1 );
    }

    get cursor(): Position {
        return this._cursor;
    }

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
                    this._next_segment = undefined;
                break;
            case -1:
                this._next_segment = this._current_segment;
                this._current_segment = this._prior_segment!;
                if( current_index > this._first_index )
                    this._prior_segment = this._getter( current_index - 1 );
                else
                    this._prior_segment = undefined;
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

    async advance( length: BufferLength = 1 ): Promise<void> {
        await this.move( this._cursor + length );
    }

    private async _getBuffer( length: BufferLength ): Promise<Buffer> {
        if( this._cursor + length > this._length )
            throw new RangeError(`Read out of range`);

        if( length > 8 )
            throw new Error(`Read length too large`);

        // snapshot current state
        const current_offset_cursor = this._cursor + this._offset;
        const current_index = this._current_index;

        const current_segment = await this._current_segment;
        const _next_segment = this._next_segment;

        // immediately advance cursor
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

    async getBytes( length: BufferLength ): Promise<MemoryAsNumber | MemoryAsBigInt> {
        const bytes = await this._getBuffer( length );

        let little_four_bytes: FourBytes;
        let big_three_bytes: ThreeBytes | undefined;

        switch( length ){
            case 8: return bytes.readBigInt64LE( 0 ) as MemoryAsBigInt;
            case 7:
            case 6:
            case 5:
                big_three_bytes = bytes.readUIntLE( 3, length - 4 ) as ThreeBytes;
            default:
                little_four_bytes = bytes.readUIntLE( 0, Math.min( length, 4 ) ) as FourBytes;
        }

        if( big_three_bytes !== undefined )
            return BigInt( big_three_bytes ) << 32n | BigInt( little_four_bytes ) as MemoryAsBigInt;
        else
            return little_four_bytes as MemoryAsNumber;
    }

    // 1 byte
    async getByte(): Promise<OneByte> {
        return (await this._getBuffer( 1 )).readUInt8( 0 );
    }

    // 2 bytes
    async getTwoBytes(): Promise<TwoBytes> {
        return (await this._getBuffer( 2 )).readUInt16LE( 0 );
    }
    async getShort(): Promise<TwoBytes> {
        return this.getTwoBytes();
    }

    // 4 bytes
    async getFourBytes(): Promise<FourBytes> {
        return (await this._getBuffer( 4 )).readUInt32LE( 0 );
    }
    async getInt(): Promise<FourBytes> {
        return this.getFourBytes();
    }
    async getFloat(): Promise<FourBytes> {
        return (await this._getBuffer( 4 )).readFloatLE( 0 );
    }

    // 8 bytes
    async getEightBytes(): Promise<MemoryAsBigInt> {
        return (await this._getBuffer( 8 )).readBigInt64LE( 0 );
    }
    async getLong(): Promise<MemoryAsBigInt> {
        return this.getEightBytes();
    }

    // LEB128 32-bit (1-4 bytes)
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

    // LEB128 64-bit (1-8 bytes)
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

export const BufferStore = polyfill.isNode ? NodeBufferStore : BrowserBufferStore;
export type BufferStore = NodeBufferStore | BrowserBufferStore;