const express = require('express')
const path = require('path')
const favicon = require('static-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')

const routes = require('./routes/index')
const users = require('./routes/users')
const room = require('./routes/room')
const register = require('./routes/register')

const app = express()

const server = require('http').Server(app)
// http server를 socket.io server로 upgrade한다
const io = require('socket.io')(server)

const mongoose = require('mongoose')

// view engine setup
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'jade')

app.use(favicon())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../uploaded')))
const session = cookieSession({
  name: 'session',
  keys: ['hello', 'world'],
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours,
  autoSave: true
})
app.use(session)

app.set('ipaddr', '172.31.9.130')
app.set('port', 3000)

app.use('/', routes)
app.use('/users', users)
app.use('/room', room)
app.use('/register', register)

/// catch 404 and forwarding to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})

const combineEvents = require('./events/combineEvents')

io.on('connection', function (socket) {
  let cookieString = socket.request.headers.cookie

  let req = {connection: {encrypted: false}, headers: {cookie: cookieString}}
  let res = {getHeader: () => {}, setHeader: () => {}}
  //
  session(req, res, () => {
    socket.userData = req.session.user
  })

  combineEvents(io, socket)
  // force client disconnect from server
  socket.on('forceDisconnect', function () {
    socket.disconnect()
  })

  socket.on('disconnect', function () {
    console.log('user disconnected: ' + socket.name)
  })
})
app.set('io', io)

const db = mongoose.connection

db.on('error', error => {
  console.log(error)
})
db.once('open', function () {
  // CONNECTED TO MONGODB SERVER
  console.log('Connected to mongod server')
})

const config = require('../config.json')
mongoose.connect(config.dev.mongo, {
  useMongoClient: true
})
mongoose.Promise = global.Promise
module.exports = app
