const fs = require('fs');
// ensure __dirname/manifests exists
const { execSync } = require('child_process');

const restore = process.argv.includes('--restore');
const backup = process.argv.includes('--backup');

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
    
    const package = require(__dirname + '/../package.json');
    
    // get date string for backup
    let date = new Date();
    date = date.toISOString().replace(/:/g, '.').replace('T', '.').replace('-', '.').replace('Z', '');

    // backup the package.json via copy
    const filepath = `${__dirname}/manifests/package.${date}.bak.json`;
    fs.copyFileSync(__dirname + '/../package.json', filepath);

    // exit early if only backing up
    if( backup )
        return;

    console.log( "Cleaning up package.json for packing/publishing" );
    
    delete package.devDependencies["live-server"];
    delete package.scripts["make:test"];
    delete package.scripts["build:test"];
    delete package.scripts["prebuild:test"];
    delete package.scripts["test"];
    delete package.scripts["test:serve"];
    
    fs.writeFileSync(__dirname + '/../package.json', JSON.stringify(package, null, 2));

    execSync('npm install', {
        cwd: __dirname + '/..',
        stdio: 'inherit'
    })
}