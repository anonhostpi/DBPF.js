# DBPF.js a performant dbpf file reader written in TypeScript

This is a performant library for reading DBPF files in TypeScript/JavaScript. Currently, it only parses the header and index, but a plugin system is planned to allow for reading and handling of the actual data.

## Usage

This library is available on npm:
- for interactive testing (playground), skip to [Building and Interactive Testing](#building-and-interactive-testing)

```pwsh
npm install dbpf.js
```

```typescript
import { DBPF } from 'dbpf.js';

let file: string;
// Node.js:
file = 'path/to/file.package';
// Browser:
file = input.files[0]; // where input is an <input type="file"> element

let dbpf = new DBPF( file );

// immediately available properties:
console.log( dbpf.filename );
console.log( dbpf.filepath );
console.log( dbpf.filesize );
console.log( dbpf.fileext );
// this is immediately available, but this is a set property
// - typically, this is read from the file
// - in this library, this value is just validated (errors out if magic number mismatches)
console.log( dbpf.magic );

// async properties:
await dbpf.init();
// - header properties:
// -- format headers:
console.log( dbpf.header.dbpf.major );
console.log( dbpf.header.dbpf.minor );
console.log( dbpf.header.dbpf.usermajor );
console.log( dbpf.header.dbpf.userminor );
console.log( dbpf.header.dbpf.created );
console.log( dbpf.header.dbpf.modified );
// -- index table headers:
console.log( dbpf.header.index.major );
console.log( dbpf.header.index.minor );
console.log( dbpf.header.index.count );
console.log( dbpf.header.index.size );
console.log( dbpf.header.index.offset );
console.log( dbpf.header.index.first );
// -- hole table headers:
console.log( dbpf.header.hole.count );
console.log( dbpf.header.hole.size );
console.log( dbpf.header.hole.offset );
// - index table:
let entry = dbpf.table[0];
console.log( entry.type );
console.log( entry.group );
console.log( entry.instance ); // NOTE: this is a bigint (128-bit) and not a number (64-bit)
console.log( entry.offset );
console.log( entry.size.compressed );
console.log( entry.size.memory );
console.log( entry.size.file );

/*
The DBPF class has a cache that stores the read data from the file to avoid rereads.
To save memory, a few apis are provided to clear/minimize the cache:
*/
// - clear the entire cache
dbpf.clearCache();
// - skip cache when reading (set 3rd argument to false)
dbpf.read( size, offset, false /*, ( err, dbpf_self )={ ...optional... } */ )

```

## Events

The library is set up as a polyfilled event emitter. The following events are emitted:
- they can be handled with .on, .once, and .off.

- `DBPF`:
  - `error` - emitted when an error occurs
  - `read` - whenever data is successfully read from the file (or cache)
  - `load` - whenever the file is fully read (this can happen multiple times if the cache is cleared)
  - `init` - whenever the dbpf object is fully initialized
    - this only happens once
    - the dbpf object is fully initialized when the header is read and the index table is ready (index table emits its own `init` event)
- `DBPFIndexTable`:
  - `error` - emitted when an error occurs during initialization
  - `init` - whenever the index table is buffered and ready (this only happens once)

## Building and Interactive Testing

Building and testing is pretty simple. The following commands will clone the repository, install dependencies, build the library, and launch a test environment (playground) in the browser.

```pwsh
git clone https://github.com/anonhostpi/DBPF.js
cd DBPF.js

# Install dependencies
npm install

# Build the library
npm run build

# Launch test environment
npm run test
# - sets up a local static server at http://localhost:8080 and opens a browser to a test page for interactive testing
```

Both the build and test build will use webpack to bundle the library for the browser.

The entry points are as follows:

Built files:
- `dist/dbpf.js` - The library for use in node.js
- `dist/dbpf.web.js` - The library for use in the browser
- `test/index.html` and `test/test.web.js` - The test environment for the browser

Source files:
- `src/dbpf.ts` - The main library
- `src/test.ts` - The test environment used by `npm run test`

![DBPF.js test environment](https://github.com/anonhostpi/DBPF.js/blob/main/docs/test.png)