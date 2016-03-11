const _ = require('lodash')

const express      = require('express')
const io           = require('socket.io')
const mysql        = require('mysql')
const favicon      = require('serve-favicon')
const logger       = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser   = require('body-parser')

const app = express()
app.io = io()
app.db = mysql.createPool({
  host: process.env.MYSQL_SERVER,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
})

// view engine setup
app.set('views', './views')
app.set('view engine', 'ejs')

// Middlewares
app.use(favicon('./public/favicon.ico'))
if(!_.isEqual(app.get('env'), 'test')) {
  app.use(logger('dev'))
}
app.use(bodyParser.json({limit: '100mb'}))
app.use(bodyParser.urlencoded({limit: '100mb', extended: false }))
app.use(cookieParser())
app.use(express.static('./public'))

// Basic Auth
// if(process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD) {
//   app.use(basicAuth(process.env.BASIC_AUTH_USERNAME, process.env.BASIC_AUTH_PASSWORD))
// }

// Route
app.use('/',    require('./routes/index')(app))
app.use('/api', require('./routes/api')(app))

// Websocket handler
require('./routes/ws')(app)


//
// Error handler
//

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

if(_.isEqual(app.get('env'), 'development')) {
  // development error handler
  // will print stacktrace
  app.use((err, req, res) => {
    console.log(err)
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}
else {
  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: {}
    })
  })
}

module.exports = app
