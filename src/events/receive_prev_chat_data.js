const Room = require('../models/room')

module.exports = function (io, socket) {
  // 기존 채팅 내역을 보내준다
  socket.on('receive_prev_chat_data', function (data) {
    const chatStream = Room
      .find({_id: socket.room})
      .select('conversations')
      .cursor()
    chatStream.on('data', (doc) => {
      socket.emit('receive_prev_chat_data_continue', doc.conversations)
    }).on('error', (err) => {
      socket.emit('receive_prev_chat_data_error', err)
    }).on('close', () => {
      socket.emit('receive_prev_chat_data_complete', true)
    })
  })
  return socket
}
