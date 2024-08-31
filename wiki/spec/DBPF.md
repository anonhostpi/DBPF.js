[**DBPF.js v1.0.4**](../README.md) • **Docs**

***

[DBPF.js v1.0.4](../README.md) / DBPF

# The DBPF File Format
## Introduction
The DBPF file format is a file format used in various games, including The Sims Series, SimCity, and Spore.
It is known as a "Database Packed File" and is used to store various types of data, including textures, meshes, and other game assets.
The format is often used in .package files, but can also be found in other file types.

## Versions
The DBPF file format has undergone a few revisions over the last few decades. There are 2 version sets for the format:
- DBPF archive version: This is the version of the archive format itself.
- DBPF index version: This is the version of the index table format.

### Known Versions
| Game            | DBPF Archive Version | DBPF Index Version |
|-----------------|----------------------|--------------------|
| The Sims Online | 1.0                  | 7.0                |
| SimCity 4       | 1.0                  | 7.0                |
| The Sims 2      | 1.0, 1.1             | 7.1                |
| MySims          | 2.0                  | n/a                |
| Spore           | 2.0                  | n/a                |
| The Sims 3      | 2.0                  | n/a                |
| SimCity 2013    | 3.0                  | n/a                |
| The Sims 4      | 2.0                  | n/a                |
- see: http://wiki.niotso.org/DBPF

## Structure
### Header

The following is a table describing the first several bytes of the DBPF file format known as the "Header":

| Field         | Bytes | Versions | Description |
|---------------|-------|----------|-------------|
| Magic Number  | 4     | All      | The magic number for the DBPF file format. This is used to identify the file format. Consists of ASCII/Hex characters "DBPF"
| Major Version | 4     | All      | The major version of the DBPF file format. Known versions: 1, 2, 3
| Minor Version | 4     | All      | The minor version of the DBPF file format.
| User Major    | 4     | 2.0      | The major version specified by the user.
| User Minor    | 4     | 2.0      | The minor version specified by the user.
| Date Created  | 4     | 1.0      | The date the file was created. This is a Unix timestamp.
| Date Modified | 4     | 1.0      | The date the file was last modified. This is a Unix timestamp.
| Index Major   | 4     | <2.0     | The major version of the index table format.
| Index Count   | 4     | All      | The number of entries in the index table.
| Index First   | 4     | <2.0     | The first entry in the index table.
| Index Size    | 4     | All      | The size of the index table in bytes.
| Trash Count   | 4     | <2.0     | The number of entries in the trash table (also known as the "Hole" table).
| Trash Offset  | 4     | <2.0     | The number of entries in the trash table.
| Trash Size    | 4     | <2.0     | The size of the trash table in bytes.
| Index Minor   | 4     | <2.0     | The minor version of the index table format.
| Index Offset  | 4     | 2.0      | The offset of the index table in the file (also known as "Index Position").
| Unknown       | 4     | 2.0      | Unknown field.
| Reserved      | 32    | All      | Reserved space for future use.

- see: http://wiki.niotso.org/DBPF
- see: [s4pi > IPackage.cs](https://github.com/s4ptacle/Sims4Tools/blob/fff19365a12711879bad26481a393a6fbc62c465/s4pi/Interfaces/IPackage.cs#L67-L81)

### The Tables
- see: http://wiki.niotso.org/DBPF

The DBPF file format contains 3 types of tables that function as a table of contents for the file:
- The Index Table: This table contains information about the files embedded in the DBPF file.
- The Trash Table (also known as the Hole Table): This table was used as a way to mark entries as deleted without actually removing them from the file.
- The DIR Table: This table is a subtable used when an entry for the index table is an archive. It is duplicative of the index table, but shows the uncompressed file size, instead of the compressed file size field of the entry.

#### Table Entries (AKA "DBPF Resources")
Each table is a consecutive array of entries. Each entry is a fixed size and contains information about the file it represents.

The size of the entries is determined by the version of the DBPF archive and the index table.

##### DBPF v1.0 - Table Version 7.0

This is the oldest revision of the DBPF file entry. While defined in v1.0, it is also occasionally used in v1.1 files.

It is only 20 bytes long and contains the following fields:

| Field       | Bytes | Description |
|-------------|-------|-------------|
| Type ID     | 4     | The type ID of the file. This is commonly rendered as a hex string.
| Group ID    | 4     | The group ID of the file. This is commonly rendered as a hex string.
| Instance ID | 4     | The instance ID associated with the file. This is commonly rendered as a hex string.
| Offset      | 4     | The offset of the file in the DBPF file.
| Size        | 4     | The size of the file in bytes.

##### DBPF v1.1 - Table Version 7.1

This revision is 24 bytes long

| Field            | Bytes | Description |
|------------------|-------|-------------|
| Type ID          | 4     | The type ID of the file. This is commonly rendered as a hex string.
| Group ID         | 4     | The group ID of the file. This is commonly rendered as a hex string.
| Instance ID High | 4     | The high 32 bits of the instance ID associated with the file. This is commonly rendered as a hex string.
| Instance ID Low  | 4     | The low 32 bits of the instance ID associated with the file. This is commonly rendered as a hex string.
| Offset           | 4     | The offset of the file in the DBPF file.
| Size             | 4     | The size of the file in bytes.

##### DBPF v2.0

v2.0 uses a slightly different format for the table entries. Every entry is a *total* of 32 bytes long, but a portion of that may be shared with what is known as the "Header Entry."

The header entry is a *partial entry* that all DBPF v2.0 entries are derived from. It is variable length, and is typically 0-8 bytes long, but could theoretically be 32 bytes long.

The size of the header entry and the fields present in it are determined by the mode flag (also known as the "Index Type") of the DBPF file. The mode flag is an enum that dictates what fields from the derived entries are to be populated by the header entry.

Flag enums can be tricky to understand and explain, but they are easiest understood when rendered as a binary number. Basically, for each set bit in the underlying binary number, that marks what field is to be pulled from the header entry.

For example, a mode flag of 7 (`0b0111`) would mean that the Type, Group, and Lower Instance fields are pulled from the header entry, while the rest is unique to each entry. NOTE that the "flags" are read from right-to-left, so the rightmost bit represents the Type ID.

| Field             | Bytes | Description |
|-------------------|-------|-------------|
| Type ID           | 4     | The type ID of the file. This is commonly rendered as a hex string.
| Group ID          | 4     | The group ID of the file. This is commonly rendered as a hex string.
| Instance ID High  | 4     | The high 32 bits of the instance ID associated with the file. This is commonly rendered as a hex string.
| Instance ID Low   | 4     | The low 32 bits of the instance ID associated with the file. This is commonly rendered as a hex string.
| Offset            | 4     | The offset of the file in the DBPF file.
| Size - File       | 4     | The number of bytes the resource takes up in the DBPF file.
| Size - Memory     | 4     | The number of bytes the resource takes up uncompressed.
| Compression Flag  | 2     | A the resource compression. Currently, ownly 3 values (other than 0 for no compression) are well defined: 0xFFFF for RefPack, 0xFFFE for streamable RefPack, and 0x5A42 for zlib. There's also a supposed 0xFFE0 for deleted entries.
| Unknown           | 2     | Unknown field.
- see: https://github.com/ytaa/dbpf_reader/blob/d11782b19dd373b363648a54706a935d41ebb2e0/dbpf_reader/dbpf_reader.h#L68-L78
- see: https://github.com/thequux/s4py/blob/892150e78cfd0b6ca51258d5e0d740eb9adffcd1/lib/s4py/package/dbpf.py#L204-L215
- see: https://github.com/sims4toolkit/compression/blob/7f9535f68d3180510392fb1fe76c0cb1a3d5cbbf/docs/enums/CompressionType.json#L22-L41
- see: https://simswiki.info/wiki.php?title=Sims_3:DBPF

##### DBPF v3.0

This format is uncommon, and not much is known about it other than it is possibly used in SimCity 2013.
