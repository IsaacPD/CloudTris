const BLOCK_SIZE = 20
const SPACE_IN_BETWEEN = BLOCK_SIZE * 8
const PLAYER_TWO_START = BLOCK_SIZE * WIDTH + SPACE_IN_BETWEEN
const SHIFT_LEFT = "SHIFT_LEFT", SHIFT_RIGHT = "SHIFT_RIGHT", DROP_DOWN = "DROP_DOWN", ROTATE_LEFT = "ROTATE_LEFT", ROTATE_RIGHT = "ROTATE_RIGHT", PAUSE = "PAUSE"

const KeyToInput = {
    SHIFT_LEFT : "ArrowLeft",
    SHIFT_RIGHT : "ArrowRight",
    DROP_DOWN : "ArrowDown",
    ROTATE_LEFT : "z",
    ROTATE_RIGHT : "x",
    PAUSE : " "
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
    createCanvas(2 * (BLOCK_SIZE * WIDTH + SPACE_IN_BETWEEN), BLOCK_SIZE * (HEIGHT + 5));
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
            seed: game.getSeed(),
            highScore: game.highScore,
            level: game.level,
            gameOver: game.gameOver
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
    textSize(16)
    fill("black")
    text(`Lines: ${game.totalLines} Score: ${game.score}`, xOffset, BLOCK_SIZE * HEIGHT + 30)
    text(`Level: ${game.level} Game Overs: ${game.gameOver}`, xOffset, BLOCK_SIZE * HEIGHT + 50)
    text(`High Score: ${game.highScore}`, xOffset, BLOCK_SIZE * HEIGHT + 70)
    
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
    let input = getInput(key)
    if (!input) return
    socket.emit('press', input)
    setPlayerInput(p1, input)
}

function keyReleased() {
    let input = getInput(key)
    if (!input) return
    socket.emit('release', input)
    releasePlayerInput(p1, input)
}

function preload() {
    soundFormats('wav');
    lineClearSound = loadSound('sound/line');
    lockSound = loadSound('sound/lock');
    rotateSound = loadSound('sound/rotate');
    shiftSound = loadSound('sound/shift');
    tetrisSound = loadSound('sound/tetris');
}

function mousePressed() {
    userStartAudio();
}

function getInput(key) {
    for (let input in KeyToInput) {
        if (KeyToInput[input] === key)
            return input
    }
    return undefined
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
    p1Game = new GameState(7, seed)
    p2Game = new GameState(7, seed)
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
    p2Game.highScore = state.highScore
    p2Game.level = state.level
    p2Game.gameOver = state.gameOver
    p2Game.setSeed(state.seed)
})

window.addEventListener("sound", (e) => {
    e = e.detail
    if (e.player !== p1Game) return

    switch (e.type) {
        case "line":
            lineClearSound.play()
            break
        case "rotate":
            rotateSound.play()
            break
        case "shift":
            shiftSound.play()
            break
        case "tetris":
            tetrisSound.play()
            break
        case "lock":
            lockSound.play()
            break
    }
})