const express = require('express')
const router = express.Router()
const Room = require('../models/room')

router.post('/', function (req, res, next) {
  // add room
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
