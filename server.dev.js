

// we start a webpack-dev-server with our config
const webpack           = require('webpack')
const WebpackDevServer  = require('webpack-dev-server')
const config            = require('./webpack.config.js')

new WebpackDevServer(webpack(config), {
  historyApiFallback: true,
  proxy: {
    '*': 'http://localhost:3000'
  },
  stats: {
    children: false,
    colors: true,
    chunks: false
  }
}).listen(3001, 'localhost', (err) => {
  if (err) {
    console.log(err)
  }

  console.log('Listening at localhost:3001')
})
