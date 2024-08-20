const path = require('path');

module.exports = require('./webpack.config.js');

module.exports.entry = './test/test.web.ts';
module.exports.output = {
    filename: 'test.web.js',
    path: path.resolve(__dirname, 'test', 'serve')
}
module.exports.externals = {
    "../src/dbpf": "dbpf"
}