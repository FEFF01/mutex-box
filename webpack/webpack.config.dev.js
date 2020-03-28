'use strict'
const config = require('./webpack.config.js');

const portfinder = require('portfinder');

const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')


let devWebpackConfig = Object.assign(config, {
    devServer: {
        open: false,
        host: "localhost",//"0.0.0.0",//
        //port: 8000,
        clientLogLevel: 'warning',
    },
    /*module: {},*/ mode: 'development',
    devtool: '#source-map'
});
module.exports = devWebpackConfig;