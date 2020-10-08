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

let players = 0
let numReady = 0

io.on('connection', (socket) => {
  players++
  
  io.emit('num_players', players)
  
  socket.on('disconnect', () => {
    players--
    numReady = 0
  })

  socket.on('ready', (isReady) => {
    if (isReady) {
      numReady++
    }

    if (numReady === 2) {
      io.emit('start', Math.random() * (((1 << 30) * 2) - 1))
    }
  })

  socket.on('press', (key) => {
    socket.broadcast.emit('press', key)
  })

  socket.on('release', (keyCode) => {
    socket.broadcast.emit('release', keyCode)    
  })

  socket.on('state', (field) => {
    socket.broadcast.emit('state', field)
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