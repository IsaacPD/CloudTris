const game = new GameState(7)
const BLOCK_SIZE = 10

function setup() {
    frameRate(60)
    createCanvas(400, 400);
}

function draw() {
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
    let input = -1
    if (keyIsDown(LEFT_ARROW)) {
        input = 0
    }
    if (keyIsDown(RIGHT_ARROW)) {
        input = 1
    }
    game.update(1, input)
}