const express = require('express')
const router = express.Router()
const Room = require('../models/room')
const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploaded/'))
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({storage})

const filepreview = require('filepreview')

router.get('/create', function (req, res, next) {
  // add room page
  res.render('create-room')
})

router.post('/create', upload.single('file'), function (req, res, next) {
  // add room
  console.log(req.file)
  filepreview.generate(req.file.path, path.join(__dirname, '../../uploaded/testing.png'), function (error) {
    if (error) {
      return console.log(error)
    }
    console.log('File preview is /home/myfile_preview.gif')
    res.render('create-room', {image: 'testing.png'})
  })
})

router.get('/:roomId', function (req, res) {
  const {roomId} = req.params
  Room
    .find({_id: roomId})
    .populate('owner', 'nickname')
    .select('owner ppt')
    .exec((err, rooms) => {
      if (err) console.log(err)
      const room = rooms[0]
      res.render('room', {
        pptname: room.ppt,
        nickname: room.owner.nickname,
        roomId: roomId
      })
    })
})

module.exports = router
