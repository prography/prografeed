module.exports = function (io, socket) {
  // 접속한 클라이언트의 정보가 수신되면
  socket.on('login', function (data) {
    console.log('Client logged-in:\n name:' + data.name)
    // socket에 클라이언트 정보를 저장한다
    socket.name = data.name
    socket.room = data.room

    socket.join(socket.room)
    // 접속된 모든 클라이언트에게 메시지를 전송한다
    io.to(socket.room).emit('login', data.name)
  })
  return socket
}
