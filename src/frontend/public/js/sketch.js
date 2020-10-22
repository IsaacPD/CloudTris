//TODO Custom rules for the tetris game per room
const DEFAULT_SIZE = 20
const SHIFT_LEFT = "SHIFT_LEFT", SHIFT_RIGHT = "SHIFT_RIGHT", DROP_DOWN = "DROP_DOWN", ROTATE_LEFT = "ROTATE_LEFT", ROTATE_RIGHT = "ROTATE_RIGHT", PAUSE = "PAUSE"
const MSPS = 1000
const FPS = 60
const SPF = 1 / 60
const GAME_OVERS = 3

let Settings = {
    BLOCK_SIZE: DEFAULT_SIZE,
    OTHER_BLOCK_SIZE: 10,
    GAMES_PER_ROW: 3,
    GAMES_PER_SMALL_ROW: 3,
}

let smallGridStyle = false
let SPACE_IN_BETWEEN = Settings.BLOCK_SIZE * 8
let SPACE_BTW_OTHER = Settings.OTHER_BLOCK_SIZE * 8
let PLAYER_TWO_START = Settings.BLOCK_SIZE * WIDTH + SPACE_IN_BETWEEN
let OTHER_WIDTH = Settings.OTHER_BLOCK_SIZE * WIDTH + SPACE_BTW_OTHER
let customSettings = false

const KeyToInput = {
    SHIFT_LEFT : "ArrowLeft",
    SHIFT_RIGHT : "ArrowRight",
    DROP_DOWN : "ArrowDown",
    ROTATE_LEFT : "z",
    ROTATE_RIGHT : "x",
    PAUSE : "Enter"
}

const SoundEffectsMap = {
    line: new Howl({
        src: '/sound/line.wav'
    }),
    lock: new Howl({
        src: '/sound/lock.wav'
    }),
    rotate: new Howl({
        src: '/sound/rotate.wav'
    }),
    shift: new Howl({
        src: '/sound/shift.wav'
    }),
    tetris: new Howl({
        src: '/sound/tetris.wav'
    })
}
class Player {
    constructor(id) {
        this.held = 0
        this.pressed = 0
        this.rot = -1
        this.highScore = 0
        this.id = id
    }
}

let p1 = new Player("p1")
let games = {}
let players = {}
let pause = false
let p1Game = new GameState(7, Math.random() * 100)
let isReady = false
let numPlayers = 0
let numReady = 0

function setup() {
    createCanvas(2 * (DEFAULT_SIZE * WIDTH + SPACE_IN_BETWEEN), (DEFAULT_SIZE * (HEIGHT + 6)));
}

function resizeGame() {
    SPACE_IN_BETWEEN = Settings.BLOCK_SIZE * 8
    SPACE_BTW_OTHER = Settings.OTHER_BLOCK_SIZE * 8
    PLAYER_TWO_START = Settings.BLOCK_SIZE * WIDTH + SPACE_IN_BETWEEN
    OTHER_WIDTH = Settings.OTHER_BLOCK_SIZE * WIDTH + SPACE_BTW_OTHER
    if (!smallGridStyle) {
        resizeCanvas(Settings.GAMES_PER_ROW * (Settings.BLOCK_SIZE * WIDTH + SPACE_IN_BETWEEN), (Settings.BLOCK_SIZE * (HEIGHT + 7)) * Math.ceil((numPlayers / Settings.GAMES_PER_ROW)))
    } else {
        resizeCanvas((Settings.BLOCK_SIZE * WIDTH + SPACE_IN_BETWEEN) + Settings.GAMES_PER_SMALL_ROW * (Settings.OTHER_BLOCK_SIZE * WIDTH + SPACE_BTW_OTHER), 
            Math.max(Settings.BLOCK_SIZE * (HEIGHT + 6), Settings.OTHER_BLOCK_SIZE *(HEIGHT + 7) * Math.ceil(numPlayers / GAMES_PER_SMALL_ROW)))
    }
}

function draw() {
    deltaSeconds = deltaTime / MSPS
    frames = deltaSeconds * FPS
    textStyle(BOLD);
    textSize(16 * (Settings.BLOCK_SIZE / 20))
    background(220)

    if (pause) {
        fill("black")
        noStroke()
        text('Game Paused, Press Enter To Unpause', 0, Settings.BLOCK_SIZE * HEIGHT + 30)
        return
    }

    let endPlayer = gameEnd()
    if (endPlayer) {
        fill("black")
        noStroke()
        textSize(16 * (Settings.BLOCK_SIZE / 20))
        text(`Games Over. ${endPlayer.id} wins with a score of ${endPlayer.highScore}`, 0, Settings.BLOCK_SIZE * HEIGHT + 30)
        return
    }

    if (p1Game.gameOver >= GAME_OVERS) {
        fill("black")
        noStroke()
        textSize(16 * (Settings.BLOCK_SIZE / 20))
        text(`Game Over. Final High Score: ${p1Game.highScore}`, 0, Settings.BLOCK_SIZE * HEIGHT / 2)
    } else {
        updateAndDrawGame(p1Game, p1, 0, 0, Settings.BLOCK_SIZE, frames, true)
    }

    if (numReady < numPlayers) {
        fill("black")
        noStroke()
        textSize(16 * (Settings.BLOCK_SIZE / 20))
        text('Waiting for Players To Ready Up', PLAYER_TWO_START, Settings.BLOCK_SIZE * HEIGHT / 2)
        text(`Players in the room ${numPlayers}`, PLAYER_TWO_START, Settings.BLOCK_SIZE * (HEIGHT / 2 + 1))
        text(`Players ready ${numReady}`, PLAYER_TWO_START, Settings.BLOCK_SIZE * (HEIGHT / 2 + 2))
    } else {
        drawGames(frames)
    }
}

function gameEnd() {
    let highScore = 0
    let bestPlayer = 0
    let isOver = true
    for (let player in games) {
        let game = games[player]
        if (game.highScore > highScore) {
            highScore = game.highScore
            bestPlayer = player
            players[bestPlayer].highScore = highScore
        }
        if (game.gameOver < 3)
            isOver = false
    }
    if (isOver) {
        return players[bestPlayer]
    } else return false
}

function drawGames(frames) {
    let i = 1
    if (smallGridStyle) {
        i = 0
    }
    let j = 0

    for (let p in games) {
        if (p === p1.id) continue
        let player = players[p]
        let game = games[p]
        if (smallGridStyle) {
            updateAndDrawGame(game, player, PLAYER_TWO_START + OTHER_WIDTH * i, 
                (Settings.OTHER_BLOCK_SIZE * HEIGHT + 90) * j, Settings.OTHER_BLOCK_SIZE, frames)
            i++
            if (i >= Settings.GAMES_PER_SMALL_ROW) {
                i = 0
                j++
            }
        } else {
            updateAndDrawGame(game, player, PLAYER_TWO_START * i, 
                (Settings.BLOCK_SIZE * HEIGHT + 90) * j, Settings.OTHER_BLOCK_SIZE, frames)
            i++
            if (i >= Settings.GAMES_PER_ROW) {
                i = 0
                j++
            }
        }
    }
}

function updateAndDrawGame(game, player, xOffset, yOffset, blockSize, frames, emitLocked = false) {
    const pieceLocked = game.update(frames, player.pressed, player.held, player.rot)
    player.pressed = 0
    player.rot = -1
    let field = game.getField()

    if (pieceLocked && emitLocked && numReady === numPlayers) {
        socket.emit('state', p1.id, {
            field: game.field,
            totalLines: game.totalLines,
            score: game.score,
            seed: game.getSeed(),
            highScore: game.highScore,
            level: game.level,
            gameOver: game.gameOver
        })
    }
    noStroke()
    fill("black")
    textSize(16 * (blockSize / 20))
    text(player.id, xOffset + blockSize * (WIDTH / 3), yOffset + blockSize)
    yOffset += blockSize * 1.5

    for (let row = 0; row < field.length; row++) {
        for (let col = 0; col < field[0].length; col++) {
            let x = col * blockSize
            let y = row * blockSize
            if (!field[row][col]) {
                stroke("white")
                noFill()
                rect(x + xOffset, y + yOffset, blockSize, blockSize)
            }
        }
    }

    for (let row = 0; row < field.length; row++) {
        for (let col = 0; col < field[0].length; col++) {
            let x = col * blockSize
            let y = row * blockSize
            if (field[row][col]) {
                stroke("black")
                fill(color(field[row][col].r, field[row][col].g, field[row][col].b))
                rect(x + xOffset, y + yOffset, blockSize, blockSize)
            }
        }
    }

    textSize(16 * (blockSize / 20))
    noStroke()
    fill("black")
    text(`Lines: ${game.totalLines} Score: ${game.score}`, xOffset, yOffset + blockSize * HEIGHT + 30)
    text(`Level: ${game.level} Game Overs: ${game.gameOver}`, xOffset, yOffset + blockSize * HEIGHT + 50)
    text(`High Score: ${game.highScore}`, xOffset, yOffset + blockSize * HEIGHT + 70)
    text('NEXT', xOffset + blockSize * WIDTH + 30, yOffset + blockSize)

    textSize(20 * (blockSize / 20))
    let y = yOffset + blockSize * 5
    for (let key in game.stats) {
        let shape = SHAPES[key]
        stroke("black")
        drawTetromino(shape, xOffset + blockSize * WIDTH + 10, y, blockSize)
        noStroke()
        fill("black")
        text(`: ${game.stats[key]}`, xOffset + blockSize * (WIDTH + 5), y + (shape.lowestBlockRow - shape.highestBlockRow + 1) * blockSize / 2)
        y += (shape.lowestBlockRow - shape.highestBlockRow + 2) * blockSize
    }
    stroke("black")
    drawTetromino(game.nextPiece, xOffset + blockSize * WIDTH + 30, yOffset + blockSize * 2, blockSize)    
    noFill()
    rect(xOffset, yOffset, blockSize * WIDTH, blockSize * HEIGHT)
}

function drawTetromino(shape, xOffset, yOffset, blockSize) {
    for (let row = shape.highestBlockRow; row <= shape.lowestBlockRow; row++) {
        for (let col = shape.letfmostBlockCol; col <= shape.righmostBlockCol; col++) {
            if (shape.get(row, col) === ' ') continue
            fill(color(shape.color.r, shape.color.g, shape.color.b))
            rect(xOffset + blockSize * (col - shape.letfmostBlockCol),
                 yOffset + blockSize * (row - shape.highestBlockRow), blockSize, blockSize)
        }
    }
}

function keyPressed() {
    let input = getInput(key)
    if (!input) return
    socket.emit('press', p1.id, input)
    setPlayerInput(p1, input)
}

function keyReleased() {
    let input = getInput(key)
    if (!input) return
    socket.emit('release', p1.id, input)
    releasePlayerInput(p1, input)
}

function getInput(key) {
    for (let input in KeyToInput) {
        if (KeyToInput[input] === key) {
            if (input === PAUSE && $("#m").is(":focus"))
                return undefined
            return input
        }
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

let socket
const url = document.location.href
colon = document.location.href.lastIndexOf(":")
room = url.slice(url.lastIndexOf("/") + 1)
if (colon > 4) {
    socket = io(document.location.href.slice(0, colon) + ":8081")
} else {
    socket = io(document.location.href.slice(0, url.indexOf("/room")) + ":5000")
}

function sendReady() {
    $("#m").val("ready")
    readyBtn = $("#readyButton")
    isReady = !isReady
    if (isReady) {
        readyBtn.removeClass("btn-danger")
        readyBtn.addClass("btn btn-success")
    } else {
        readyBtn.removeClass("btn-success")
        readyBtn.addClass("btn btn-danger")
    }
    socket.emit('ready', p1.id, isReady)
}

socket.emit('room', room)
socket.on('room', (id) => {
    p1.id = id
    $("#userIdForm").attr("placeholder", p1.id)
})

socket.on('num_players', (num_players) => {
    console.log(num_players)
    numPlayers = num_players
})

socket.on('ready', (playersReady) => {
    numReady = playersReady
})

socket.on('start', (playersInRoom, seed) => {
    console.log(playersInRoom)
    for (let p of playersInRoom) {
        let player = new Player(p)
        players[player.id] = player
        games[player.id] = new GameState(7, seed)
    }
    p1 = players[p1.id]
    p1Game = games[p1.id]
    
    if (!customSettings) {
        if (playersInRoom.length === 2) {
            Settings.BLOCK_SIZE = 20
            Settings.OTHER_BLOCK_SIZE = 20
            Settings.GAMES_PER_ROW = 2
        } else if (playersInRoom.length <= 6) {
            Settings.BLOCK_SIZE = 15
            Settings.OTHER_BLOCK_SIZE = 15
            Settings.GAMES_PER_ROW = 3
        } else if (playersInRoom.length <= 10) {
            smallGridStyle = true
            Settings.BLOCK_SIZE = 20
            Settings.OTHER_BLOCK_SIZE = 10
        }
    }
    resizeGame()
})

socket.on('press', (id, key) => {
    console.log(id, key)
    setPlayerInput(players[id], key)
})

socket.on('release', (id, keyCode) => {
    releasePlayerInput(players[id], keyCode)
})

socket.on('state', (id, state) => {
    let game = games[id]
    game.field = state.field
    game.totalLines = state.totalLines
    game.score = state.score
    game.highScore = state.highScore
    game.level = state.level
    game.gameOver = state.gameOver
    game.setSeed(state.seed)
})

window.addEventListener("sound", (e) => {
    e = e.detail
    if (e.player !== p1Game) return
    SoundEffectsMap[e.type].play()
})
