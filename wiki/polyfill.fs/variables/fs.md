[**DBPF.js v1.0.4**](../../README.md) • **Docs**

***

[DBPF.js v1.0.4](../../README.md) / [polyfill.fs](../README.md) / fs

# Variable: fs

> `const` **fs**: `object`

## Type declaration

### close

> **close**: *typeof* `close`

### closeSync()

> **closeSync**: (`fd`) => `void`

Closes the file descriptor. Returns `undefined`.

Calling `fs.closeSync()` on any file descriptor (`fd`) that is currently in use
through any other `fs` operation may lead to undefined behavior.

See the POSIX [`close(2)`](http://man7.org/linux/man-pages/man2/close.2.html) documentation for more detail.

#### Parameters

• **fd**: `number`

#### Returns

`void`

#### Since

v0.1.21

### existsSync()

> **existsSync**: (`path`) => `boolean`

Returns `true` if the path exists, `false` otherwise.

For detailed information, see the documentation of the asynchronous version of
this API: exists.

`fs.exists()` is deprecated, but `fs.existsSync()` is not. The `callback` parameter to `fs.exists()` accepts parameters that are inconsistent with other
Node.js callbacks. `fs.existsSync()` does not use a callback.

```js
import { existsSync } from 'node:fs';

if (existsSync('/etc/passwd'))
  console.log('The path exists.');
```

#### Parameters

• **path**: `PathLike`

#### Returns

`boolean`

#### Since

v0.1.21

### open

> **open**: *typeof* `open`

### openAsBlob()

> **openAsBlob**: (`path`, `options`?) => `Promise`\<`Blob`\>

**`Experimental`**

Returns a `Blob` whose data is backed by the given file.

The file must not be modified after the `Blob` is created. Any modifications
will cause reading the `Blob` data to fail with a `DOMException` error.
Synchronous stat operations on the file when the `Blob` is created, and before
each read in order to detect whether the file data has been modified on disk.

```js
import { openAsBlob } from 'node:fs';

const blob = await openAsBlob('the.file.txt');
const ab = await blob.arrayBuffer();
blob.stream();
```

#### Parameters

• **path**: `PathLike`

• **options?**: `OpenAsBlobOptions`

#### Returns

`Promise`\<`Blob`\>

#### Since

v19.8.0

### openSync()

> **openSync**: (`path`, `flags`?, `mode`?) => `number`

Returns an integer representing the file descriptor.

For detailed information, see the documentation of the asynchronous version of
this API: open.

#### Parameters

• **path**: `PathLike`

• **flags?**: `OpenMode`

• **mode?**: `null` \| `Mode`

#### Returns

`number`

#### Since

v0.1.21

### read

> **read**: (`file`, `buffer`, `offset`, `length`, `position`, `callback`) => `void` & *typeof* `read`

### readSync

> **readSync**: (`file`, `buffer`, `offset`, `length`, `position`) => `number` & (`fd`, `buffer`, `offset`, `length`, `position`?) => `number`(`fd`, `buffer`, `opts`?) => `number`

### statSync

> **statSync**: `StatSyncFn`

## Defined in

[src/polyfill.fs.ts:129](https://github.com/anonhostpi/DBPF.js/blob/5970b3db05862f3a4fc27886740f0325e027cf60/src/polyfill.fs.ts#L129)
