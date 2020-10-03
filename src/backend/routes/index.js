const express = require('express');
const bodyParser = require('body-parser');
const {Message, User, Room} = require('./models')

const router = express.Router();
router.use(bodyParser.json());

module.exports = router;
