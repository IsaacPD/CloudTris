const io = require("./app")

socketIdToRoom = {}
roomMap = {}

io.on('connection', (socket) => {
  socket.on('room', (room) => {
    socket.join(room)
    if (!roomMap[room]) {
        roomMap[room] = {players: 1, numReady: 0, id: room}
    } else {
        roomMap[room].players++
    }
    console.log(roomMap)
    socketIdToRoom[socket.id] = roomMap[room]
    io.to(room).emit('num_players', roomMap[room].players)
  })


  socket.on('disconnect', () => {
    const room = socketIdToRoom[socket.id]
    if (!room) return
    socketIdToRoom[socket.id].players--
    socketIdToRoom[socket.id].numReady = 0
  })

  socket.on('ready', (isReady) => {
    const room = socketIdToRoom[socket.id]
    console.log(room)
    if (!room) return
    if (isReady) {
      room.numReady++
    }

    if (room.numReady === 2) {
      io.to(room.id).emit('start', Math.random() * (((1 << 30) * 2) - 1))
    }
  })

  socket.on('press', (key) => {
    const room = socketIdToRoom[socket.id]
    if (!room) return
    socket.to(room.id).emit('press', key)
  })

  socket.on('release', (keyCode) => {
    const room = socketIdToRoom[socket.id]
    if (!room) return
    socket.to(room.id).emit('release', keyCode)
  })

  socket.on('state', (field) => {
    const room = socketIdToRoom[socket.id]
    if (!room) return
    socket.to(room.id).emit('state', field)
  })
})