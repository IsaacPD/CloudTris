const BLOCK_SIZE = 20
const PLAYER_TWO_START = BLOCK_SIZE * WIDTH + 150
const SHIFT_LEFT = 1, SHIFT_RIGHT = 2, DROP_DOWN = 3, ROTATE_LEFT = 4, ROTATE_RIGHT = 5, PAUSE = 6

const KeyToInput = {
    "ArrowLeft"  : SHIFT_LEFT,
    "ArrowRight" : SHIFT_RIGHT,
    "ArrowDown"  : DROP_DOWN,
    "z" : ROTATE_LEFT,
    'x' : ROTATE_RIGHT,
    ' ' : PAUSE
}
class Player {
    constructor() {
        this.held = 0
        this.pressed = 0
        this.rot = -1
    }
}

let p1 = new Player()
let p2 = new Player()
let pause = false
let p1Game = undefined
let p2Game = undefined

function setup() {
    frameRate(60)
    createCanvas(800, 500);
}

function draw() {
    textStyle(BOLD);
    textSize(16)
    background(220)
    noFill()
    rect(0, 0, BLOCK_SIZE * WIDTH, BLOCK_SIZE * HEIGHT)
    rect(PLAYER_TWO_START, 0, BLOCK_SIZE * WIDTH, BLOCK_SIZE * HEIGHT)

    if (!p1Game || !p2Game) {
        fill("black")
        text('Waiting for Player Two...', PLAYER_TWO_START, BLOCK_SIZE * HEIGHT / 2)
        return
    }

    if (pause) {
        fill("black")
        text('Game Paused, Press Space To Unpause', 0, BLOCK_SIZE * HEIGHT + 30)
        return
    }
    
    updateAndDrawGame(p1Game, p1, 0, true)
    updateAndDrawGame(p2Game, p2, PLAYER_TWO_START)
}

function updateAndDrawGame(game, player, xOffset, emitLocked = false) {
    const pieceLocked = game.update(1, player.pressed, player.held, player.rot)
    player.pressed = 0
    player.rot = -1
    let field = game.getField()

    if (pieceLocked && emitLocked) {
        socket.emit('state', {
            field: game.field,
            totalLines: game.totalLines,
            score: game.score,
            seed: game.getSeed()
        })
    }
    
    for (let row = 0; row < field.length; row++) {
        for (let col = 0; col < field[0].length; col++) {
            let x = col * BLOCK_SIZE
            let y = row * BLOCK_SIZE
            if (field[row][col]) {
                fill(color(field[row][col].r, field[row][col].g, field[row][col].b))
                rect(x + xOffset, y, BLOCK_SIZE, BLOCK_SIZE)
            } else {

            }
        }
    }
    fill("black")
    text(`Lines: ${game.totalLines} Score: ${game.score}`, xOffset, BLOCK_SIZE * HEIGHT + 30)
    text(`Level: ${game.level}`, xOffset, BLOCK_SIZE * HEIGHT + 50)
    
    textSize(20)
    let yOffset = BLOCK_SIZE * 5
    for (let key in game.stats) {
        let shape = SHAPES[key]
        drawTetromino(shape, xOffset + BLOCK_SIZE * WIDTH + 10, yOffset)
        fill("black")
        text(`: ${game.stats[key]}`, xOffset + BLOCK_SIZE * (WIDTH + 5), yOffset + (shape.lowestBlockRow - shape.highestBlockRow + 1) * BLOCK_SIZE / 2)
        yOffset += (shape.lowestBlockRow - shape.highestBlockRow + 2) * BLOCK_SIZE
    }

    drawTetromino(game.nextPiece, xOffset + BLOCK_SIZE * WIDTH + 30, BLOCK_SIZE * 2)
    fill("black")
    text('NEXT', xOffset + BLOCK_SIZE * WIDTH + 30, BLOCK_SIZE)
}

function drawTetromino(shape, xOffset, yOffset) {
    for (let row = shape.highestBlockRow; row <= shape.lowestBlockRow; row++) {
        for (let col = shape.letfmostBlockCol; col <= shape.righmostBlockCol; col++) {
            if (shape.get(row, col) === ' ') continue
            fill(color(shape.color.r, shape.color.g, shape.color.b))
            rect(xOffset + BLOCK_SIZE * (col - shape.letfmostBlockCol), 
                 yOffset + BLOCK_SIZE * (row - shape.highestBlockRow), BLOCK_SIZE, BLOCK_SIZE)
        }
    }
}

function keyPressed() {
    if (!KeyToInput[key]) return
    socket.emit('press', KeyToInput[key])
    setPlayerInput(p1, KeyToInput[key])
}

function keyReleased() {
    if (!KeyToInput[key]) return
    socket.emit('release', KeyToInput[key])
    releasePlayerInput(p1, KeyToInput[key])
}

function setPlayerInput(player, input) {
    switch (input) {
        case SHIFT_LEFT:
            player.pressed |= 1 << LEFT
            player.held |= 1 << LEFT
            break
        case SHIFT_RIGHT:
            player.pressed |= 1 << RIGHT
            player.held |= 1 << RIGHT
            break
        case DROP_DOWN:
            player.pressed |= 1 << DOWN
            player.held |= 1 << DOWN
            break
        case ROTATE_LEFT:
            player.rot = 0
            break
        case ROTATE_RIGHT:
            player.rot = 1
            break
        case PAUSE:
            pause = !pause
            break
    }
}

function releasePlayerInput(player, input) {
    switch(input) {
        case SHIFT_LEFT:
            player.held &= ~(1 << LEFT)
            break
        case SHIFT_RIGHT:
            player.held &= ~(1 << RIGHT)
            break
        case DROP_DOWN:
            player.held &= ~(1 << DOWN)
            break
    }
}

const socket = io(document.location.href.slice(0, -1) + ":5000")

socket.on('num_players', (num_players) => {
    if (num_players === 2) {
        socket.emit('ready', true)
    }
})

socket.on('start', (seed) => {
    p1Game = new GameState(5, seed)
    p2Game = new GameState(5, seed)
})

socket.on('press', (key => {
    setPlayerInput(p2, key)
}))

socket.on('release', (keyCode) => {
    releasePlayerInput(p2, keyCode)
})

socket.on('state', (state) => {
    p2Game.field = state.field
    p2Game.totalLines = state.totalLines
    p2Game.score = state.score
})