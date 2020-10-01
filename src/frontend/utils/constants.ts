const WIDTH = 10
const HEIGHT = 20
const FPS = 60
const NUM_PIECES = 7
const STARTING_ROW = 0
const STARTING_COL = 5
const RIGHT = 0
const LEFT = 1
const ROT_RIGHT = 2
const ROT_LEFT = 3

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
    cells : string[][]
    highestBlockRow : number
    lowestBlockRow : number

    constructor(repr : string[][]) {
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

    rotateLeft() : Tetromino {
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

    rotateRight() : Tetromino {
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

    get(row: number, col : number) : string {
        return this.cells[row][col]
    }

    size() : number {
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

const getRandomPiece = function() : Tetromino {
    return SHAPES[INT_TO_SHAPE[Math.floor(Math.random() * NUM_PIECES)]]
}

class GameState {
    field = [HEIGHT][WIDTH]
    currentPiece : Tetromino
    nextPiece : Tetromino
    pieceRow : number
    pieceCol : number
    level : number
    currentFrame : number

    constructor(level = 0) {
        this.level = level
        this.currentPiece = getRandomPiece()
        this.nextPiece = getRandomPiece()
        this.pieceRow = STARTING_ROW - this.currentPiece.highestBlockRow
        this.pieceCol = STARTING_COL
    }

    update(framesPassed: number, input : number) {
        this.currentFrame += framesPassed
        const numMoves = this.currentFrame % FRAMES_PER_CELL_BY_LEVEL[this.level]
        this.parseInput(input)
        if (numMoves > 0) {
            for (let i = 0; i < numMoves; i++) {
                this.move()
            }
            this.currentFrame -= FRAMES_PER_CELL_BY_LEVEL[this.level] * numMoves
        }
    }

    parseInput(input: number) {
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

    touchesGround() : boolean {
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
                this.field[this.pieceRow + row][this.pieceCol + col] = this.currentPiece.get(row, col)
            }
        }
    }
}
