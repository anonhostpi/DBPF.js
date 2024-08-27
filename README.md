# DBPF.js a performant dbpf file reader written in TypeScript

This is a performant library for reading DBPF files in TypeScript/JavaScript. Currently, it only parses the header and index, but a plugin system is planned to allow for reading and handling of the actual data.

## Playground/Interactive Testing (github.io)

To see the library in action, you can visit the [playground](https://anonhostpi.github.io/DBPF.js/).

You can also build and run the playground locally by following the instructions in [Building and Interactive Testing](#building-and-interactive-testing):

![DBPF.js test environment](https://github.com/anonhostpi/DBPF.js/blob/main/docs/test.png)

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

let dbpf = await DBPF.create( file );

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
/* await dbpf.init(); */ // this is called automatically by DBPF.create
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
// -- trash table headers:
console.log( dbpf.header.trash.count );
console.log( dbpf.header.trash.size );
console.log( dbpf.header.trash.offset );
// - index table:
//   - header entry:
console.log( dbpf.table.mode );
console.log( dbpf.table.headerSegments );
//   - full entries:
let entry = await dbpf.table.get( 0 );
console.log( entry.type );
console.log( entry.group );
console.log( entry.instance ); // NOTE: this is a bigint (128-bit) and not a number (64-bit)
console.log( entry.offset );
console.log( entry.size.compressed );
console.log( entry.size.memory );
console.log( entry.size.file );

// to read the raw dbpf data, use:
await dbpf.read( size, offset );

```

## Events

WIP

## Building and Interactive Testing

Building and testing is pretty simple. The following commands will clone the repository, install dependencies, build the library, and launch a test environment (playground) in the browser.

```pwsh
git clone https://github.com/anonhostpi/DBPF.js
cd DBPF.js

# Install dependencies
npm run devinstall # wraps `npm install`

# !!! TO ADD DEPS, PLEASE USE: !!!
# npm run devinstall/devuninstall -- <npm-install-args>
# ex: npm run devinstall -- @microsoft/tsdoc --save-dev
# this helps with maintaining package.json's format

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
- `src/test.web.ts` - The script used by the interactive test environment