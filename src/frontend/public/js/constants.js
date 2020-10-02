const WIDTH = 10
const HEIGHT = 20
const NUM_PIECES = 7
const STARTING_ROW = 0
const STARTING_COL = 5
const LEFT = 0
const RIGHT = 1
const DOWN = 2
const ROT_LEFT = 0
const ROT_RIGHT = 1
const AUTO_SHIFT_DELAY = 16

T_COLOR = {r: 241, g: 3, b: 3}
J_COLOR = {r: 255, g: 218, b: 0}
Z_COLOR = {r: 72, g: 254, b: 2}
O_COLOR = {r: 0, g: 255, b: 145}
S_COLOR = {r: 2, g: 146, b: 255}
L_COLOR = {r: 73, g: 0, b: 255}
I_COLOR = {r: 255,g: 1, b: 218}

const DROP_SPEED_BY_LEVEL = {
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
    letfmostBlockCol
    righmostBlockCol
    color

    constructor(repr, color) {
        this.cells = repr
        this.highestBlockRow = this.getHighestBlockRow()
        this.lowestBlockRow = this.getLowestBlockRow()
        this.letfmostBlockCol = this.getLeftmostBlockCol()
        this.righmostBlockCol = this.getRightmostBlockCol()
        this.color = color
    }

    getLeftmostBlockCol() {
        for (let col = 0; col < this.size(); col++) {
            for (let row = 0; row < this.size(); row++) {
                if (this.cells[row][col] === '-') {
                    return col
                }
            }
        }
    }

    getRightmostBlockCol() {
        for (let col = this.size() - 1; col >= 0; col--) {
            for (let row = 0; row < this.size(); row++) {
                if (this.cells[row][col] === '-') {
                    return col
                }
            }
        }
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
            for (let j = 0; j < N; j++) {
                mat[i][j] = this.cells[j][N - i - 1]
            }
        }
        return new Tetromino(mat, this.color)
    }

    rotateRight() {
        const N = this.cells.length
        let mat = [...Array(N)].map(_=>Array(N).fill(' '))
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                mat[i][j] = this.cells[N - j - 1][i]
            }
        }
        return new Tetromino(mat, this.color)
    }

    get(row, col) {
        return this.cells[row][col]
    }

    size() {
        return this.cells.length
    }
}

const INT_TO_COLOR = {0: O_COLOR, 1: I_COLOR, 2: J_COLOR, 3: L_COLOR, 4: Z_COLOR, 5: S_COLOR, 6: T_COLOR}
const INT_TO_SHAPE = {0: "O", 1: "I", 2: "J", 3: "L", 4: "Z", 5: "S", 6: "T"}
const SHAPES = {
    O : new Tetromino([
        ['-', '-'],
        ['-', '-']
    ], O_COLOR),
    I : new Tetromino([
        [' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' '],
        ['-', '-', '-', '-'],
        [' ', ' ', ' ', ' ']
    ], I_COLOR),
    J : new Tetromino([
        [' ', ' ', ' '],
        ['-', '-', '-'],
        [' ', ' ', '-']
    ], J_COLOR),
    L : new Tetromino([
        [' ', ' ', ' '],
        ['-', '-', '-'],
        ['-', ' ', ' ']
    ], L_COLOR),
    Z : new Tetromino([
        [' ', ' ', ' '],
        ['-', '-', ' '],
        [' ', '-', '-']
    ], Z_COLOR),
    S : new Tetromino([
        [' ', ' ', ' '],
        [' ', '-', '-'],
        ['-', '-', ' ']
    ], S_COLOR),
    T : new Tetromino([
        [' ', ' ', ' '],
        ['-', '-', '-'],
        [' ', '-', ' ']
    ], T_COLOR)
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
    fallTimer = 0
    autoShiftFrame = 16
    autoRepeatDrop = -96

    constructor(level = 0) {
        this.level = level
        this.currentPiece = getRandomPiece()
        this.nextPiece = getRandomPiece()
        this.pieceRow = STARTING_ROW - this.currentPiece.highestBlockRow
        this.pieceCol = STARTING_COL
    }

    update(framesPassed, pressed, held, rot) {
        this.fallTimer += framesPassed
        this.parseInput(pressed, held, rot)
        this.move(framesPassed)
    }

    parseInput(pressed, held, rot) {
        if (pressed & (1 << DOWN)) {
            if (this.autoRepeatDrop < 0) {
                this.autoRepeatDrop = 0
            } else if (!(held & (1 << RIGHT) || held & (1 << LEFT))) {
                this.autoRepeatDrop = 1
            }
        } else if (held & (1 << DOWN) && !(held & (1 << RIGHT) || held & (1 << LEFT))) {
            this.autoRepeatDrop++
        } else if (this.autoRepeatDrop > 0) {
            this.autoRepeatDrop = 0
        }

        if (pressed !== 0) {
            if (this.autoShiftFrame === 0 || this.autoShiftFrame === 16) {
                if (pressed & (1 << LEFT)) {
                    this.pieceCol--
                    if (this.invalid())
                        this.pieceCol++
                }
                if (pressed & (1 << RIGHT)) {
                    this.pieceCol++
                    if (this.invalid())
                        this.pieceCol--
                }
                if (this.autoShiftFrame === 16) {
                    this.autoShiftFrame = 10
                }
            }
            if (this.autoShiftFrame < 16) {
                this.autoShiftFrame++
            }
        } else {
            this.autoShiftFrame = 0
        }
        switch (rot) {
            case ROT_RIGHT:
                this.currentPiece = this.currentPiece.rotateRight()
                if (this.invalid()) {
                    this.currentPiece = this.currentPiece.rotateLeft()
                }
                break
            case ROT_LEFT:
                this.currentPiece = this.currentPiece.rotateLeft()
                if (this.invalid()) {
                    this.currentPiece = this.currentPiece.rotateRight()
                }
                break
        }
    }

    invalid() {
        if (this.pieceRow + this.currentPiece.lowestBlockRow >= HEIGHT || 
            this.pieceCol + this.currentPiece.letfmostBlockCol < 0 || 
            this.pieceCol + this.currentPiece.righmostBlockCol >= WIDTH) {
                return true
        }

         for (let row = this.currentPiece.highestBlockRow; row <= this.currentPiece.lowestBlockRow; row++) {
            for (let col = this.currentPiece.letfmostBlockCol; col <= this.currentPiece.righmostBlockCol; col++) {
                if (this.pieceRow + row < 0) continue
                if (this.field[this.pieceRow + row][this.pieceCol + col] !== ' ') {
                    return true
                }
            }
        }

        return false
    }

    move(framesPassed) {
        if (this.autoRepeatDrop < 0) {
            this.autoRepeatDrop += framesPassed
            return
        }
        if (this.autoRepeatDrop === 3) {
            this.autoRepeatDrop = 1
            this.fallTimer = 0
            if (this.touchesGround()) {
                this.lockPiece()
            } else {
                this.pieceRow++
            }
            return
        }

        if (this.fallTimer > DROP_SPEED_BY_LEVEL[this.level]) {
            if (this.touchesGround()) {
                this.lockPiece()
            } else {
                this.pieceRow++
            }
            this.fallTimer = 0
        }
    }

    touchesGround() {
        if (this.currentPiece.lowestBlockRow + this.pieceRow + 1 >= HEIGHT) {
            return true
        }
        for (let row = this.currentPiece.highestBlockRow; row <= this.currentPiece.lowestBlockRow; row++) {
            for (let col = this.currentPiece.letfmostBlockCol; col <= this.currentPiece.righmostBlockCol; col++) {
                if (this.currentPiece.get(row, col) === '-' && this.field[this.pieceRow + row + 1][this.pieceCol + col] !== ' ') {
                    return true
                }
            }
        }
        return false
    }

    lockPiece() {
        this.placePiece()
        this.clearLines()
        this.currentPiece = this.nextPiece
        this.nextPiece = getRandomPiece()
        this.pieceRow = STARTING_ROW - this.currentPiece.highestBlockRow
        this.pieceCol = STARTING_COL
    }

    placePiece() {
        for (let row = this.currentPiece.highestBlockRow; row <= this.currentPiece.lowestBlockRow; row++) {
            for (let col = this.currentPiece.letfmostBlockCol; col <= this.currentPiece.righmostBlockCol; col++) {
                if (this.currentPiece.get(row, col) === '-')
                    this.field[this.pieceRow + row][this.pieceCol + col] = this.currentPiece.color
            }
        }
    }

    clearLines() {
        let topRow = this.currentPiece.highestBlockRow + this.pieceRow
        let botRow = this.currentPiece.lowestBlockRow + this.pieceRow
        let clearedRows = {}

        for (let row = topRow; row <= botRow; row++) {
            clearedRows[row] = true
            for (let col = 0; col < WIDTH; col++) {
                if (this.field[row][col] === ' ') {
                    clearedRows[row] = false
                    break
                }
            }
        }

        let numRowsCleared = 0
        for (let row = botRow; row >= 0; row--) {
            if (clearedRows[row]) {
                numRowsCleared++
                continue
            }
            this.moveRowDown(row, numRowsCleared)
        }
    }

    moveRowDown(row, numDown) {
        if (numDown === 0) return
        for (let col = 0; col < WIDTH; col++) {
            this.field[row + numDown][col] = this.field[row][col]
        }
    }

    getField() {
        let mat = [...Array(HEIGHT)].map(_=>Array(WIDTH).fill(false))
        for (let row = this.currentPiece.highestBlockRow; row <= this.currentPiece.lowestBlockRow; row++) {
            for (let col = this.currentPiece.letfmostBlockCol; col <= this.currentPiece.righmostBlockCol; col++) {
                if (this.pieceRow + row >= 0 && this.currentPiece.get(row, col) !== ' ') {
                    mat[this.pieceRow + row][this.pieceCol + col] = this.currentPiece.color
                }
            }
        }
        for (let row = 0; row < HEIGHT; row++) {
            for (let col = 0; col < WIDTH; col++) {
                if (this.field[row][col] !== ' ') {
                    mat[row][col] = this.field[row][col]
                }
            }
        }
        return mat
    }
}