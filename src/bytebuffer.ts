import { Buffer } from "./polyfill.fs";

// a simple library for reading bytes from a buffer

export class BufferReader {
    private _buffer: Buffer;
    private _cursor: number; // position in buffer

    constructor( buffer: Buffer ){
        this._buffer = buffer;
        this._cursor = 0;
    }

    get buffer(): Buffer {
        return this._buffer;
    }

    get cursor(): number {
        return this._cursor;
    }

    advance( length: number = 1 ): void {
        this._cursor = this._cursor + length;
    }

    move( position: number ): void {
        this._cursor = position;
    }

    // 1 byte
    getByte(): number {
        if( this._cursor + 1 >= this._buffer.length )
            throw new RangeError("BufferReader: Read out of range");

        let out = this._buffer.readUInt8( this._cursor );
        this.advance();
        return out;
    }

    // 2 bytes
    getShort(): number {
        if( this._cursor + 2 >= this._buffer.length )
            throw new RangeError("BufferReader: Read out of range");

        let out = this._buffer.readUInt16LE( this._cursor );
        this.advance(2);
        return out;
    }

    // 4 bytes
    getInt(): number {
        if( this._cursor + 4 >= this._buffer.length )
            throw new RangeError("BufferReader: Read out of range");

        let out = this._buffer.readUInt32LE( this._cursor );
        this.advance(4);
        return out;
    }

    // 4 bytes
    getFloat(): number {
        if( this._cursor + 4 >= this._buffer.length )
            throw new RangeError("BufferReader: Read out of range");

        let out = this._buffer.readFloatLE( this._cursor );
        this.advance(4);
        return out;
    }

    // 8 bytes
    getLong(): bigint {
        if( this._cursor + 8 >= this._buffer.length )
            throw new RangeError("BufferReader: Read out of range");

        let out = this._buffer.readBigInt64LE( this._cursor );
        this.advance(8);
        return out;
    }

    // 'n' bytes
    getSection( length: number ): Buffer {
        if( this._cursor + length >= this._buffer.length )
            throw new RangeError("BufferReader: Read out of range");

        let out = this._buffer.subarray( this._cursor, this._cursor + length );
        this.advance(length);

        return out;
    }

    getUnsignedLEB128(): number {
        let value = 0;
        let shift = 0;
        let byte: number;
        let bytelimit = 5;
        let i = 0;

        do {
            byte = this.getByte();
            value |= (byte & 0x7f) << shift;
            shift += 7;
            i++;
        } while( (byte & 0x80) && i < bytelimit );

        if( (byte & 0x80) && i === bytelimit ){
            throw new RangeError("BufferReader: LEB128 value too large");
        }

        return value;
    }

    getLEB128(): number {
        let value = 0;
        let shift = 0;
        let byte: number;
        let bytelimit = 5;
        let i = 0;

        do {
            byte = this.getByte();
            value |= (byte & 0x7f) << shift;
            shift += 7;
            i++;
        } while( (byte & 0x80) && i < bytelimit );

        if( (byte & 0x80) && i === bytelimit ){
            throw new RangeError("BufferReader: LEB128 value too large");
        }

        if( (byte & 0x40) && i < bytelimit ){
            value |= -(1 << shift);
        }

        return value;
    }

    getUnsignedLEB128BigInt(): bigint {
        let value = BigInt(0);
        let shift = BigInt(0);
        let byte: number;
        let bytelimit = 10;
        let i = 0;

        do {
            byte = this.getByte();
            value |= BigInt((byte & 0x7f)) << shift;
            shift += BigInt(7);
            i++;
        } while( (byte & 0x80) && i < bytelimit );

        if( (byte & 0x80) && i === bytelimit ){
            throw new RangeError("BufferReader: LEB128 value too large");
        }

        return value
    }

    getLEB128BigInt(): bigint {
        let value = BigInt(0);
        let shift = BigInt(0);
        let byte: number;
        let bytelimit = 10;
        let i = 0;

        do {
            byte = this.getByte();
            value |= BigInt((byte & 0x7f)) << shift;
            shift += BigInt(7);
            i++;
        } while( (byte & 0x80) && i < bytelimit );

        if( (byte & 0x80) && i === bytelimit ){
            throw new RangeError("BufferReader: LEB128 value too large");
        }

        if( (byte & 0x40) && i < bytelimit ){
            value |= -(BigInt(1) << shift);
        }

        return value
    }
}