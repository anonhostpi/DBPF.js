import { Mutex } from './mutex';
import { Buffer } from './polyfill.fs'

export class PromiseSafeBufferCache {
    private _cache = new Map<number, Buffer>();
    private _cacheMutex = new Mutex();
    private _currentStart = 0;
    private _currentEnd = 0;
    get start() {
        return this._currentStart;
    }
    get end() {
        return this._currentEnd;
    }
    get count() {
        return this._cache.size;
    }

    private async defrag() {
        const sortedEntries = Array.from(this._cache.entries())
            .sort(([a], [b]) => a - b);

        const mergedBuffers: Map<number, Buffer> = new Map<number, Buffer>();

        let currentOffset = sortedEntries[0][0];
        let currentBuffer = sortedEntries[0][1];

        this._currentStart = currentOffset;

        for( let i = 1; i < sortedEntries.length; i++ ){
            const [offset, buffer] = sortedEntries[i];

            if( currentOffset + currentBuffer.length === offset ){
                const overlap = offset - currentOffset;
                const bufferToMerge = buffer.subarray(overlap);
                if( bufferToMerge.length )
                    currentBuffer = Buffer.concat([currentBuffer, bufferToMerge]);
            } else {
                mergedBuffers.set(currentOffset, currentBuffer);
                currentOffset = offset;
                currentBuffer = buffer;
            }
        }

        mergedBuffers.set(currentOffset, currentBuffer);
        this._currentEnd = currentOffset + currentBuffer.length;

        this._cache = mergedBuffers;
    }

    public async get( offset: number, length: number ): Promise<Buffer | undefined> {

        if( this._cacheMutex.isLocked )
            console.warn("BufferCache: a write operation is in progress, reading may be inconsistent");

        const entry = Array.from( this._cache.entries() ).find(
            ([ cacheOffset, buffer ]) => {
                return cacheOffset <= offset &&
                    cacheOffset + buffer.length >= offset + length;
            }
        )

        if( !entry )
            return undefined;

        const [ start, buffer ] = entry;
        const end = start + buffer.length;

        if( offset + length > end )
            return undefined;

        return buffer.subarray(offset - start, offset - start + length);

    }

    public async set( offset: number, buffer: Buffer ): Promise<void> {
        const unlock = await this._cacheMutex.getLock();
        this._cache.set(offset, buffer);
        await this.defrag();
        unlock();
    }

    public async clear(): Promise<void> {
        const unlock = await this._cacheMutex.getLock();
        this._cache.clear();
        unlock();
    }
}