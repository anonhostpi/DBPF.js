[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [DBPF](../README.md) / DBPFIndexTable

# Class: DBPFIndexTable

The DBPF Index Table class.

This class is a Map of DBPF entries.
-

## See

 - [DBPFEntry](DBPFEntry.md)

It implements an EventEmitter interface.
-
 - [EventEmitter](../../polyfill.events/variables/EventEmitter.md)

## Extends

- `Map`\<`number`, `Promise`\<[`DBPFEntry`](DBPFEntry.md)\>\>

## Implements

- [`EventEmitter`](../../polyfill.events/type-aliases/EventEmitter.md)

## Constructors

### new DBPFIndexTable()

> `private` **new DBPFIndexTable**(`DBPF`): [`DBPFIndexTable`](DBPFIndexTable.md)

**`Internal`**

The internal constructor for the DBPF Index Table.

Much like the DBPF reader, this constructor is public, but it is not recommended to use it directly.
Instead, use [DBPF.create](DBPF.md#create) which will create and await the DBPF Index Table for you.

If you must use the constructor directly, ensure to await the [DBPFIndexTable.init](DBPFIndexTable.md#init) method before using the instance.

#### Parameters

• **DBPF**: [`DBPF`](DBPF.md)

The DBPF reader instance to read the index table from.

#### Returns

[`DBPFIndexTable`](DBPFIndexTable.md)

#### Deprecated

#### Overrides

`Map<number,Promise<DBPFEntry>>.constructor`

#### Defined in

[src/DBPF.ts:594](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L594)

## Properties

### \[toStringTag\]

> `readonly` **\[toStringTag\]**: `string`

#### Inherited from

`Map.[toStringTag]`

#### Defined in

node\_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:137

***

### \_DBPF

> `private` **\_DBPF**: [`DBPF`](DBPF.md)

#### Defined in

[src/DBPF.ts:565](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L565)

***

### \_emitter

> `private` **\_emitter**: `_EventEmitter`

#### Defined in

[src/DBPF.ts:881](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L881)

***

### \_entry\_length

> `private` **\_entry\_length**: `undefined` \| `number`

#### Defined in

[src/DBPF.ts:674](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L674)

***

### \_header\_segments

> `private` **\_header\_segments**: `undefined` \| `Map`\<`number`, `number`\>

#### Defined in

[src/DBPF.ts:663](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L663)

***

### \_init

> `private` **\_init**: `undefined` \| [`EventedPromise`](../../polyfill.events/classes/EventedPromise.md)\<`void`\>

#### Defined in

[src/DBPF.ts:749](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L749)

***

### \_mode\_flag

> `private` **\_mode\_flag**: `undefined` \| `number`

#### Defined in

[src/DBPF.ts:649](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L649)

***

### \_offset

> `private` **\_offset**: `number`

#### Defined in

[src/DBPF.ts:568](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L568)

***

### \_reader

> `private` **\_reader**: `BufferReader`

#### Defined in

[src/DBPF.ts:566](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L566)

***

### \_size

> `private` **\_size**: `number`

#### Defined in

[src/DBPF.ts:578](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L578)

***

### emit

> **emit**: [`EventEmitMethod`](../../polyfill.events/type-aliases/EventEmitMethod.md)

#### Implementation of

`EventEmitter.emit`

#### Defined in

[src/DBPF.ts:884](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L884)

***

### length

> `readonly` **length**: `number`

The size of the DBPF Index Table.
- see: [../spec/DBPF.md - Header](../../../spec/DBPF.md#header)
-

#### See

DBPFIndexHeader.size

#### Defined in

[src/DBPF.ts:575](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L575)

***

### off()

> **off**: (`event`, `listener`) => `this`

#### Parameters

• **event**: `string`

• **listener**: `EventListener`

#### Returns

`this`

#### Implementation of

`EventEmitter.off`

#### Defined in

[src/DBPF.ts:883](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L883)

***

### on()

> **on**: (`event`, `listener`) => `this`

#### Parameters

• **event**: `string`

• **listener**: `EventListener`

#### Returns

`this`

#### Implementation of

`EventEmitter.on`

#### Defined in

[src/DBPF.ts:882](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L882)

***

### once()

> **once**: (`event`, `listener`) => `this`

#### Parameters

• **event**: `string`

• **listener**: `EventListener`

#### Returns

`this`

#### Implementation of

`EventEmitter.once`

#### Defined in

[src/DBPF.ts:885](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L885)

***

### ON\_GET

> `readonly` `static` **ON\_GET**: `"get"` = `"get"`

The event name for when the DBPF Index Table retrieves an entry.

#### Defined in

[src/DBPF.ts:900](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L900)

***

### \[species\]

> `readonly` `static` **\[species\]**: `MapConstructor`

#### Inherited from

`Map.[species]`

#### Defined in

node\_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts:319

## Accessors

### entryLength

> `get` **entryLength**(): `number`

The amount of memory used by each entry in the DBPF file.
- see: [../spec/DBPF.md - DBPF v2.0](../../../spec/DBPF.md#dbpf-v20)
- note: That this may not be the full 32 bytes, as the header segments are shared and reused in each entry.

#### Returns

`number`

#### Defined in

[src/DBPF.ts:669](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L669)

***

### headerSegments

> `get` **headerSegments**(): `number`[]

An array of indexes (in order) of where each header segment is reused in each entry.
- see: [../spec/DBPF.md - DBPF v2.0](../../../spec/DBPF.md#dbpf-v20)
- note: The header segments are shared segments between each entry, and are a way to save space in the DBPF file.
  - this means that the amount of bytes used by each entry is reduced by the amount of bytes used for the header segments.

#### Returns

`number`[]

#### Defined in

[src/DBPF.ts:658](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L658)

***

### mode

> `get` **mode**(): `number`

The DBPF v2.0 mode flag (AKA the "Index Table Type").
- see: [../spec/DBPF.md - DBPF v2.0](../../../spec/DBPF.md#dbpf-v20)

#### Returns

`number`

#### Defined in

[src/DBPF.ts:644](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L644)

***

### size

> `get` **size**(): `number`

#### Returns

`number`

the number of elements in the Map.

#### Overrides

`Map.size`

#### Defined in

[src/DBPF.ts:579](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L579)

## Methods

### \[iterator\]()

> **\[iterator\]**(): `IterableIterator`\<[`number`, `Promise`\<[`DBPFEntry`](DBPFEntry.md)\>]\>

#### Returns

`IterableIterator`\<[`number`, `Promise`\<[`DBPFEntry`](DBPFEntry.md)\>]\>

#### Overrides

`Map.[iterator]`

#### Defined in

[src/DBPF.ts:877](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L877)

***

### ~~clear()~~

> **clear**(): `void`

#### Returns

`void`

#### Deprecated

No-ops. Implemented for Map interface.

#### Overrides

`Map.clear`

#### Defined in

[src/DBPF.ts:766](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L766)

***

### ~~delete()~~

> **delete**(`key`): `boolean`

#### Parameters

• **key**: `number`

#### Returns

`boolean`

#### Deprecated

No-ops. Implemented for Map interface.

#### Overrides

`Map.delete`

#### Defined in

[src/DBPF.ts:760](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L760)

***

### entries()

> **entries**(): `IterableIterator`\<[`number`, `Promise`\<[`DBPFEntry`](DBPFEntry.md)\>]\>

Returns an iterable of key, value pairs for every entry in the map.

#### Returns

`IterableIterator`\<[`number`, `Promise`\<[`DBPFEntry`](DBPFEntry.md)\>]\>

#### Overrides

`Map.entries`

#### Defined in

[src/DBPF.ts:856](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L856)

***

### forEach()

> **forEach**(`callbackfn`, `thisArg`?): `void`

Executes a provided function once per each key/value pair in the Map, in insertion order.

#### Parameters

• **callbackfn**

• **thisArg?**: `any`

#### Returns

`void`

#### Overrides

`Map.forEach`

#### Defined in

[src/DBPF.ts:865](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L865)

***

### get()

> **get**(`key`): [`EventedPromise`](../../polyfill.events/classes/EventedPromise.md)\<[`DBPFEntry`](DBPFEntry.md)\>

Gets a DBPF entry from the DBPF Index Table by index

#### Parameters

• **key**: `number`

#### Returns

[`EventedPromise`](../../polyfill.events/classes/EventedPromise.md)\<[`DBPFEntry`](DBPFEntry.md)\>

An evented promise that resolves with the DBPF entry.

#### Overrides

`Map.get`

#### Defined in

[src/DBPF.ts:775](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L775)

***

### has()

> **has**(`key`): `boolean`

#### Parameters

• **key**: `number`

#### Returns

`boolean`

boolean indicating whether an element with the specified key exists or not.

#### Overrides

`Map.has`

#### Defined in

[src/DBPF.ts:844](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L844)

***

### ~~init()~~

> **init**(): [`EventedPromise`](../../polyfill.events/classes/EventedPromise.md)\<`void`\>

Initializes the DBPF Index Table asynchronously, evented.

#### Returns

[`EventedPromise`](../../polyfill.events/classes/EventedPromise.md)\<`void`\>

An evented promise that resolves when the DBPF Index Table is initialized.

#### Deprecated

use [DBPFIndexTable.create](DBPFIndexTable.md#create) instead

#### Defined in

[src/DBPF.ts:681](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L681)

***

### keys()

> **keys**(): `IterableIterator`\<`number`\>

Returns an iterable of keys in the map

#### Returns

`IterableIterator`\<`number`\>

#### Overrides

`Map.keys`

#### Defined in

[src/DBPF.ts:848](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L848)

***

### ~~set()~~

> **set**(`key`, `value`): `this`

#### Parameters

• **key**: `number`

• **value**: `Promise`\<[`DBPFEntry`](DBPFEntry.md)\>

#### Returns

`this`

#### Deprecated

No-ops. Implemented for Map interface.

#### Overrides

`Map.set`

#### Defined in

[src/DBPF.ts:754](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L754)

***

### values()

> **values**(): `IterableIterator`\<`Promise`\<[`DBPFEntry`](DBPFEntry.md)\>\>

Returns an iterable of values in the map

#### Returns

`IterableIterator`\<`Promise`\<[`DBPFEntry`](DBPFEntry.md)\>\>

#### Overrides

`Map.values`

#### Defined in

[src/DBPF.ts:852](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L852)

***

### create()

> `static` **create**(`DBPF`): [`EventedPromise`](../../polyfill.events/classes/EventedPromise.md)\<[`DBPFIndexTable`](DBPFIndexTable.md)\>

Creates a new DBPF Index Table asynchronously, evented.

#### Parameters

• **DBPF**: [`DBPF`](DBPF.md)

The DBPF reader to read the index table from.

#### Returns

[`EventedPromise`](../../polyfill.events/classes/EventedPromise.md)\<[`DBPFIndexTable`](DBPFIndexTable.md)\>

An evented promise that resolves when the DBPF Index Table is created.

#### Defined in

[src/DBPF.ts:544](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L544)

## Events

### ON\_CREATE

> `readonly` `static` **ON\_CREATE**: `"create"` = `"create"`

The event name for when the DBPF Index Table is created properly.

#### Defined in

[src/DBPF.ts:891](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L891)

***

### ON\_ERROR

> `readonly` `static` **ON\_ERROR**: `"error"` = `"error"`

The event name for when the DBPF Index Table encounters an error.

#### Defined in

[src/DBPF.ts:905](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L905)

***

### ON\_INIT

> `readonly` `static` **ON\_INIT**: `"init"` = `"init"`

The event name for when the DBPF Index Table is initialized.

#### Defined in

[src/DBPF.ts:896](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L896)
