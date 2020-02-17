const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')


module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    module: [
        {

        }
    ],
    output: {
        filename: '[name].[chunk].js',
        publicPath: '/',
        path: path.resolve(__dirname, 'dist')
    }
})