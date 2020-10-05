const BLOCK_SIZE = 20
const PLAYER_TWO_START = BLOCK_SIZE * WIDTH

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
    createCanvas(400, 400);
}

function draw() {
    background(220)
    noFill()
    rect(0, 0, BLOCK_SIZE * WIDTH, BLOCK_SIZE * HEIGHT)
    rect(PLAYER_TWO_START, 0, BLOCK_SIZE * WIDTH, BLOCK_SIZE * HEIGHT)

    if (!p1Game || !p2Game) {
        textSize(16)
        fill("black")
        text('Waiting for Player Two...', PLAYER_TWO_START, BLOCK_SIZE * HEIGHT / 2)
        return
    }

    if (pause) {
        return
    }
    
    updateAndDrawGame(p1Game, p1, 0)
    updateAndDrawGame(p2Game, p2, PLAYER_TWO_START)
}

function updateAndDrawGame(game, player, xOffset) {
    game.update(1, player.pressed, player.held, player.rot)
    player.pressed = 0
    player.rot = -1

    let field = game.getField()
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
}

function keyPressed() {
    socket.emit('press', key)
    setPlayerInput(p1, key)
}

function keyReleased() {
    socket.emit('release', keyCode)
    releasePlayerInput(p1, keyCode)
}

function setPlayerInput(player, key) {
    if (key === "ArrowLeft") {
        player.pressed |= 1 << LEFT
        player.held |= 1 << LEFT
    } else if (key === "ArrowRight") {
        player.pressed |= 1 << RIGHT
        player.held |= 1 << RIGHT
    } else if (key === "ArrowDown") {
        player.pressed |= 1 << DOWN
        player.held |= 1 << DOWN
    } else if (key === ' ') {
        pause = !pause
    } else if (key === 'z') {
        player.rot = 0
    } else if (key === 'x') {
        player.rot = 1
    }
}

function releasePlayerInput(player, keyCode) {
    if (keyCode === LEFT_ARROW) {
        player.held &= ~(1 << LEFT)
    } else if (keyCode === RIGHT_ARROW) {
        player.held &= ~(1 << RIGHT)
    } else if (keyCode === DOWN_ARROW) {
        player.held &= ~(1 << DOWN)
    }
}

const socket = io("localhost:8081")

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