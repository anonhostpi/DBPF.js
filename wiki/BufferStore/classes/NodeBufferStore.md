[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [BufferStore](../README.md) / NodeBufferStore

# Class: NodeBufferStore

A buffer store for Node.js environments.

## Remarks

This class is designed to work with both Blobs/File objects and file paths.

## Extends

- `BaseBufferStore`

## Constructors

### new NodeBufferStore()

> **new NodeBufferStore**(`file`, `segment_options`): [`NodeBufferStore`](NodeBufferStore.md)

#### Parameters

• **file**: `string` \| `Blob` \| `File`

The Blob/File object or file path to read from.

• **segment\_options**: `Partial`\<`SegmentOptions`\> = `{}`

#### Returns

[`NodeBufferStore`](NodeBufferStore.md)

#### See

SegmentOptions

#### Overrides

`BaseBufferStore.constructor`

#### Defined in

[src/BufferStore.ts:247](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/BufferStore.ts#L247)

## Properties

### \_blob

> `private` **\_blob**: `undefined` \| `Blob` \| `File`

The file property for the Node.js backing store, if it is a Blob or File object.

#### Defined in

[src/BufferStore.ts:258](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/BufferStore.ts#L258)

***

### \_path

> `private` **\_path**: `undefined` \| `string`

The file property for the Node.js backing store, if it is a file path.

#### Defined in

[src/BufferStore.ts:262](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/BufferStore.ts#L262)

***

### count

> `readonly` **count**: `number`

The number of segments in the cache.

#### Inherited from

`BaseBufferStore.count`

#### Defined in

[src/BufferStore.ts:190](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/BufferStore.ts#L190)

***

### length

> `readonly` **length**: `number`

The length of the file in bytes.

#### Inherited from

`BaseBufferStore.length`

#### Defined in

[src/BufferStore.ts:176](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/BufferStore.ts#L176)

***

### segment\_size

> `readonly` **segment\_size**: `number`

The size of each segment in bytes.

#### Inherited from

`BaseBufferStore.segment_size`

#### Defined in

[src/BufferStore.ts:183](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/BufferStore.ts#L183)

## Accessors

### \_file

> `set` `protected` **\_file**(`file`): `void`

The setter for the file property.

#### See

BaseBufferStore._file

#### Parameters

• **file**: `string` \| `Blob` \| `File`

#### Overrides

`BaseBufferStore._file`

#### Defined in

[src/BufferStore.ts:267](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/BufferStore.ts#L267)

## Methods

### \_read()

> `protected` **\_read**(`index`): `Promise`\<`BufferStoreEntry`\>

The Node.js implementation of the cache fallthrough method for retrieving non-cached buffer segments.

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

[src/BufferStore.ts:287](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/BufferStore.ts#L287)

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

[src/BufferStore.ts:231](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/BufferStore.ts#L231)
