const path = require('path');

module.exports = {
    entry: './src/DBPF.ts',  // Entry point for your application
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
        fallback: {
            "fs": path.resolve(__dirname, "./src/polyfills/js/fs.js"),
            "path": path.resolve(__dirname, "./src/polyfills/js/path.js"),
            "buffer": require.resolve("buffer/"),
            "worker_threads": path.resolve(__dirname, "./src/polyfills/js/worker_threads.js"),
        }
    },
    module: {
        rules: [
            {
                test: /src[\/\\].+.ts$/, // Source Files
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'tsconfig.esm.json',  // Use this tsconfig file
                        }
                    }
                ], // Use ts-loader to transpile TypeScript
                exclude: [
                    /node_modules/ // Exclude node_modules from transpilation
                ],
            },
            {
                test: /test[\/\\].+.ts$/, // Test Files
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'tsconfig.test.json',  // Use this tsconfig file
                        }
                    }
                ], // Use ts-loader to transpile TypeScript
                exclude: [
                    /node_modules/ // Exclude node_modules from transpilation
                ],
            },
            {
                test: /\.json$/,  // Handle JSON imports
                type: 'json',
            },
        ],
    },
    devtool: false,  // Disable source maps to match your tsconfig
    mode: 'development',  // Can be 'development' or 'production'
};
