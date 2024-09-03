## Installation and Usage

This library is available on npm:

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