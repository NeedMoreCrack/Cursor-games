class Minesweeper {
    constructor(difficulty) {
        this.difficulties = {
            easy: { size: 10, mines: 10 },
            medium: { size: 20, mines: 40 },
            hard: { size: 30, mines: 90 }
        };
        this.setDifficulty(difficulty);
        this.board = [];
        this.gameOver = false;
    }

    setDifficulty(difficulty) {
        const { size, mines } = this.difficulties[difficulty];
        this.size = size;
        this.mines = mines;
    }

    initBoard() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.placeMines();
        this.calculateNumbers();
    }

    placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.size);
            const col = Math.floor(Math.random() * this.size);
            if (this.board[row][col] !== 'M') {
                this.board[row][col] = 'M';
                minesPlaced++;
            }
        }
    }

    calculateNumbers() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] !== 'M') {
                    this.board[row][col] = this.countAdjacentMines(row, col);
                }
            }
        }
    }

    countAdjacentMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
                    if (this.board[newRow][newCol] === 'M') {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    revealCell(row, col) {
        if (this.gameOver || row < 0 || row >= this.size || col < 0 || col >= this.size) {
            return;
        }

        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell.classList.contains('revealed') || cell.classList.contains('flagged')) {
            return;
        }

        cell.classList.add('revealed');

        if (this.board[row][col] === 'M') {
            this.gameOver = true;
            cell.textContent = '💣';
            this.revealAllMines();
            document.getElementById('message').textContent = '遊戲結束!你踩到地雷了!';
        } else {
            const mineCount = this.board[row][col];
            if (mineCount > 0) {
                cell.textContent = mineCount;
            } else {
                this.revealAdjacentCells(row, col);
            }

            if (this.checkWin()) {
                this.gameOver = true;
                document.getElementById('message').textContent = '恭喜你贏了!';
            }
        }
    }

    revealAdjacentCells(row, col) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                this.revealCell(row + i, col + j);
            }
        }
    }

    revealAllMines() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 'M') {
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cell.classList.add('revealed');
                    cell.textContent = '💣';
                }
            }
        }
    }

    toggleFlag(row, col) {
        if (this.gameOver) return;

        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell.classList.contains('revealed')) {
            cell.classList.toggle('flagged');
            cell.textContent = cell.classList.contains('flagged') ? '🚩' : '';
        }
    }

    checkWin() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (!cell.classList.contains('revealed') && this.board[row][col] !== 'M') {
                    return false;
                }
            }
        }
        return true;
    }
}

let game;

function startNewGame() {
    const difficulty = document.getElementById('difficulty').value;
    game = new Minesweeper(difficulty);
    game.initBoard();
    renderBoard();
    document.getElementById('message').textContent = '';
}

function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${game.size}, 30px)`;

    for (let row = 0; row < game.size; row++) {
        for (let col = 0; col < game.size; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => game.revealCell(row, col));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                game.toggleFlag(row, col);
            });
            gameBoard.appendChild(cell);
        }
    }
}

document.getElementById('new-game').addEventListener('click', startNewGame);
document.getElementById('difficulty').addEventListener('change', startNewGame);

startNewGame();
