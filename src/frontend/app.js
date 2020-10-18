const express = require('express')
const path = require('path');
const app = express();
const logger = require('morgan')
const bodyParser = require('body-parser')
const axios = require('axios')

const CLOUDTRIS_API_ADDR = process.env.CLOUDTRIS_API_ADDR

const BACKEND_URI = `http://${CLOUDTRIS_API_ADDR}`

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))

const router = express.Router()
app.use(router)
app.use(logger('dev'))
app.use(express.static('public'))
app.use('/dist', express.static('dist'))
router.use(bodyParser.urlencoded({ extended: false }))

// Application will fail if environment variables are not set
if(!process.env.PORT) {
  const errMsg = "PORT environment variable is not defined"
  console.error(errMsg)
  throw new Error(errMsg)
}

if(!process.env.CLOUDTRIS_API_ADDR) {
  const errMsg = "CLOUDTRIS_API_ADDR environment variable is not defined"
  console.error(errMsg)
  throw new Error(errMsg)
}

// Starts an http server on the $PORT environment variable
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

// Handles GET request to /
router.get("/", (req, res) => {
  axios.get(`${BACKEND_URI}/rooms`)
  .then(response => {
    res.render("home", {rooms: response.data})
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
});

router.post("/addroom", (req, res) => {
  axios.post(`${BACKEND_URI}/room`)
  .then(response => {
    res.json({id: response.data.room})
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
})

router.get("/room/:id", (req, res) => {
  const id = req.params.id

  res.render("game")
})
