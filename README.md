# DBPF.js a performant dbpf file reader written in TypeScript

This is a performant library for reading DBPF files in TypeScript/JavaScript. Currently, it only parses the header, index and index entries, but a plugin system is planned to allow for reading and handling of the actual data.

**Community DBPF File Format Specification:**
- see: [spec/README.md](spec/README.md).

## Playground/Interactive Testing (github.io)

To see the library in action, you can visit the [playground](https://anonhostpi.github.io/DBPF.js/).

You can also build and run the playground locally by following the instructions in [Building and Interactive Testing](#building-and-interactive-testing):

![DBPF.js test environment](https://github.com/anonhostpi/DBPF.js/blob/main/assets/test.png)

## Usage

This library is available on npm:
- for interactive testing (playground), skip to [Building and Interactive Testing](#building-and-interactive-testing)

```pwsh
npm install dbpf.js
```

```typescript
import { DBPF } from 'dbpf';

let file: string;
// Node.js:
file = 'path/to/file.package';
// Browser:
file = input.files[0]; // where input is an <input type="file"> element

let dbpf = await DBPF.create( file );
```

For more advanced usage, see the [API documentation](docs/classes/DBPF.md).
- For all exported members, see: [docs/globals.md](docs/globals.md).

## Building and Interactive Testing

Building and testing is pretty simple. The following commands will clone the repository, install dependencies, build the library, and launch a test environment (playground) in the browser. This test environment is identical to the one hosted on github.io, just hosted locally.
- NOTE: make sure you have familiarized yourself with what is in [package.json](package.json) and the [scripts directory](scripts/) before running `npm run` commands!

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
npm run build # Also rebuilds the docs!

# Launch test environment
npm run test
# - sets up a local static server at http://localhost:8080 and opens a browser to a test page for interactive testing
```

Both the build and test build will use webpack to bundle the library for the browser.

The entry points are as follows:

- Built files:
  - `dist/DBPF.js` - The library for use in node.js
  - `dist/DBPF.web.js` - The library for use in the browser
  - `test/serve/index.html` and `test/serve/test.web.js` - The test environment for the browser
    - a copy of DBPF.web.js is also copied to `test/serve` and is automatically loaded by the test environment
- Source files:
  - `src/DBPF.ts` - The main library
  - `src/test.web.ts` - The script used by the interactive test environment