const TEST_PORT = 52501

const app   = require('../app')
const http  = require('http')

app.set('port', TEST_PORT)

const server = http.createServer(app)
app.io.attach(server)


module.exports = {
  startServer(cb) {
    server.on('listening', cb)
    server.listen(TEST_PORT)
  },

  stopServer(cb) {
    server.close()
    cb()
  },
  
  BASE_URL: `http://localhost:${TEST_PORT}`
}
