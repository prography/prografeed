let express = require('express')
let router = express.Router()
let User = require('../models/user')
let Room = require('../models/room')
let fileUpload = require('express-fileupload')
let path = require('path')

router.use(fileUpload())

router.get('/', async (req, res, next) => {
  if (req.session.user) {
    Room
      .find()
      .populate('owner', 'nickname')
      .sort({'created_at': -1})
      .exec((err, rooms) => {
        if (err) console.log(err)
        try {
          res.render('rooms', {rooms})
        } catch (err) {
          res.render('rooms', {errmsg: '알 수 없는 에러'})
        }
      })
  } else {
    res.render('login')
  }
})

router.post('/', async (req, res, next) => {
  if (req.files) { // PPT Upload
    var ppt = req.files.ppt
    var pptName = req.files.ppt.name
    var reg = /pptx|pdf/

    if (!reg.test(pptName)) {
      Room
        .find()
        .populate('owner', 'nickname')
        .select('owner ppt created_at')
        .sort({'created_at': -1})
        .exec((err, rooms) => {
          if (err) console.log(err)
          res.render('rooms', {rooms, errmsg: '파일이 올바른 형식이 아닙니다!'})
        })
    } else {
      ppt.mv(path.join(__dirname, '/../../uploaded/', pptName), function (err) {
        if (err) return res.status(500).send(err)
      })
      new Room({
        ppt: pptName,
        owner: req.session.user._id
      }).save((err, result) => {
        if (err) {
          Room
            .find()
            .populate('owner', 'nickname')
            .select('owner ppt created_at')
            .sort({'created_at': -1})
            .exec((err, rooms) => {
              if (err) console.log(err)
              res.render('rooms', {rooms, errmsg: '이미 존재하는 파일 이름입니다!'})
            })
        } else {
          Room
            .find()
            .populate('owner', 'nickname')
            .select('owner ppt created_at')
            .sort({'created_at': -1})
            .exec((err, rooms) => {
              if (err) console.log(err)
              res.render('rooms', {rooms})
            })
        }
      })
    }
  } else { // Login
    const {nickname, pwd} = req.body
    try {
      req.session.user = await User.confirmLogin(nickname, pwd)
      Room
        .find()
        .populate('owner', 'nickname')
        .select('owner ppt created_at')
        .sort({'created_at': -1})
        .exec((err, rooms) => {
          if (err) console.log(err)
          res.render('rooms', {rooms})
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
          res.render('login', {errmsg: '알 수 없는 에러'})
          break
      }
    }
  }
})

router.get('/logout', async (req, res) => {
  req.session.user = null
  res.redirect('/')
})

router.post('/deleteroom', async (req, res, next) => {
  const {pptName} = req.body
  try {
    var msg = await Room.deleteRoomObject(pptName)
    res.send({result: true, msg: msg})
  } catch (err) {
    res.send({result: false, msg: '에러가 발생하였습니다!'})
  }
})

module.exports = router
