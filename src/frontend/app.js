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
    res.render("home", {BACKEND_URL: BACKEND_URI})
});