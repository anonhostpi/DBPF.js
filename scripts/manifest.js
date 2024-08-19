const fs = require('fs');
// ensure __dirname/manifests exists

const restore = process.argv.includes('--restore');

if( restore ){

    if( fs.existsSync(__dirname + '/manifests/package.bak.json') ){
        fs.copyFileSync(__dirname + '/manifests/package.bak.json', __dirname + '/../package.json');
    } else
        throw new Error('No backup found to restore from! Use git to revert changes.');

} else {
    if (!fs.existsSync(__dirname + '/manifests')) {
        fs.mkdirSync(__dirname + '/manifests');
    }
    
    const package = require(__dirname + '/../package.json');
    
    // backup the package.json via copy
    fs.copyFileSync(__dirname + '/../package.json', __dirname + '/manifests/package.bak.json');
    
    delete package.devDependencies["live-server"];
    delete package.scripts["make:test"];
    delete package.scripts["build:test"];
    delete package.scripts["prebuild:test"];
    delete package.scripts["test"];
    delete package.scripts["test:serve"];
    
    fs.writeFileSync(__dirname + '/../package.json', JSON.stringify(package, null, 2));
}