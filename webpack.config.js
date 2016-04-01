'use strict'
const _                 = require('lodash')
const webpack           = require('webpack')
const path              = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const autoprefixer      = require('autoprefixer')

let entryPoint = null
if(_.isEqual(process.env.NODE_ENV, 'production')) {
  entryPoint = [
    './src/javascripts/main.js'
  ]
}
else {
  entryPoint = [
    'webpack-dev-server/client?http://0.0.0.0:3001',
    'webpack/hot/only-dev-server',
    './src/javascripts/main.js'
  ]
}

module.exports = {
  devtool: 'inline-source-map',
  entry: entryPoint,

  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'bundle.js'
  },

  module: {
    loaders: [
      {
        loaders: [ 'react-hot', 'babel' ],
        exclude: /node_modules/,
        include: __dirname,
        test: /\.jsx?$/
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap!postcss!sass?sourceMap')
      },
      {
        test: /\.scss$/,
        include: /node_modules\/react-toolbox/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1!postcss!sass?sourceMap!toolbox')
      },
      {
        test: /\.svg$/,
        loader: 'url?limit=10000'
      }
    ]
  },

  toolbox: { theme: 'src/stylesheets/toolbox-theme.scss' },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('[name].css')
  ],

  postcss: [
    autoprefixer({
      browsers: ['last 2 versions']
    })
  ],

  sassLoader: {
    includePaths: [path.resolve(__dirname, './src')]
  },

  resolve: {
    extensions: ['', '.js', '.scss', '.svg'],
    modulesDirectories: ['src', 'node_modules']
  }
}
