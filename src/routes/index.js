let express = require('express')
let router = express.Router()
let User = require('../models/user')

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index')
})

router.post('/', async (req, res, next) => {
  let nickname = req.body.nickname
  let pwd = req.body.pwd

  try {
    await User.confirmLogin(nickname, pwd)
    res.render('chat', {'nickname': nickname, 'pwd': pwd})
  } catch (err) {
    switch (err.code) {
      case '00':
        res.render('index', {err: 'true', errmsg: '닉네임이 존재하지 않습니다!'})
        break
      case '01':
        res.render('index', {err: 'true', errmsg: '비밀번호가 일치하지 않습니다!'})
        break
    }
  }
})

router.post('/rooms', function (req, res, next) {
  var nickname = req.body.nickname
  var pwd = req.body.pwd

  var MongoClient = require('mongodb').MongoClient
  var url = 'mongodb://localhost:27017/prography'

  MongoClient.connect(url, function (err, db) {
    if (err) throw err
    var collection = db.collection('users')
    var query = {nickname: nickname}
    collection.find(query).toArray(function (err, result) {
      if (err) throw err
      if (result.length === 0) {
        db.close()
        res.render('index', {err: 'true', errmsg: '닉네임이 존재하지 않습니다!'})
      } else {
        var query = {nickname: nickname, pwd: pwd}
        collection.find(query).toArray(function (err, result) {
          if (err) throw err
          if (result.length === 0) {
            db.close()
            res.render('index', {err: 'true', errmsg: '비밀번호가 일치하지 않습니다!'})
          } else {
            var collection = db.collection('rooms')
            collection.find().sort({'created_at': 1}).toArray(function (err, result) {
              if (err) throw err
              db.close()
              res.render('rooms', {rooms: result, nickname: nickname})
            })
          }
        })
      }
    })
  })
})

router.post('/chat', function (req, res) {
  var pptname = req.body.pptname
  var nickname = req.body.nickname

  var MongoClient = require('mongodb').MongoClient
  var url = 'mongodb://localhost:27017/prography'

  MongoClient.connect(url, function (err, db) {
    if (err) throw err
    var collection = db.collection('rooms')
    var query = {ppt: pptname}
    collection.find(query).toArray(function (err, result) {
      if (err) throw err
      db.close()
      res.render('chat', {
        pptname: pptname,
        nickname: nickname,
        conversations: JSON.stringify(result[0]['conversations'])
      })
    })
  })
})

module.exports = router
