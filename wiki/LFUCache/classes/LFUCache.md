[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [LFUCache](../README.md) / LFUCache

# Class: LFUCache\<IndexType, CachedValueType\>

LFUCache

A simple implementation of a Least Frequently Used Cache with TTL

## Type Parameters

• **IndexType**

• **CachedValueType**

## Constructors

### new LFUCache()

> **new LFUCache**\<`IndexType`, `CachedValueType`\>(`capacity`, `ttl`): [`LFUCache`](LFUCache.md)\<`IndexType`, `CachedValueType`\>

#### Parameters

• **capacity**: `number`

The amount of entries the cache can store

• **ttl**: `number`

The time-to-live of the cache entries

#### Returns

[`LFUCache`](LFUCache.md)\<`IndexType`, `CachedValueType`\>

#### Defined in

[src/LFUCache.ts:39](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/LFUCache.ts#L39)

## Properties

### \_cache

> `private` **\_cache**: `Map`\<`IndexType`, `CacheEntry`\<`IndexType`, `CachedValueType`\>\>

The underlying Map object used to store the cache entries

#### Defined in

[src/LFUCache.ts:64](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/LFUCache.ts#L64)

***

### \_capacity

> `private` **\_capacity**: `number`

The capacity of the cache

#### Defined in

[src/LFUCache.ts:54](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/LFUCache.ts#L54)

***

### \_freq

> `private` **\_freq**: `Map`\<`number`, `Set`\<`IndexType`\>\>

The frequency map used to track the usage frequency of the cache entries

#### Defined in

[src/LFUCache.ts:69](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/LFUCache.ts#L69)

***

### \_minFreq

> `private` **\_minFreq**: `number`

The lowest usage frequency of the stored cache entries

#### Defined in

[src/LFUCache.ts:74](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/LFUCache.ts#L74)

***

### \_ttl

> `private` **\_ttl**: `number`

The time-to-live of the cache entries

#### Defined in

[src/LFUCache.ts:59](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/LFUCache.ts#L59)

## Methods

### \_evict()

> `private` **\_evict**(`entry`?): `void`

The function used to evict entries from the cache

#### Parameters

• **entry?**: `CacheEntry`\<`IndexType`, `CachedValueType`\>

If provided, evicts the provided entry, otherwise evicts the least recently used entry

#### Returns

`void`

#### Defined in

[src/LFUCache.ts:81](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/LFUCache.ts#L81)

***

### \_increment()

> `private` **\_increment**(`entry`): `void`

Increment the usage frequency of an entry

#### Parameters

• **entry**: `CacheEntry`\<`IndexType`, `CachedValueType`\>

The entry to increment the usage frequency of

#### Returns

`void`

#### Defined in

[src/LFUCache.ts:104](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/LFUCache.ts#L104)

***

### \_refresh()

> `private` **\_refresh**(`entry`): `void`

Refresh the TTL of an entry

#### Parameters

• **entry**: `CacheEntry`\<`IndexType`, `CachedValueType`\>

The entry to refresh the TTL of

#### Returns

`void`

#### Defined in

[src/LFUCache.ts:127](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/LFUCache.ts#L127)

***

### get()

> **get**(`index`): `undefined` \| `CachedValueType`

The getter function to retrieve an entry from the cache

#### Parameters

• **index**: `IndexType`

The index of the entry to retrieve

#### Returns

`undefined` \| `CachedValueType`

The value of the entry if found, otherwise undefined

#### Defined in

[src/LFUCache.ts:137](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/LFUCache.ts#L137)

***

### set()

> **set**(`index`, `value`): `CachedValueType`

The setter function to set an entry in the cache

#### Parameters

• **index**: `IndexType`

The index of the entry to set

• **value**: `CachedValueType`

The value of the entry to set

#### Returns

`CachedValueType`

The value of the entry

#### Defined in

[src/LFUCache.ts:152](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/LFUCache.ts#L152)
