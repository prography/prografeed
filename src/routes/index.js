let express = require('express')
let router = express.Router()
let User = require('../models/user')
const Room = require('../models/room')

router.get('/', async (req, res) => {
  if (req.session.user) {
    Room
      .find()
      .populate('owner', 'nickname')
      .sort({'created_at': 1})
      .exec((err, rooms) => {
        if (err) console.log(err)
        res.render('rooms', {rooms, nickname: req.session.user.nickname})
      })
  } else {
    res.render('index')
  }
})

router.post('/', async (req, res, next) => {
  const {nickname, pwd} = req.body
  try {
    req.session.user = await User.confirmLogin(nickname, pwd)
    Room
      .find()
      .populate('owner', 'nickname')
      .select('owner ppt created_at')
      .sort({'created_at': 1})
      .exec((err, rooms) => {
        if (err) console.log(err)
        res.render('rooms', {rooms, nickname: req.session.user.nickname})
      })
  } catch (err) {
    switch (err.code) {
      case '00':
        res.render('index', {err: 'true', errmsg: '닉네임이 존재하지 않습니다!'})
        break
      case '01':
        res.render('index', {err: 'true', errmsg: '비밀번호가 일치하지 않습니다!'})
        break
      default:
        res.render('error', {
          message: err.message,
          error: err
        })
    }
  }
})

module.exports = router
