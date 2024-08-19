const fs = require('fs');
// ensure __dirname/manifests exists
const { execSync } = require('child_process');

const restore = process.argv.includes('--restore');

if( restore ){

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
    if (!fs.existsSync(__dirname + '/manifests')) {
        fs.mkdirSync(__dirname + '/manifests');
    }
    
    const package = require(__dirname + '/../package.json');
    
    // get date string for backup
    const date = new Date();
    date = date.toISOString().replace(/:/g, '.').replace('T', '.')

    // backup the package.json via copy
    const filepath = `${__dirname}/manifests/package.${date}.bak.json`;

    fs.copyFileSync(__dirname + '/../package.json', filepath);
    
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