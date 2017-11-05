let express = require('express')
let router = express.Router()
let User = require('../models/user')
let fileUpload = require('express-fileupload')
const Room = require('../models/room')
const path = require('path')

router.use(fileUpload())

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
    res.render('login')
  }
})
router.get('/logout', async (req, res) => {
  req.session.user = null
  res.redirect('/')
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
        res.render('login', {errmsg: '닉네임이 존재하지 않습니다!'})
        break
      case '01':
        res.render('login', {errmsg: '비밀번호가 일치하지 않습니다!'})
        break
      default:
        console.log(err)
        res.render('error', {
          message: err.message,
          error: err
        })
    }
  }
})

router.post('/newppt', async (req, res, next) => {
  var ppt = req.files.ppt
  var pptName = req.files.ppt.name
  console.log(pptName)
  var reg = /pptx|pdf/
  if (!reg.test(pptName)) {
    console.log('no match')
    Room
      .find()
      .populate('owner', 'nickname')
      .sort({'created_at': 1})
      .exec((err, rooms) => {
        if (err) console.log(err)
        res.render('rooms', {rooms, nickname: req.session.user.nickname, errmsg: '파일이 올바른 형식이 아닙니다!'})
      })
  } else {
    ppt.mv(path.join(__dirname, '/../../public/', pptName), function (err) {
      if (err) return res.status(500).send(err)
    })
    new Room({
      ppt: pptName,
      owner: req.session.user._id
    }).save((err, result) => {
      if (err) console.log(err)
      Room
        .find()
        .populate('owner', 'nickname')
        .sort({'created_at': 1})
        .exec((err, rooms) => {
          if (err) console.log(err)
          res.render('rooms', {rooms, nickname: req.session.user.nickname})
        })
    })
  }
})

module.exports = router
