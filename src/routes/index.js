let express = require('express')
let router = express.Router()
let User = require('../models/user')
let fileUpload = require('express-fileupload')
const Room = require('../models/room')
const path = require('path')

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
          if (req.session.roommakeerr != 0) {
            if (req.session.roommakeerr == 1) {
              req.session.roommakeerr = 0 
              res.render('rooms', {rooms, nickname: req.session.user.nickname, balloon: req.session.user.recBalloon, errmsg: '파일이 올바른 형식이 아닙니다!'})
            } else {
              req.session.roommakeerr = 0 
              res.render('rooms', {rooms, nickname: req.session.user.nickname, balloon: req.session.user.recBalloon, errmsg: '이미 존재하는 파일 이름입니다!'})
            }
          } else {
            res.render('rooms', {rooms, nickname: req.session.user.nickname, balloon: req.session.user.recBalloon})
          }
        } catch (err) {
        }
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
      .sort({'created_at': -1})
      .exec((err, rooms) => {
        if (err) console.log(err)
        res.render('rooms', {rooms, nickname: req.session.user.nickname, balloon: req.session.user.recBalloon})
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

router.post('/deleteroom', async (req, res, next) => {
  const {pptName} = req.body
  try {
    var msg = await Room.deleteRoomObject(pptName)
    res.send({result: true, msg: await msg})
  } catch (err) {
    switch (err.code) {
      default:
        res.send({result: false, msg: '에러가 발생하였습니다!'})
    }
  }
})


router.post('/sendballoon', async (req, res, next) => {
  const {senderNickname, receiverNickname, balloonNum, pptName} = req.body
  try {
    var sender = await User.getPersonObject(senderNickname)
    var receiver = await User.getPersonObject(receiverNickname)
    var room = await Room.getRoomObject(pptName)
    var recBalloon = await User.sendBalloon(await sender, await receiver, balloonNum)
    req.session.user.recBalloon = await recBalloon
    var roomBalloon = Room.sendBalloon(await recBalloon, await room, balloonNum) 
    res.send({result: true, msg: await recBalloon, roomBalloon: await roomBalloon})
  } catch (err) {
    switch (err.code) {
      case '00':
        res.send({result: false, msg: '별풍이 부족합니다!'})
        break
      case '05':
        res.send({result: false, msg: '같은 팀에게는 별풍을 쏠 수 없습니다!'})
        break
      default:
        //res.send({result: false, msg: '에러가 발생하였습니다!'})
        res.send({result: false, msg: err.message})
    }
  }
})

router.post('/checkballoon', async (req, res, next) => {
  const {pptName} = req.body
  try {
    var room = await Room.getRoomObject(pptName)
    var roomBalloon = Room.getRoomBalloon(await room)
    res.send({result: true, roomBalloon: await roomBalloon})
  } catch (err) {
      res.send({result: false, msg: '오류가 발생하였습니다!'})
  }
})


router.post('/newppt', async (req, res, next) => {
  var ppt = req.files.ppt
  var pptName = req.files.ppt.name
  var reg = /pptx|pdf/
  if (!reg.test(pptName)) {
    req.session.roommakeerr = 1
    res.redirect('/')
  } else {
    ppt.mv(path.join(__dirname, '/../../public/', pptName), function (err) {
      if (err) return res.status(500).send(err)
    })
    new Room({
      ppt: pptName,
      owner: req.session.user._id
    }).save((err, result) => {
      if (err) {
        req.session.roommakeerr = 2
        res.redirect('/')
      } else {
        res.redirect('/')
      }
    })
  }
})

module.exports = router
