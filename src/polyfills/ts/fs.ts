import { Buffer } from "buffer/";

/**
 * A number representing the offset of a buffer.
 */
type BufferOffset = number;
/**
 * A number representing the length of a buffer.
 */
type BufferLength = number;

/**
 * A file descriptor.
 */
export type FileDescriptor = number;
/**
 * A function for validating function arguments.
 * 
 * @param name the name of the argument
 * @param value the value of the argument
 * @param types an array of typeof strings and classes/constructors
 */
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

/**
 * A browser adaptation of the Node.js `fs.read()` function that uses a `Blob` instead of a file descriptor.
 * 
 * @see https://nodejs.org/api/fs.html#fsreadfd-buffer-offset-length-position-callback
 */
export const read = function(
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
}

/**
 * A browser adaptation of the Node.js `fs.readSync()` function that uses a `Blob` instead of a file descriptor.
 * 
 * @see https://nodejs.org/api/fs.html#fsreadsyncfd-buffer-offset-length-position
 */
export const readSync = function(
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

// no-ops
export const existsSync = () => true 
export const writeFileSync = () => {}