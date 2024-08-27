import { polyfill } from "./polyfill";

import {
    Buffer,
    BufferOffset,
    BufferLength
} from "./polyfill.buffer";

export type FileDescriptor = number;

function assert( name: string, value: any, types: (string | Function)[] ){

    let checks = types.map(( type: string | Function ) => {
        if( typeof type === "string" )
            return (value: any) => typeof value === type;
        else
            return (value: any) => value instanceof type;
    })

    if( !checks.some( check => check(value) ) )
        throw new TypeError(`Invalid argument for ${ name }, expected one of:\n- ${ types.join("\n- ") }`);

}

let polyfills: any[] = [
    {
        read: function(
            file: FileDescriptor | Blob,
            buffer: Buffer,
            offset: BufferOffset,
            length: BufferLength,
            position: BufferOffset,
            callback: (err: Error | null | undefined, bytesRead: BufferLength | undefined, buffer: Buffer | undefined) => void
        ){
            if( typeof file === "number" )
                throw new Error("FileDescriptor not supported in browser environment");

            assert("file",      file,       [Blob]);
            assert("buffer",    buffer,     [Buffer]);
            assert("offset",    offset,     ["number","undefined"]);
            offset = offset === undefined ? 0 : offset;
            assert("length",    length,     ["number","undefined"]);
            length = length === undefined ? buffer.length : length;
            assert("position",  position,   ["number","undefined"]);
            position = position === undefined ? 0 : position;
            assert("callback",  callback,   ["function","undefined"]);

            const adjusted_length = Math.min( buffer.length - offset, length );

            file.arrayBuffer().then(( blobBuffer: ArrayBuffer | Buffer ) => {
                blobBuffer = Buffer.from( blobBuffer );

                (blobBuffer as Buffer).copy( buffer, offset, position, position + adjusted_length );
            }).catch(
                callback as (reason: any) => void
            ).finally( () => {
                callback( null, adjusted_length, buffer );
            })
        },
        readSync: function(
            file: FileDescriptor | Blob,
            buffer: Buffer,
            offset: BufferOffset,
            length: BufferLength,
            position: BufferOffset
        ){
            if( typeof file === "number" )
                throw new Error("FileDescriptor not supported in browser environment");

            assert("file",      file,       [Blob]);
            assert("buffer",    buffer,     [Buffer]);
            assert("offset",    offset,     ["number","undefined"]);
            offset = offset === undefined ? 0 : offset;
            assert("length",    length,     ["number","undefined"]);
            length = length === undefined ? buffer.length : length;
            assert("position",  position,   ["number","undefined"]);
            position = position === undefined ? 0 : position;

            const adjusted_length = Math.min( buffer.length - offset, length );

            const url = URL.createObjectURL( file );
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
            xhr.send();
            URL.revokeObjectURL( url );
            const byte_array = Array.from( xhr.responseText ).map( char => char.charCodeAt(0) & 0xFF );
            const blobBuffer = Buffer.from( byte_array );
            blobBuffer.copy( buffer, offset, position, position + adjusted_length );

            return adjusted_length;
        }
    }
]

if( polyfill.isNode )
    polyfills.push("node:fs")

const {
    read,
    readSync,
    open,
    openSync,
    openAsBlob,
    close,
    closeSync,
    statSync,
    existsSync
} = polyfill(
    ...polyfills
) as {
    read(
        file: FileDescriptor | Blob,
        buffer: Buffer,
        offset: BufferOffset,
        length: BufferLength,
        position: BufferOffset,
        callback: (err: Error | null | undefined, bytesRead: BufferLength | undefined, buffer: Buffer | undefined) => void
    ): void;
    readSync(
        file: FileDescriptor | Blob,
        buffer: Buffer,
        offset: BufferOffset,
        length: BufferLength,
        position: BufferOffset
    ): BufferLength;
} & typeof import("fs")

export const fs = {
    read,
    readSync,
    open,
    openSync,
    openAsBlob,
    close,
    closeSync,
    statSync,
    existsSync
}