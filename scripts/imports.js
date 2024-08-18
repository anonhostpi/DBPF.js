const fs = require('fs');
const package = require( __dirname + '/../package.json' );

const body = [
    "// package.json dependencies"
]

const deps = Object.keys( package.dependencies ).map( dep => `import '${dep}';` );

body.push( ...deps );

fs.writeFileSync( __dirname + '/../src/imports.ts', body.join('\n') );