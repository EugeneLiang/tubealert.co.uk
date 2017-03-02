'use strict';

// Hack for Ubuntu on Windows: interface enumeration fails with EINVAL, so return empty.
try {
    require('os').networkInterfaces()
} catch (e) {
    require('os').networkInterfaces = () => ({})
}

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const testMatch = /\.jsx?$/;
const excludeMatch = /node_modules/;

const settings = {
    entry: {
        app: path.resolve(__dirname, 'client.js')
    },
    output: {
        path: path.resolve(__dirname, 'public')
    },
    resolve: {
        alias: {
            'scss': path.resolve(__dirname, 'scss'),
            'react': path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
        }
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: testMatch,
                exclude: excludeMatch,
                loader: 'eslint-loader',
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use : [
                        'css-loader',
                        'sass-loader'
                    ]
                })
            },
            {
                test: testMatch,
                exclude: excludeMatch,
                loader: 'babel-loader',
                query: {
                    plugins: ['transform-runtime']
                }
            }
        ]
    },
    plugins: []
};

module.exports = settings;
