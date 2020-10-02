const game = new GameState(7)
const BLOCK_SIZE = 10
let dir = -1
let rot = -1

function setup() {
    frameRate(60)
    createCanvas(400, 400);
}


function draw() {
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
                fill(color(255, 204, 0))
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
    }
    if (key === 'z') {
        rot = 2
    } else if (key === 'x') {
        rot = 3
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        dir = -1
    }
}