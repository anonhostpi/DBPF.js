import { polyfill } from "./polyfill";

import {
    Buffer as CommunityBuffer
} from "buffer";

export type BufferOffset = number;
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

export const Buffer: typeof CommunityBuffer = PolyfillBuffer;
