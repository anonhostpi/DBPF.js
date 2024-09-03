[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [BufferStore](../README.md) / BrowserBufferStore

# Class: BrowserBufferStore

A buffer store for browser environments.

## Remarks

This class is designed to work only with Blobs and File objects.

## Extends

- `BaseBufferStore`

## Constructors

### new BrowserBufferStore()

> **new BrowserBufferStore**(`file`, `segment_options`): [`BrowserBufferStore`](BrowserBufferStore.md)

#### Parameters

• **file**: `Blob` \| `File`

The Blob/File object to read from.

• **segment\_options**: `Partial`\<`SegmentOptions`\> = `{}`

#### Returns

[`BrowserBufferStore`](BrowserBufferStore.md)

#### See

SegmentOptions

#### Overrides

`BaseBufferStore.constructor`

#### Defined in

[src/BufferStore.ts:336](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/BufferStore.ts#L336)

## Properties

### \_blob

> `private` **\_blob**: `undefined` \| `Blob` \| `File`

The file property for the browser backing store.

#### Defined in

[src/BufferStore.ts:349](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/BufferStore.ts#L349)

***

### count

> `readonly` **count**: `number`

The number of segments in the cache.

#### Inherited from

`BaseBufferStore.count`

#### Defined in

[src/BufferStore.ts:190](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/BufferStore.ts#L190)

***

### length

> `readonly` **length**: `number`

The length of the file in bytes.

#### Inherited from

`BaseBufferStore.length`

#### Defined in

[src/BufferStore.ts:176](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/BufferStore.ts#L176)

***

### segment\_size

> `readonly` **segment\_size**: `number`

The size of each segment in bytes.

#### Inherited from

`BaseBufferStore.segment_size`

#### Defined in

[src/BufferStore.ts:183](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/BufferStore.ts#L183)

## Accessors

### \_file

> `set` `protected` **\_file**(`file`): `void`

The setter for the file property.

#### See

BaseBufferStore._file

#### Parameters

• **file**: `Blob` \| `File`

#### Overrides

`BaseBufferStore._file`

#### Defined in

[src/BufferStore.ts:354](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/BufferStore.ts#L354)

## Methods

### \_read()

> `protected` **\_read**(`index`): `Promise`\<`BufferStoreEntry`\>

The browser implementation of the cache fallthrough method for retrieving non-cached buffer segments.

#### Parameters

• **index**: `number`

The index of the buffer segment to read from the file system.

#### Returns

`Promise`\<`BufferStoreEntry`\>

#### See

BaseBufferStore._read

#### Overrides

`BaseBufferStore._read`

#### Defined in

[src/BufferStore.ts:367](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/BufferStore.ts#L367)

***

### get()

> **get**(`offset`, `length`): `BufferReader`

Retrieves a buffer by its offset and length and wraps it in a BufferReader.

#### Parameters

• **offset**: `number`

• **length**: `number`

#### Returns

`BufferReader`

#### Inherited from

`BaseBufferStore.get`

#### Defined in

[src/BufferStore.ts:231](https://github.com/anonhostpi/DBPF.js/blob/e569a7b6dd4749dd61bb4dc9869d762307968221/src/BufferStore.ts#L231)
