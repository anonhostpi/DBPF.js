# STATUS: ON HOLD

Currently, the project is in a pretty good place for forking. It supports DBPF v1.0-v2.x and has good documentation for starting work on v3. However, due to external time constraints, I can not actively maintain this at the moment. I am always willing to offer help to anyone who reaches out to me.

What work needs to be done:
- Add parsers/plugins for each DBPF entry type. With the way I have designed my reader, this shouldn't be very hard. I recommend using KaiTai parsers for this as they have a JS transpiler, and they work with yaml.

What work should be done:
- Work on implementing Web Workers/Worker Threads. This would require a huge refactor, because it would have to change how the buffers are cached. The current LFU cache would be inadequate and lacks methods for sharing data efficiently over separate threads.
  - However, due to the fact that it is designed to work only with fixed memory sizes and chunk counts, it should be easy to refactor it to use a SharedArrayBuffer in place of Map objects, but this would require a decent amount of knowledge on how to store data at the binary level.
    - I can help with this, if needed and have been working on an idea to efficiently implement a different cache.

# [DBPF.js](https://anonhostpi.github.io/DBPF.js) a performant dbpf file reader written in TypeScript

This is a performant library for reading DBPF files in TypeScript/JavaScript. Currently, it only parses the header, index and index entries, but a plugin system is planned to allow for reading and handling of the actual data.

**Community DBPF File Format Specification:**
- see: [API Documentation > DBPF File Format](https://anonhostpi.github.io/DBPF.js/docs/other/spec)

**API Documentation:**
- see: [API Documentation](https://anonhostpi.github.io/DBPF.js/docs/API)

**Local Documentation:**
- see: [Building the Docs Locally](#building-the-docs-locally)

## Playground/Interactive Testing (github.io)

To see the library in action, you can visit the [playground](https://anonhostpi.github.io/DBPF.js/playground).

You can also build and run the playground locally by following the instructions in [Building and Interactive Testing](#building-and-interactive-testing):

![DBPF.js test environment](https://github.com/anonhostpi/DBPF.js/blob/main/docs/assets/v1.1.0.png)

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

For more advanced usage, see the [API documentation](https://anonhostpi.github.io/DBPF.js/docs/API).
- For all exported members, see: [the UMD export](https://anonhostpi.github.io/DBPF.js/docs/DBPF/variables/dbpf).

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
npm run build

# Launch test environment
npm run test
# - sets up a local static server at http://localhost:8080 and opens a browser to a test page for interactive testing
```

Both the build and test build will use webpack to bundle the library for the browser.

### Entry Points

The entry points are as follows:

- Built files:
  - `dist/DBPF.js` - The library for use in node.js
  - `dist/DBPF.web.js` - The library for use in the browser
  - `test/serve/index.html` and `test/serve/test.web.js` - The test environment for the browser
    - a copy of DBPF.web.js is also copied to `test/serve` and is automatically loaded by the test environment
- Source files:
  - `src/DBPF.ts` - The main library
  - `src/test.web.ts` - The script used by the interactive test environment

## Building the Docs Locally

To get the full set of docs locally, run either:
- `npm run docs`: to build the typedoc documentation (./wiki)
- `npm run test:pub`: to build the typedoc documentation and run docusaurus:serve (view the docs from your browser).
  - _also runs some minor cleanup work before building with docusaurus_

The full set of docs does not need to be built locally to be used or read.
- The typedocs are sourced from the comments in the ./src files 
- The project docs are sourced from ./docs.

There are no other documentation sources in this repo other than this README and the LICENSE.
