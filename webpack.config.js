const webpack           = require('webpack')
const path              = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const autoprefixer      = require('autoprefixer')

const sassLoaders = [
  'css-loader',
  'postcss-loader',
  `sass-loader?indentedSyntax=sass&includePaths[]=${path.resolve(__dirname, './src')}`
]

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:3001',
    'webpack/hot/only-dev-server',
    './src/javascripts/main.js'
  ],

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
        test: /\.js[x]?$/
      },
      {
        test: /\.sass$/,
        loader: ExtractTextPlugin.extract('style-loader', sassLoaders.join('!'))
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1!postcss!sass?sourceMap')
      }
    ]
  },

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

  resolve: {
    extensions: ['', '.js', '.sass', '.scss'],
    modulesDirectories: ['src', 'node_modules']
  }
}
