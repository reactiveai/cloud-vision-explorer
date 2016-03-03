'use strict'

// Module dependencies.
const app   = require('./app')
const debug = require('debug')('server')
const http  = require('http')

// Normalize a port into a number, string, or false.
const normalizePort = (val) => {
  const p = parseInt(val, 10)

  // named pipe
  if(isNaN(p)) { return val }

  // port number
  if(p >= 0) { return p }
  return false
}

// Get port from environment and store in Express.
const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)


// Create HTTP server with Socket.IO
const server = http.createServer(app)
app.io.attach(server)

// Listen on provided port, on all network interfaces.
server.listen(port)

// Event listener for HTTP server "error" event.
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

//
// Event listener for HTTP server "listening" event.
//
const onListening = () => {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? `pipe + ${addr}`
    : `port ${addr.port}`
  debug(`Listening on ${bind}`)
}

server.on('error', onError)
server.on('listening', onListening)
