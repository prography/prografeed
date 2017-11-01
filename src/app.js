const express = require('express')
const path = require('path')
const favicon = require('static-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const routes = require('./routes/index')
const users = require('./routes/users')
const chat = require('./routes/chat')
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
app.set('ipaddr', '172.31.9.130')
app.set('port', 3000)

app.use('/', routes)
app.use('/users', users)
app.use('/chat', chat)
app.use('/register', register)

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
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

io.on('connection', function (socket) {
  // 접속한 클라이언트의 정보가 수신되면
  socket.on('login', function (data) {
    console.log('Client logged-in:\n name:' + data.name)

    // socket에 클라이언트 정보를 저장한다
    socket.name = data.name
    socket.room = data.room

    socket.join(socket.room)
    // 접속된 모든 클라이언트에게 메시지를 전송한다
    io.to(socket.room).emit('login', data.name)
  })

  // 클라이언트로부터의 메시지가 수신되면
  socket.on('chat', function (data) {
    console.log('Message from %s: %s', socket.name, data.msg)

    const msg = {
      from: {
        name: socket.name
      },
      msg: data.msg
    }

    io.to(socket.room).emit('s2c chat', msg)
  })

  // force client disconnect from server
  socket.on('forceDisconnect', function () {
    socket.disconnect()
  })

  socket.on('disconnect', function () {
    console.log('user disconnected: ' + socket.name)
  })
})

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

module.exports = app
