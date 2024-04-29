const blockSize = 20;
const tetra = 20;
this.canvas = document.querySelector('#gameOutput');

fieldWidth = this.canvas.width / blockSize;
fieldHeight = this.canvas.height / blockSize;

console.log(fieldHeight);
console.log(this.canvas.width);
console.log(this.canvas.height);

class PieceController {
    constructor() {

        this.pieceExamples = [
            { shape: [[[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]], [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]], color: '#BC2AAE' },
            { shape: [[[1, 1], [1, 1]]], color: '#87B7E6' },
            { shape: [[[1, 1, 1], [0, 1, 0]], [[0, 1], [1, 1], [0, 1]], [[0, 1, 0], [1, 1, 1]], [[1, 0], [1, 1], [1, 0]]], color: '#FFB23E' },
            { shape: [[[1, 1, 1], [1, 0, 0]], [[1, 1], [0, 1], [0, 1]], [[0, 0, 1], [1, 1, 1]], [[1, 0], [1, 0], [1, 1]]], color: '#4DD2BC' },
            { shape: [[[1, 1, 0], [0, 1, 1]], [[0, 1], [1, 1], [1, 0]]], color: '#87E697' },
            { shape: [[[0, 1, 1], [1, 1, 0]], [[1, 0], [1, 1], [0, 1]]], color: '#8B3EFF' },
            { shape: [[[1, 0, 0], [1, 1, 1]], [[1, 1], [1, 0], [1, 0]], [[1, 1, 1], [0, 0, 1]], [[0, 1], [0, 1], [1, 1]]], color: '#D46E6E' }
        ];


    }

    getRandomPiece() {
        const newPieceIndex = Math.floor(Math.random() * this.pieceExamples.length);
        return this.pieceExamples[newPieceIndex]; // Deep copy the piece to avoid modifying the original
    }

    setNewPiece() {
        this.currentPiece = this.getRandomPiece();
        this.currentPiece.rotationIndex = 0;

        this.pieceX = Math.floor(fieldWidth / 2) - Math.floor(this.currentPiece.shape[0][0].length / 2);
        this.pieceY = 0;
    }

    drawPiece() {
        let currentShape = this.currentPiece.shape[this.currentPiece.rotationIndex];
        for (let y = 0; y < currentShape.length; y++) {
            for (let x = 0; x < currentShape[y].length; x++) {
                if (currentShape[y][x]) {
                    TetrisOutput.drawBlock(this.pieceX + x, this.pieceY + y, this.currentPiece.color);
                }
            }
        }
    }

    canRotate(newShape, newX, newY, field) {
        for (let y = 0; y < newShape.length; y++) {
            for (let x = 0; x < newShape[y].length; x++) {
                if (newShape[y][x]) {
                    let posX = newX + x;
                    let posY = newY + y;
                    if (posX < 0 || posX >= fieldWidth || posY >= fieldHeight || (posY >= 0 && field[posY][posX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    rotatePiece(field) {
        let nextRotationIndex = (this.currentPiece.rotationIndex + 1) % this.currentPiece.shape.length;
        if (this.canRotate(this.currentPiece.shape[nextRotationIndex], this.pieceX, this.pieceY, field)) {
            this.currentPiece.rotationIndex = nextRotationIndex;
        }
    }

    canRotate(newShape, newX, newY, field) {
        for (let y = 0; y < newShape.length; y++) {
            for (let x = 0; x < newShape[y].length; x++) {
                if (newShape[y][x]) {
                    let posX = newX + x;
                    let posY = newY + y;
                    if (posX < 0 || posX >= fieldWidth || posY >= fieldHeight || (posY >= 0 && field[posY][posX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    canMove(dx, dy, field) {
        let currentShape = this.currentPiece.shape[this.currentPiece.rotationIndex];
        for (let y = 0; y < currentShape.length; y++) {
            for (let x = 0; x < currentShape[y].length; x++) {
                if (currentShape[y][x]) {
                    let newX = this.pieceX + x + dx;
                    let newY = this.pieceY + y + dy;
                    if (newX < 0 || newX >= fieldWidth || newY >= fieldHeight || (newY >= 0 && field[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    movePiece(dx, dy, field) {
        if (this.canMove(dx, dy, field)) {
            this.pieceX += dx;
            this.pieceY += dy;
            this.lastMoveTime = Date.now();
        } else if (dx == 0 && dy > 0) {

            if ((this.pieceY + dy) < fieldHeight - tetra) {
                TetrisController.gameOver = true;
            }
            else {
                this.mergePiece(field);
                TetrisController.removeCompleteLines();
                this.currentPiece = this.getRandomPiece();
                this.setNewPiece();
            }
        }
        TetrisController.update();
    }

    mergePiece(field) {
        let currentShape = this.currentPiece.shape[this.currentPiece.rotationIndex];
        for (let y = 0; y < currentShape.length; y++) {
            for (let x = 0; x < currentShape[y].length; x++) {
                if (currentShape[y][x]) {
                    field[this.pieceY + y][this.pieceX + x] = this.currentPiece.color;
                }
            }
        }
    }
}

class BlockOutputController {

    constructor(canvas) {
        this.canvas = canvas;
        this.canvasContext = this.canvas.getContext("2d");
    }

    drawTopBlock() {
        this.canvasContext.fillStyle = "#57ae4747";
        this.canvasContext.strokeStyle = 'white';
        this.canvasContext.fillRect(0, 0, this.canvas.width, 4 * blockSize);
        this.canvasContext.strokeRect(0, 0, this.canvas.width, 4 * blockSize);
    }

    drawBlock(x, y, color) {
        this.canvasContext.strokeStyle = 'black';
        this.canvasContext.fillStyle = color;
        this.canvasContext.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        this.canvasContext.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }

    drawField(field) {

        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvasContext.strokeStyle = 'black';

        for (let y = 0; y < field.length; y++) {
            for (let x = 0; x < field[y].length; x++) {
                if (field[y][x]) {
                    this.drawBlock(x, y, field[y][x]);
                }
            }
        }
        TetrisOutput.drawTopBlock();
    }
}

class TetrisFieldController {

    constructor() {
        this.field = Array.from({ length: fieldHeight }, () => Array(this.fieldWidth).fill(0));
    }

    removeCompleteLines() {
        console.log(this.field);
        let countRemoved = 0;
        for (let x = tetra; x >= 0; x--) {
            for (let y = this.field.length - 1; y >= 0; y--) {
                if (this.field[y].every(cell => cell !== 0) && this.field[y].length == fieldWidth) {
                    countRemoved += 1;
                    this.field.splice(y, 1);
                    this.field.unshift(Array(fieldWidth).fill(0));
                }
            }
        }
        if (countRemoved > 0) {
            ScoreController.scoreUpdate(countRemoved);
        }
    }

    update() {
        if (!this.gameOver) {
            TetrisOutput.drawField(this.field);
            TetrisPieceController.drawPiece();
        }
    }

    startGame() {
        this.field = Array.from({ length: fieldHeight }, () => Array(fieldWidth).fill(0));
        this.stopInterval();
        ScoreController.scoreToZero();
        TetrisPieceController.setNewPiece();
        this.gameOver = false;
        this.lastMoveTime = Date.now();
        this.startInterval();
    }

    startInterval() {
        this.currentInterVal = setInterval(() => {
            if (!this.gameOver) {
                TetrisPieceController.movePiece(0, 1, this.field);
            }
        }, 200);
    }

    stopInterval() {
        clearInterval(this.currentInterVal);
    }
}

class TetrisScoreController {

    constructor() {
        this.highScore = 0;
        this.score = 0;

        this.scoreElement = document.querySelector('#score');
        this.highScoreElement = document.querySelector('#highScore');
        this.scoreElement.innerHTML = this.score;
        this.highScoreElement.innerHTML = this.highScore;
    }

    scoreToZero() {
        this.score = 0;
        this.scoreElement.innerHTML = 0;
    }

    scoreUpdate(removedRowsPerFigure) {
        this.score += 10 * removedRowsPerFigure * removedRowsPerFigure;
        this.scoreElement.innerHTML = this.score;
        if (this.score > this.highScore) {
            this.updateHighScore(this.score);
        }
    }

    updateHighScore(newHighScore) {
        if (newHighScore > this.highScore) {
            this.highScore = newHighScore;
            this.highScoreElement.innerHTML = this.highScore;
        }
    }
}

var TetrisOutput = new BlockOutputController(canvas);
var TetrisPieceController = new PieceController();
var TetrisController = new TetrisFieldController();
var ScoreController = new TetrisScoreController();

let isPaused = false;

document.addEventListener('keydown', (event) => {
    console.log();
    if (event.code === 'ArrowLeft' && !isPaused && !TetrisController.gameOver) {
        TetrisPieceController.movePiece(-1, 0, TetrisController.field);
    } else if (event.code === 'ArrowRight' && !isPaused && !TetrisController.gameOver) {
        TetrisPieceController.movePiece(1, 0, TetrisController.field);
    } else if (event.code === 'ArrowDown' && !isPaused && !TetrisController.gameOver) {
        TetrisPieceController.movePiece(0, 1, TetrisController.field);
    } else if (event.code === 'ArrowUp' && !isPaused && !TetrisController.gameOver) {
        TetrisPieceController.rotatePiece(TetrisController.field);
    } else if (event.code === 'Space') {
        TetrisController.startGame();
    } else if (event.code === 'Enter') {
        if (isPaused) {
            TetrisController.startInterval();
            isPaused = false;
        }
        else {
            TetrisController.stopInterval();
            isPaused = true;
        }
    }
});