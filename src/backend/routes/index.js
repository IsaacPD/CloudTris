const express = require('express');
const bodyParser = require('body-parser');
const {Message, User, Room} = require('./models')

const router = express.Router();
router.use(bodyParser.json());

router.get("/rooms", (req, res) => {
    Room.find({}, function(err, rooms) {
      res.json(rooms)
    })
})

router.post("/room", (req, res) => {
  Room.create({}, function(err, room) {
    res.json({room: room._id})
  })
})

module.exports = router;
