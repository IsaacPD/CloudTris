const express = require('express')
const app = express()
const routes = require('./routes')
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const {connectToMongoDB} = require('./routes/models')
const PORT = process.env.PORT

app.use('/', routes)

io.on('connection', (socket) => {
  console.log("Got connection ")
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
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app