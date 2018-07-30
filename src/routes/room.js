const express = require('express')
const router = express.Router()
const Room = require('../models/room')

router.get('/:roomId', function (req, res) {
  if (req.session.user) {
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
          nickname: req.session.user.nickname,
          owner: room.owner,
          roomId: roomId
        })
      })
  } else {
    res.redirect('/')
  }
})

module.exports = router
