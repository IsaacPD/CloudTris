const WIDTH = 10
const HEIGHT = 20
const NUM_PIECES = 7
const STARTING_ROW = 0
const STARTING_COL = 5
const LEFT = 0
const RIGHT = 1
const ROT_LEFT = 2
const ROT_RIGHT = 3

const FRAMES_PER_CELL_BY_LEVEL = {
    0: 48,
    1: 43,
    2: 38,
    3: 33,
    4: 28,
    5: 23,
    6: 18,
    7: 13,
    8: 8,
    9: 6,
    10: 5,
    11: 5,
    12: 5,
    13: 4,
    14: 4,
    15: 4,
    16: 3,
    17: 3,
    18: 3,
    19: 2,
    29: 1,
}

class Tetromino {
    cells
    highestBlockRow
    lowestBlockRow

    constructor(repr) {
        this.cells = repr
        this.highestBlockRow = this.getHighestBlockRow()
        this.lowestBlockRow = this.getLowestBlockRow()
    }

    getHighestBlockRow() {
        for (let row = 0; row < this.size(); row++) {
            for (let col = 0; col < this.size(); col++) {
                if (this.cells[row][col] === '-') {
                    return row
                }
            }
        }
    }

    getLowestBlockRow() {
        for (let row = this.size() - 1; row >= 0; row--) {
            for (let col = 0; col < this.size(); col++) {
                if (this.cells[row][col] === '-') {
                    return row
                }
            }
        }
    }

    rotateLeft() {
        const N = this.cells.length
        let mat = [...Array(N)].map(_=>Array(N).fill(' '))
        for (let i = 0; i < N; i++) {
            for (let j = i; j < N-i-1; j++) {
                mat[N-1-j][i] = this.cells[i][j]
                mat[i][j] = this.cells[j][N-1-i]
                mat[j][N-1-i] = this.cells[N-1-i][N-1-j]
                mat[N-1-i][N-1-j] = this.cells[N-1-j][i]
            }
        }
        return new Tetromino(mat)
    }

    rotateRight() {
        const N = this.cells.length
        let mat = [...Array(N)].map(_=>Array(N).fill(' '))
        for (let i = 0; i < N; i++) {
            for (let j = i; j < N-i-1; j++) {
                mat[j][N-1-i] = this.cells[i][j]
                mat[i][j] = this.cells[N-1-j][i]
                mat[N-1-j][i] = this.cells[N-1-i][N-1-j]
                mat[N-1-i][N-1-j] = this.cells[j][N-1-i]
            }
        }
        return new Tetromino(mat)
    }

    get(row, col) {
        return this.cells[row][col]
    }

    size() {
        return this.cells.length
    }
}

const INT_TO_SHAPE = {0: "O", 1: "I", 2: "J", 3: "L", 4: "Z", 5: "S", 6: "T"}
const SHAPES = {
    O : new Tetromino([
        ['-', '-'],
        ['-', '-']
    ]),
    I : new Tetromino([
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
        ['-', '-', '-', '-'],
        [' ', ' ', ' ', ' ']
    ]),
    J : new Tetromino([
        [' ', ' ', ' '],
        ['-', '-', '-'],
        [' ', ' ', '-']
    ]),
    L : new Tetromino([
        [' ', ' ', ' '],
        ['-', '-', '-'],
        ['-', ' ', ' ']
    ]),
    Z : new Tetromino([
        [' ', ' ', ' '],
        ['-', '-', ' '],
        [' ', '-', '-']
    ]),
    S : new Tetromino([
        [' ', ' ', ' '],
        [' ', '-', '-'],
        ['-', '-', ' ']
    ]),
    T : new Tetromino([
        [' ', ' ', ' '],
        ['-', '-', '-'],
        [' ', '-', ' ']
    ])
}

const getRandomPiece = function() {
    return SHAPES[INT_TO_SHAPE[Math.floor(Math.random() * NUM_PIECES)]]
}

class GameState {
    field = [...Array(HEIGHT)].map(_=>Array(WIDTH).fill(' '))
    currentPiece
    nextPiece
    pieceRow
    pieceCol
    level
    currentFrame = 0

    constructor(level = 0) {
        this.level = level
        this.currentPiece = getRandomPiece()
        this.nextPiece = getRandomPiece()
        this.pieceRow = STARTING_ROW - this.currentPiece.highestBlockRow
        this.pieceCol = STARTING_COL
    }

    update(framesPassed, input) {
        this.currentFrame += framesPassed
        const numMoves = this.currentFrame % FRAMES_PER_CELL_BY_LEVEL[this.level]
        if (numMoves > 0) {
            for (let i = 0; i < numMoves; i++) {
                this.move()
            }
            this.parseInput(input)
            this.currentFrame -= FRAMES_PER_CELL_BY_LEVEL[this.level] * numMoves
        }
    }

    parseInput(input) {
        switch (input) {
            case LEFT:
                this.pieceCol--
                break
            case RIGHT:
                this.pieceCol++
                break
            case ROT_RIGHT:
                this.currentPiece = this.currentPiece.rotateRight()
                break
            case ROT_LEFT:
                this.currentPiece = this.currentPiece.rotateLeft()
                break
        }
    }

    move() {
        this.pieceRow++
        if (this.touchesGround()) {
            this.lockPiece()
        }
    }

    touchesGround() {
        if (this.currentPiece.lowestBlockRow + this.pieceRow + 1 >= HEIGHT) {
            return true
        }
        const pieceSize = this.currentPiece.size()
        for (let row = 0; row < pieceSize; row++) {
            for (let col = 0; col < pieceSize; col++) {
                if (this.currentPiece.get(row, col) === '-' && this.field[this.pieceRow + row + 1][this.pieceCol + col] == '-') {
                    return true
                }
            }
        }
        return false
    }

    lockPiece() {
        this.placePiece()
        this.currentPiece = this.nextPiece
        this.nextPiece = getRandomPiece()
        this.pieceRow = STARTING_ROW - this.currentPiece.highestBlockRow
        this.pieceCol = STARTING_COL
    }

    placePiece() {
        const size = this.currentPiece.size()
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (this.pieceRow + row >= 0) {
                    if (this.currentPiece.get(row, col) === '-')
                        this.field[this.pieceRow + row][this.pieceCol + col] = this.currentPiece.get(row, col)
                }
            }
        }
    }

    getField() {
        let mat = [...Array(HEIGHT)].map(_=>Array(WIDTH).fill(false))
        const size = this.currentPiece.size()
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (this.pieceRow + row >= 0)
                    mat[this.pieceRow + row][this.pieceCol + col] = this.currentPiece.get(row, col) === '-'
            }
        }
        for (let row = 0; row < HEIGHT; row++) {
            for (let col = 0; col < WIDTH; col++) {
                mat[row][col] = mat[row][col] || this.field[row][col] === '-'
            }
        }
        return mat
    }
}