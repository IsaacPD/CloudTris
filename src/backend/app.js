const express = require('express')
const app = express()
const routes = require('./routes')
const logger = require('morgan')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const {connectToMongoDB} = require('./routes/models')
const PORT = process.env.PORT

app.use('/', routes)
app.use(logger('dev'))

socketIdToRoom = {}
roomMap = {}

io.on('connection', (socket) => {
  socket.on('room', (room) => {
      socket.join(room)
      if (!roomMap[room]) {
          roomMap[room] = {players: 1, ready: 0, id: room}
      } else {
          roomMap[room].players++
      }
      socketIdToRoom[socket.id] = roomMap[room]
      io.to(room).emit('num_players', roomMap[room].players)
  })


  socket.on('disconnect', () => {
      socketIdToRoom[socket.id].players--
      socketIdToRoom[socket.id].numReady = 0
  })

  socket.on('ready', (isReady) => {
    const room = socketIdToRoom[socket.id]
    if (isReady) {
      room.numReady++
    }

    if (room.numReady === 2) {
      io.to(room.id).emit('start', Math.random() * (((1 << 30) * 2) - 1))
    }
  })

  socket.on('press', (key) => {
    const room = socketIdToRoom[socket.id]
    socket.to(room.id).emit('press', key)
  })

  socket.on('release', (keyCode) => {
    const room = socketIdToRoom[socket.id]
    socket.to(room.id).emit('release', keyCode)
  })

  socket.on('state', (field) => {
    const room = socketIdToRoom[socket.id]
    socket.to(room.id).emit('state', field)
  })
})

// Application will fail if environment variables are not set
if(!process.env.PORT) {
  const errMsg = "PORT environment variable is not defined"
  console.error(errMsg)
  throw new Error(errMsg)
}

if(!process.env.CLOUDTRIS_DB_ADDR) {
  const errMsg = "CLOUDTRIS_DB_ADDR environment variable is not defined"
  console.error(errMsg)
  throw new Error(errMsg)
}

// Connect to MongoDB, will retry only once
connectToMongoDB()

// Starts an http server on the $PORT environment variable
http.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app
