const express = require('express')
const path = require('path')
const favicon = require('static-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')

const index = require('./routes/index')
const room = require('./routes/room')
const register = require('./routes/register')

const app = express()
const server = require('http').Server(app)
const mongoose = require('mongoose')

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

app.use('/', index)
app.use('/room', room)
app.use('/register', register)

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
})

// MongoDB connection
const db = mongoose.connection
db.on('error', error => {
  console.log(error)
})
db.once('open', function () {
  console.log('Connected to mongod server')
})
const config = require('../config.json')
mongoose.connect(config.dev.mongo, {
  useMongoClient: true
})
mongoose.Promise = global.Promise
// MongoDB connection End

app.locals.moment = require('moment')

module.exports = app
