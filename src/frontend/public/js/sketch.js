const game = new GameState(7)
const BLOCK_SIZE = 20
let dir = -1
let rot = -1
let pause = false

function setup() {
    frameRate(60)
    createCanvas(400, 400);
}


function draw() {
    if (pause) {
        return
    }
    game.update(1, dir, rot)
    rot = -1
    background(220)
    noFill()
    rect(0, 0, BLOCK_SIZE * WIDTH, BLOCK_SIZE * HEIGHT)
    let field = game.getField()
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
        dir = 0
    } else if (keyCode === RIGHT_ARROW) {
        dir = 1
    } else if (keyCode === DOWN_ARROW) {
        dir = 2
    } else if (key === ' ') {
        pause = !pause
    } else if (key === 'z') {
        rot = 0
    } else if (key === 'x') {
        rot = 1
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        dir = -1
    }
}