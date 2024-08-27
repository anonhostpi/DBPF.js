type CacheEntry<IndexType, CachedValueType> = {
    index: IndexType,
    value: CachedValueType,
    freq: number,
    timer: ReturnType<typeof setTimeout>
}
export class LFUCache<IndexType, CachedValueType>{

    private _capacity: number;
    private _ttl: number;
    private _cache: Map<IndexType, CacheEntry<IndexType, CachedValueType>>;
    private _freq: Map<number, Set<IndexType>>;
    private _minFreq: number;

    constructor(
        capacity: number,
        ttl: number
    ) {
        this._capacity = capacity;
        this._ttl = ttl;
        this._cache = new Map();
        this._freq = new Map();
        this._minFreq = 0;
    }

    private _evict( entry?: CacheEntry<IndexType, CachedValueType>): void {
        const frequency = entry?.freq || this._minFreq;
        const candidates = this._freq.get( frequency );
        if (!candidates) return;

        // remove the requested entry if provided, otherwise remove the least recently used
        const index = entry?.index || candidates.keys().next().value;
        // untrack from this freq
        candidates.delete( index! );
        // untrack the entire frequency if no candidates left
        if( !candidates.size ) this._freq.delete( frequency );
        // update min frequency
        if( this._minFreq === frequency ) this._minFreq = this._freq.size ? this._freq.keys().next().value! : 0;

        // remove from cache
        this._cache.delete( index! );
    }

    private _increment( entry: CacheEntry<IndexType, CachedValueType> ): void {
        const { index, freq } = entry;

        // untrack from current frequency
        const frequency_family = this._freq.get( freq );
        frequency_family!.delete( index );
        if( !frequency_family!.size ) this._freq.delete( freq );

        // track in new frequency
        const new_freq = ++entry.freq;
        this._minFreq = Math.min( this._minFreq, new_freq );
        const existing_frequency_family = this._freq.get( new_freq )
        if( existing_frequency_family )
            existing_frequency_family.add( index )
        else
            this._freq.set( new_freq, new Set([index]) );
    }

    private _refresh( entry: CacheEntry<IndexType, CachedValueType> ): void {
        clearTimeout( entry.timer );
        entry.timer = setTimeout( () => this._evict( entry ), this._ttl );
    }

    public get( index: IndexType ): CachedValueType | undefined {
        const entry = this._cache.get( index );
        if( !entry ) return;

        this._increment( entry );
        this._refresh( entry );
        return entry.value;
    }

    public set( index: IndexType, value: CachedValueType ): CachedValueType {
        if( this._capacity <= 0 ) return value;

        const existing_entry = this._cache.get( index );
        if( existing_entry ){
            existing_entry.value = value;
            this._increment( existing_entry );
            this._refresh( existing_entry );
            return value;
        }

        if( this._cache.size >= this._capacity ) this._evict();

        const new_entry: CacheEntry<IndexType, CachedValueType> = {
            index,
            value,
            freq: 1,
            timer: setTimeout( () => this._evict( new_entry ), this._ttl )
        };
        this._cache.set( index, new_entry );
        this._minFreq = 1;
        const frequency_family = this._freq.get( 1 );
        if( frequency_family )
            frequency_family.add( index );
        else
            this._freq.set( 1, new Set([index]) );

        return value;
    }

}