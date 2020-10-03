const io = require('socket.io-client')
const $ = require('jquery')
const GameState = require('./constants')

const playerOne = new GameState(7)
const playerTwo = new GameState(7)
const BLOCK_SIZE = 20
let held = 0
let pressed = 0
let rot = -1
let pause = false

$(document).ready(() => {
    const URL = $('#url')
    console.log(URL)
    const socket = io("localhost:8081")
})

function setup() {
    frameRate(60)
    createCanvas(400, 400);
}

function draw() {
    if (pause) {
        return
    }
    playerOne.update(1, pressed, held, rot)
    pressed = 0
    rot = -1
    background(220)
    noFill()
    rect(0, 0, BLOCK_SIZE * WIDTH, BLOCK_SIZE * HEIGHT)
    let field = playerOne.getField()
    for (let row = 0; row < field.length; row++) {
        for (let col = 0; col < field[0].length; col++) {
            let x = col * BLOCK_SIZE
            let y = row * BLOCK_SIZE
            if (field[row][col]) {
                fill(color(field[row][col].r, field[row][col].g, field[row][col].b))
                rect(x, y, BLOCK_SIZE, BLOCK_SIZE)
            } else {

            }
        }
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        pressed |= 1 << LEFT
        held |= 1 << LEFT
    } else if (keyCode === RIGHT_ARROW) {
        pressed |= 1 << RIGHT
        held |= 1 << RIGHT
    } else if (keyCode === DOWN_ARROW) {
        pressed |= 1 << DOWN
        held |= 1 << DOWN
    } else if (key === ' ') {
        pause = !pause
    } else if (key === 'z') {
        rot = 0
    } else if (key === 'x') {
        rot = 1
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW) {
        held &= ~(1 << LEFT)
    } else if (keyCode === RIGHT_ARROW) {
        held &= ~(1 << RIGHT)
    } else if (keyCode === DOWN_ARROW) {
        held &= ~(1 << DOWN)
    }
}