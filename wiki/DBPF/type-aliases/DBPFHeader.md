[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [DBPF](../README.md) / DBPFHeader

# Type Alias: DBPFHeader

> **DBPFHeader**: `object`

The DBPF Header structure.
- see: [../spec/DBPF.md - Header](../../spec/DBPF.md#header)

## Type declaration

### dbpf

> **dbpf**: [`DBPFInfoHeader`](DBPFInfoHeader.md)

Header information for the entire DBPF file.

### index

> **index**: [`DBPFIndexHeader`](DBPFIndexHeader.md)

Header information for the index table.

### trash

> **trash**: [`DBPFTrashHeader`](DBPFTrashHeader.md)

Header information for the trash table (also referred to as the hole table).

## Defined in

[src/DBPF.ts:117](https://github.com/anonhostpi/DBPF.js/blob/bec1c7f946ae1882f8cb333f8c038d29cc8e75d8/src/DBPF.ts#L117)
