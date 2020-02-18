'use strict'
const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


module.exports = {
    mode: 'production',
    entry: {
        ...(fs.readdirSync(path.resolve(__dirname, '../js/')).reduce((entry, file_name) => {
            if (/\.(js|ts)$/.test(file_name) && fs.statSync(path.resolve(__dirname, '../js/' + file_name)).isFile()) {
                entry[file_name.replace(/\.[^\.]+$/, "")] = path.resolve(__dirname, '../js/' + file_name)
            }
            return entry;
        }, {})),
        //vendor: ['babel-polyfill']
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'js/[name].js',
        chunkFilename: 'js/[id].js',
        libraryTarget: "umd"
    },
    module: {
        unknownContextCritical:false,
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: [{
                    loader: "html-loader",
                    options: {
                        attrs: "false"
                    }
                }]
            }, {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    browsers: ['> 1%', 'last 2 versions']
                                },
                                modules: false,
                                "useBuiltIns": false,
                            }]
                        ],
                        "plugins": [
                            "transform-class-properties", ["transform-es2015-for-of", {
                                "loose": true
                            }]
                        ],
                        comments: false
                    }
                },
            }],
    },
    
    resolve: {
        extensions: ['.js', '.ts', '.tsx']
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        ...(fs.readdirSync(path.resolve(__dirname, '../')).reduce((hwps, file_name) => {
            let full_path_name = path.resolve(__dirname, '../' + file_name);
            if (/\.html$/.test(file_name) && fs.statSync(full_path_name).isFile()) {
                hwps.push(new HtmlWebpackPlugin({
                    template: full_path_name,
                    filename: file_name,
                    inject: false
                }));
            }
            return hwps;
        }, [])),
        new CopyWebpackPlugin(
            ["css", "img"].map(dir => {
                return {
                    from: path.resolve(__dirname, '../' + dir),
                    to: "./" + dir
                }
            })
        ),
        //new CleanWebpackPlugin()
    ]
};