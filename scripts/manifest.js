const fs = require('fs');
// ensure __dirname/manifests exists
const { execSync } = require('child_process');

const restore = process.argv.includes('--restore');
const backup = process.argv.includes('--backup');
const formatFlag = process.argv.includes('--format');

if( restore ){

    console.log( "Restoring development package.json" );

    // get latest backup
    const files = fs.readdirSync(__dirname + '/manifests');
    const latest = files.sort().reverse()[0];
    const filepath = `${__dirname}/manifests/${latest}`;

    // restore the package.json via copy
    fs.copyFileSync(filepath, __dirname + '/../package.json');

    execSync('npm install', {
        cwd: __dirname + '/..',
        stdio: 'inherit'
    });

} else {
    console.log( "Backing up package.json" );
    
    if (!fs.existsSync(__dirname + '/manifests')) {
        fs.mkdirSync(__dirname + '/manifests');
    }
    
    // get date string for backup
    let date = new Date();
    date = date.toISOString().replace(/:/g, '.').replace('T', '.').replace('-', '.').replace('Z', '');

    // backup the package.json via copy
    const filepath = `${__dirname}/manifests/package.${date}.bak.json`;
    fs.copyFileSync(__dirname + '/../package.json', filepath);

    // exit early if only backing up
    if( backup )
        return;

    const {
        alignJSON: format,
        splitCommaDelimited: split
    } = require('./indent.json.js');
    let package = require(__dirname + '/../package.json');
    const formatted = format(package);

    const lastKeyword = package.keywords[package.keywords.length - 1];
    // get all lines after "keywords" and before (but including) last keyword
    let lines = formatted.split('\n');
    const keywordStart = lines.findIndex( line => line.includes('"keywords":') ) + 1;
    const keywordEnd = lines.findIndex( (line, i) => i > keywordStart && line.includes(lastKeyword) );
    
    lines = lines.map(
        (line, i) => {
            if( i >= keywordStart && i <= keywordEnd ){
                values = split(line);
                values = values.map( value => {
                    let padding = /^ */.exec(value)[0];
                    value = value
                        .trim()
                        .toLowerCase()
                        .replace(/ /g, '-');
                    return padding + value;
                })
                line = values.join(',');
            }
            return line;
        }
    );

    const kwCorrected = lines.join('\n');

    const addEmptyLineBefore = [
        "homepage",
        "main",
        "scripts",
            "make:node",
            "build",
            "build:web",
            "prebuild",
            "postbuild",
            "test",
            "prepack",
            "manifest:prepare",
            "predevinstall",
            "predevuninstall",
            "prepublishOnly",
            "docs",
        "devDependencies"
    ].map( key => `"${key}":` );

    lines = kwCorrected.split('\n');
    for( let i = 0; i < lines.length; i++ ){
        const line = lines[i];
        const hasEmptyLineBefore = addEmptyLineBefore.some( key => line.includes(key) );
        if( hasEmptyLineBefore ){
            lines.splice(i, 0, '');
            i++;
        }
    }
    const finalDevFormat = lines.join('\n');

    fs.writeFileSync(__dirname + '/../package.json', finalDevFormat);

    // exit early if only formatting
    if( formatFlag )
        return;

    package = JSON.parse(finalDevFormat);

    console.log( "Cleaning up package.json for packing/publishing" );
    
    delete package.devDependencies["live-server"];
    delete package.scripts["make:test"];
    delete package.scripts["build:test"];
    delete package.scripts["prebuild:test"];
    delete package.scripts["test"];
    delete package.scripts["test:serve"];
    delete package.scripts["test:pub"];
    delete package.scripts["make:docs"];
    delete package.scripts["docs"];
    delete package.scripts["predocs"];
    delete package.scripts["postdocs"];
    delete package.scripts["docs:pub"];
    delete package.scripts["predocs:pub"];
    delete package.scripts["premake:docusaurus"]
    delete package.scripts["make:docusaurus"]
    delete package.scripts["postmake:docusaurus"]

    const published = JSON.stringify(package, null, 2);
    
    fs.writeFileSync(__dirname + '/../package.json', published);

    execSync('npm install', {
        cwd: __dirname + '/..',
        stdio: 'inherit'
    })
}