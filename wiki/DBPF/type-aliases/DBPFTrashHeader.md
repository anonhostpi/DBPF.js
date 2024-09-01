[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [DBPF](../README.md) / DBPFTrashHeader

# Type Alias: DBPFTrashHeader

> **DBPFTrashHeader**: `object`

The DBPF Trash Header structure.

This is a sub-structure of the parsed DBPF header.
-

## Type declaration

### count

> **count**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The number of holes in the DBPF file.

### offset

> **offset**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md) & [`BufferOffset`](../../polyfill.Buffer/type-aliases/BufferOffset.md)

### size

> **size**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md) & [`BufferLength`](../../polyfill.Buffer/type-aliases/BufferLength.md)

## See

[DBPFHeader](DBPFHeader.md)

## Defined in

[src/DBPF.ts:205](https://github.com/anonhostpi/DBPF.js/blob/bec1c7f946ae1882f8cb333f8c038d29cc8e75d8/src/DBPF.ts#L205)
