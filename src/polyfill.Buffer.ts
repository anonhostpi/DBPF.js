
/**
 * This module provides a polyfill for the Buffer class.
 * 
 * @remarks
 * It also provides type definitions for BufferOffset and BufferLength.
 */

import { polyfill } from "./polyfill";

import {
    Buffer as CommunityBuffer
} from "buffer";

/**
 * A number representing the offset of a buffer.
 */
export type BufferOffset = number;
/**
 * A number representing the length of a buffer.
 */
export type BufferLength = number;

let polyfills: any[] = [
    { Buffer: CommunityBuffer }
]

if( polyfill.isNode )
    polyfills.push("node:buffer")

const {
    Buffer: PolyfillBuffer
} = polyfill(
    ...polyfills
) as typeof import("buffer");

/**
 * The appropriate Buffer class for the current environment (browser or Node.js).
 */
export const Buffer: typeof CommunityBuffer = PolyfillBuffer;
