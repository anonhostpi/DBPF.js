[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [DBPF](../README.md) / DBPFEntry

# Class: DBPFEntry

The DBPF Entry class.

It is a representation of a DBPF resource.
- see: [../spec/DBPF.md - Table Entries (AKA "DBPF Resources")](../../spec/DBPF.md#table-entries-aka-dbpf-resources)

## Constructors

### new DBPFEntry()

> **new DBPFEntry**(`DBPF`, `type`, `group`, `instance`, `offset`, `size`): [`DBPFEntry`](DBPFEntry.md)

#### Parameters

• **DBPF**: [`DBPF`](DBPF.md)

• **type**: `number`

• **group**: `number`

• **instance**: `number` \| `bigint`

• **offset**: `number`

• **size**

• **size.file**: `number`

• **size.flag**: `number`

• **size.memory**: `number`

#### Returns

[`DBPFEntry`](DBPFEntry.md)

#### Defined in

[src/DBPF.ts:954](https://github.com/anonhostpi/DBPF.js/blob/5970b3db05862f3a4fc27886740f0325e027cf60/src/DBPF.ts#L954)

## Properties

### \_DBPF

> `private` **\_DBPF**: [`DBPF`](DBPF.md)

#### Defined in

[src/DBPF.ts:915](https://github.com/anonhostpi/DBPF.js/blob/5970b3db05862f3a4fc27886740f0325e027cf60/src/DBPF.ts#L915)

***

### group

> `readonly` **group**: `number`

The group id of the DBPF resource.

#### Defined in

[src/DBPF.ts:924](https://github.com/anonhostpi/DBPF.js/blob/5970b3db05862f3a4fc27886740f0325e027cf60/src/DBPF.ts#L924)

***

### instance

> `readonly` **instance**: `number` \| `bigint`

The instance id of the DBPF resource.

#### Defined in

[src/DBPF.ts:929](https://github.com/anonhostpi/DBPF.js/blob/5970b3db05862f3a4fc27886740f0325e027cf60/src/DBPF.ts#L929)

***

### offset

> `readonly` **offset**: `number`

The offset of the DBPF resource in the DBPF file.

#### Defined in

[src/DBPF.ts:933](https://github.com/anonhostpi/DBPF.js/blob/5970b3db05862f3a4fc27886740f0325e027cf60/src/DBPF.ts#L933)

***

### size

> `readonly` **size**: `object`

The compression information about the DBPF resource.

#### file

> **file**: `number`

The amount of bytes the DBPF resource takes up in the DBPF file.

#### flag

> **flag**: `number`

The compression flag of the DBPF resource.
- see: [../spec/DBPF.md - DBPF v2.0](../../spec/DBPF.md#dbpf-v20)

#### memory

> **memory**: `number`

The amount of bytes the DBPF resource takes up uncompressed in memory.

#### Defined in

[src/DBPF.ts:938](https://github.com/anonhostpi/DBPF.js/blob/5970b3db05862f3a4fc27886740f0325e027cf60/src/DBPF.ts#L938)

***

### type

> `readonly` **type**: `number`

The type id of the DBPF resource.

#### Defined in

[src/DBPF.ts:920](https://github.com/anonhostpi/DBPF.js/blob/5970b3db05862f3a4fc27886740f0325e027cf60/src/DBPF.ts#L920)
