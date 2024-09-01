[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [DBPF](../README.md) / DBPFInfoHeader

# Type Alias: DBPFInfoHeader

> **DBPFInfoHeader**: `object`

The DBPF Info Header structure.

This is a sub-structure of the parsed DBPF header.
-

## Type declaration

### created

> **created**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The date the DBPF file was created as tracked by the DBPF file itself.

### major

> **major**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The major version of the DBPF file format.

### minor

> **minor**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The minor version of the DBPF file format.

### modified

> **modified**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The date the DBPF file was last modified as tracked by the DBPF file itself.

### usermajor

> **usermajor**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The major version provided by the user (supposedly used for modding).

### userminor

> **userminor**: [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The minor version provided by the user (supposedly used for modding).

## See

[DBPFHeader](DBPFHeader.md)

## Defined in

[src/DBPF.ts:138](https://github.com/anonhostpi/DBPF.js/blob/5970b3db05862f3a4fc27886740f0325e027cf60/src/DBPF.ts#L138)
