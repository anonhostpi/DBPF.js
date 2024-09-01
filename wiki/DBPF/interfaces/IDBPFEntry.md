[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [DBPF](../README.md) / IDBPFEntry

# Interface: IDBPFEntry

## See

[DBPFEntry](../classes/DBPFEntry.md)

## Extends

- `Omit`\<[`DBPFEntry`](../classes/DBPFEntry.md), `"constructor"`\>

## Properties

### group

> `readonly` **group**: `number`

The group id of the DBPF resource.

#### Inherited from

`Omit.group`

#### Defined in

[src/DBPF.ts:924](https://github.com/anonhostpi/DBPF.js/blob/bec1c7f946ae1882f8cb333f8c038d29cc8e75d8/src/DBPF.ts#L924)

***

### instance

> `readonly` **instance**: `number` \| `bigint`

The instance id of the DBPF resource.

#### Inherited from

`Omit.instance`

#### Defined in

[src/DBPF.ts:929](https://github.com/anonhostpi/DBPF.js/blob/bec1c7f946ae1882f8cb333f8c038d29cc8e75d8/src/DBPF.ts#L929)

***

### offset

> `readonly` **offset**: `number`

The offset of the DBPF resource in the DBPF file.

#### Inherited from

`Omit.offset`

#### Defined in

[src/DBPF.ts:933](https://github.com/anonhostpi/DBPF.js/blob/bec1c7f946ae1882f8cb333f8c038d29cc8e75d8/src/DBPF.ts#L933)

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

#### Inherited from

`Omit.size`

#### Defined in

[src/DBPF.ts:938](https://github.com/anonhostpi/DBPF.js/blob/bec1c7f946ae1882f8cb333f8c038d29cc8e75d8/src/DBPF.ts#L938)

***

### type

> `readonly` **type**: `number`

The type id of the DBPF resource.

#### Inherited from

`Omit.type`

#### Defined in

[src/DBPF.ts:920](https://github.com/anonhostpi/DBPF.js/blob/bec1c7f946ae1882f8cb333f8c038d29cc8e75d8/src/DBPF.ts#L920)
