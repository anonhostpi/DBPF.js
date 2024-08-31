[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [DBPF](../README.md) / MagicNumber

# Function: MagicNumber()

> **MagicNumber**(`string`): [`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

A magic number generator for DBPF files.
- used in the DBPF header.
- see: [spec/DBPF.md - Header](spec/DBPF.md#header)

## Parameters

• **string**: `string`

The string to convert to a 4-byte magic number.

## Returns

[`FourBytes`](../../BufferStore/type-aliases/FourBytes.md)

The magic number.

## Defined in

[src/DBPF.ts:84](https://github.com/anonhostpi/DBPF.js/blob/96bf3262c3e4b9863c3bc71ebc15b70d5c50d6d9/src/DBPF.ts#L84)
