const path = require('path');

module.exports = require('./webpack.config.js');

module.exports.entry = './test/test.ts';
delete module.exports.output.libraryTarget;
delete module.exports.output.globalObject;
module.exports.output = {
    filename: 'test.web.js',
    path: path.resolve(__dirname, 'test')
}