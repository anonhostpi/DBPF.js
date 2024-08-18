import { polyfill } from "./polyfill";

import {
    Buffer as CommunityBuffer
} from "buffer";

type FileDescriptor = number;
const {
    Buffer: PolyfillBuffer
} = polyfill(
    { Buffer: CommunityBuffer },
    "node:buffer"
)

export const Buffer: typeof CommunityBuffer = PolyfillBuffer;

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

const {
    read,
    open,
    close,
    statSync,
    existsSync
} = polyfill(
    {
        read: function(
            file: FileDescriptor | Blob,
            buffer: Buffer,
            offset: number,
            length: number,
            position: number,
            callback: (err: Error | null | undefined, bytesRead: number | undefined, buffer: Buffer | undefined) => void
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
        }
    },
    "fs"
)

export const fs = {
    read,
    open,
    close,
    statSync,
    existsSync
}