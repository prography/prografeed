const Room = require('../models/room')

module.exports = function (io, socket) {
  // 클라이언트로부터의 메시지가 수신되면
  socket.on('chat', function (data) {
    console.log('Message from %s: %s', socket.name, data.msg)

    const msg = {userId: socket.userData._id, nickname: socket.name, body: data.msg}

    Room.update(
      {_id: socket.room},
      {$push: {'conversations': msg}},
      (err, result) => {
        if (err) console.log(err)
        console.log(result)
      }
    )
    io.to(socket.room).emit('s2c chat', msg)
  })
  return socket
}
