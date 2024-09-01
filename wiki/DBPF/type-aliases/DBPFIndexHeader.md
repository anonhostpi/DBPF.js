[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [DBPF](../README.md) / DBPFIndexHeader

# Type Alias: DBPFIndexHeader

> **DBPFIndexHeader**: `object`

The DBPF Index Header structure.

This is a sub-structure of the parsed DBPF header.
-

## Type declaration

### count

> **count**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The number of entries in the index table.

### first

> **first**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The offset of the first entry in the index table (v1.x).

### major

> **major**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The major version of the index table.

### minor

> **minor**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The minor version of the index table.

### offset

> **offset**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md) & [`BufferOffset`](../../polyfill.Buffer/type-aliases/BufferOffset.md)

The offset of the index table (v2.0).

### size

> **size**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md) & [`BufferLength`](../../polyfill.Buffer/type-aliases/BufferLength.md)

The size of the index table.

## See

[DBPFHeader](DBPFHeader.md)

## Defined in

[src/DBPF.ts:171](https://github.com/anonhostpi/DBPF.js/blob/5970b3db05862f3a4fc27886740f0325e027cf60/src/DBPF.ts#L171)
