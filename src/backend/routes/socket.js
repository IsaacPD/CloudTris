const io = require("../app")
const {Message, User, Room} = require('./models')

socketIdToRoom = {}
roomMap = {}

function onConnection(io) {
  return (socket) => {
    socket.on('room', (room) => {
      socket.join(room)
      if (!roomMap[room]) {
        roomMap[room] = {numPlayers: 1, numReady: 0, id: room, players: []}
      } else {
        roomMap[room].numPlayers++
      }
      socketIdToRoom[socket.id] = roomMap[room]
      console.log(roomMap)
      io.to(room).emit('num_players', roomMap[room].numPlayers)
    })


    socket.on('disconnect', () => {
      const room = socketIdToRoom[socket.id]
      if (!room) return
      socketIdToRoom[socket.id].numPlayers--
      socketIdToRoom[socket.id].numReady = 0
      socketIdToRoom[socket.id].players = []
    })

    socket.on('ready', (id, isReady) => {
      const room = socketIdToRoom[socket.id]
      console.log(room)
      if (!room) return
      if (isReady) {
        room.numReady++
        room.players.push(id)
      } else {
        room.numReady--
        const index = room.players.indexOf(id);
        if (index > -1) {
          room.players.splice(index, 1);
        }
      }

      if (room.numReady === room.numPlayers) {
        io.to(room.id).emit('start', room.players, Math.random() * (((1 << 30) * 2) - 1))
      }
      io.to(room.id).emit('ready', room.numReady)
    })

    socket.on('press', (id, key) => {
      const room = socketIdToRoom[socket.id]
      if (!room) return
      socket.to(room.id).emit('press', id, key)
    })

    socket.on('release', (id, keyCode) => {
      const room = socketIdToRoom[socket.id]
      if (!room) return
      socket.to(room.id).emit('release', id, keyCode)
    })

    socket.on('state', (id, state) => {
      const room = socketIdToRoom[socket.id]
      if (!room) return
      socket.to(room.id).emit('state', id, state)
    })

    socket.on('chat message', (message) => {
      const room = socketIdToRoom[socket.id]
      if (!room) return
      io.to(room.id).emit('chat message', message)
    })
  }
}

module.exports = onConnection