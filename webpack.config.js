const webpack   = require('webpack')
const path      = require('path')

module.exports = {
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:3001',
    'webpack/hot/only-dev-server',
    './public/javascripts/main.js'
  ],

  output: {
    path: path.resolve(__dirname, './public/javascripts'),
    filename: 'bundle.js'
  },

  module: {
    loaders: [
      {
        loaders: [ 'react-hot', 'babel' ],
        exclude: /node_modules/,
        include: __dirname,
        test: /\.js[x]?$/
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
}
