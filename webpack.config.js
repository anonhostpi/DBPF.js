const path = require('path');

module.exports = {
    entry: './src/dbpf.ts',  // Entry point for your application
    output: {
        filename: 'dbpf.web.js',  // Output bundle file
        path: path.resolve(__dirname, 'dist'),  // Output directory
        libraryTarget: 'umd',  // Bundle for Node.js and the browser
        globalObject: 'globalThis',  // Fix global object in the browser
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],  // Resolve these extensions
        alias: {
        '@': path.resolve(__dirname, 'src'),  // Example alias for imports
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,  // Apply this rule to TypeScript files
                use: 'ts-loader',  // Use ts-loader to transpile TypeScript
                exclude: /node_modules/,  // Exclude node_modules from transpilation
            },
            {
                test: /\.json$/,  // Handle JSON imports
                type: 'json',
            },
        ],
    },
    externals: {
        "buffer" : "Buffer",
        "process" : "process",
    },
    devtool: false,  // Disable source maps to match your tsconfig
    mode: 'development',  // Can be 'development' or 'production'
};
