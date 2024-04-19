// Constants
const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 2.5;

// Variables
let gameBoard = [];
let score = 0;
let gameOver = false;

// Tetrimino
let currentTetrimino;
let currentRow;
let currentCol;

// automatic movement
let intervalId;

// Initialize game board
function initGameBoard() {
    for (let row = 0; row < ROWS; row++) {
        gameBoard[row] = [];
        for (let col = 0; col < COLS; col++) {
            gameBoard[row][col] = 0; // 0 represents empty cell
        }
    }
}

// Render game board
function renderGameBoard() {
    const gameBoardElement = document.getElementById('gameBoard');
    gameBoardElement.innerHTML = ''; // Clear previous content

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            const colorClass = gameBoard[row][col];
            if (colorClass) {
                cell.classList.add('filled');
                cell.classList.add(colorClass);
            }

            cell.style.width = `${CELL_SIZE}vw`;
            cell.style.height = `${CELL_SIZE}vw`;

            /*
            const borderColor = (row + col) % 2 === 0 ? '#333' : '#fff';
            cell.style.border = `1px solid ${borderColor}`;
             */

            gameBoardElement.appendChild(cell);
        }
    }

    // Display the current Tetrimino on the game board
    displayTetrimino(currentTetrimino, currentRow, currentCol);
}


/*
------------------------------- TETRIMINOS -------------------------------
 */

// Define Tetriminos (Tetris pieces)
const TETRIMINOS = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1], [1, 1]], // O
    [[1, 1, 0], [0, 1, 1]]  // Z
];


// Function to generate a random Tetrimino
function generateRandomTetrimino() {
    const randomIndex = Math.floor(Math.random() * TETRIMINOS.length);
    return TETRIMINOS[randomIndex];
}

// Function to display a Tetrimino on the game board
function displayTetrimino(tetrimino, row, col) {

    for (let i = 0; i < tetrimino.length; i++) {
        for (let j = 0; j < tetrimino[i].length; j++) {
            if (tetrimino[i][j] === 1) {
                const cellIndex = (row + i) * COLS + (col + j);
                const cell = document.getElementsByClassName('cell')[cellIndex];
                if (cell) {
                    cell.classList.add('filled');
                    const tetriminoShape = getTetriminoShape(tetrimino);
                    const colorClass = getColorClass(tetriminoShape);
                    cell.classList.add(colorClass);
                }
            }
        }
    }

    // Add border around the Tetrimino
    for (let i = 0; i < tetrimino.length; i++) {
        for (let j = 0; j < tetrimino[i].length; j++) {
            const cellIndex = (row + i) * COLS + (col + j);
            const cell = document.getElementsByClassName('cell')[cellIndex];
            if (cell) {
                // Check if the current cell is on the boundary of the Tetrimino
                const isTop = (i === 0) || (tetrimino[i - 1][j] === 0);
                const isBottom = (i === tetrimino.length - 1) || (tetrimino[i + 1][j] === 0);
                const isLeft = (j === 0) || (tetrimino[i][j - 1] === 0);
                const isRight = (j === tetrimino[i].length - 1) || (tetrimino[i][j + 1] === 0);

                // Add border if the current cell is on the boundary
                if (isTop) cell.style.borderTop = '1px solid black';
                if (isBottom) cell.style.borderBottom = '1px solid black';
                if (isLeft) cell.style.borderLeft = '1px solid black';
                if (isRight) cell.style.borderRight = '1px solid black';
            }
        }
    }
    
}

// Function to lock the current Tetrimino in place and generate a new Tetrimino
function lockTetrimino(tetrimino, row, col) {
    // Mark the cells of the current Tetrimino as filled on the game board
    for (let i = 0; i < currentTetrimino.length; i++) {
        for (let j = 0; j < currentTetrimino[i].length; j++) {
            if (currentTetrimino[i][j] === 1) {
                const tetriminoShape = getTetriminoShape(currentTetrimino);
                //console.log("tetriminoShape:", tetriminoShape)
                const colorClass = getColorClass(tetriminoShape);
                //console.log("colorClass:", colorClass)
                gameBoard[currentRow + i][currentCol + j] = colorClass;
            }
        }
    }

    renderGameBoard();
    clearCompletedRows();

    if (checkGameLost()) {
        endGame();
    } else {
        generateNewTetrimino();
    }
}

// Function to generate a new Tetrimino
function generateNewTetrimino() {
    if(!gameOver){
        // Generate a random Tetrimino
        currentTetrimino = generateRandomTetrimino();
        // Reset the position of the new Tetrimino to the top center of the game board
        currentRow = 0;
        currentCol = Math.floor(COLS / 2) - Math.floor(currentTetrimino[0].length / 2);
        displayTetrimino(currentTetrimino, currentRow, currentCol);
    }
}

// Function to get the color class based on the Tetrimino type
function getColorClass(tetriminoShape) {
    switch (tetriminoShape) {
        case 'I':
            return 'cyan';
        case 'T':
            return 'purple';
        case 'L':
            return 'orange';
        case 'J':
            return 'blue';
        case 'S':
            return 'green';
        case 'O':
            return 'yellow';
        case 'Z':
            return 'red';
        default:
            return '';
    }
}

// Function to get the shape of a Tetrimino
function getTetriminoShape(tetrimino) {
    const shapeMap = {
        'I': [
            [[1, 1, 1, 1]],
            [[1], [1], [1], [1]]
        ],
        'T': [
            [[1, 1, 1], [0, 1, 0]],
            [[0, 1], [1, 1], [0, 1]],
            [[0, 1, 0], [1, 1, 1]],
            [[1, 0], [1, 1], [1, 0]]
        ],
        'L': [
            [[1, 1, 1], [1, 0, 0]],
            [[1, 1], [0, 1], [0, 1]],
            [[0, 0, 1], [1, 1, 1]],
            [[1, 0], [1, 0], [1, 1]]
        ],
        'J': [
            [[1, 1, 1], [0, 0, 1]],
            [[0, 1], [0, 1], [1, 1]],
            [[1, 0, 0], [1, 1, 1]],
            [[1, 1], [1, 0], [1, 0]]
        ],
        'S': [
            [[0, 1, 1], [1, 1, 0]],
            [[1, 0], [1, 1], [0, 1]]
        ],
        'O': [
            [[1, 1], [1, 1]]
        ],
        'Z': [
            [[1, 1, 0], [0, 1, 1]],
            [[0, 1], [1, 1], [1, 0]]
        ]
    };

    for (const shape in shapeMap) {
        // Iterate over each rotation of the shape
        for (const rotation of shapeMap[shape]) {
            // Check if the Tetrimino matches the current rotation
            if (arraysMatch(tetrimino, rotation)) {
                return shape; // Return the shape if matched
            }
        }
    }
    return '';
}

// Helper function to compare nested arrays
function arraysMatch(arr1, arr2) {
    // Check if both arrays are arrays
    if (Array.isArray(arr1) && Array.isArray(arr2)) {
        // Check if the arrays have the same length
        if (arr1.length !== arr2.length) return false;
        // Iterate over the arrays
        for (let i = 0; i < arr1.length; i++) {
            // Recursively compare nested arrays
            if (!arraysMatch(arr1[i], arr2[i])) return false;
        }
        return true; // Return true if all elements match
    } else {
        // Compare non-array elements directly
        return arr1 === arr2;
    }
}

/*
------------------------------- MOVEMENT -------------------------------
 */
// Function to move the current Tetrimino left
function moveLeft() {
    // Check if the current Tetrimino can move left
    if (!checkCollision(currentTetrimino, currentRow, currentCol - 1)) {
        // Move the Tetrimino left
        currentCol--;
        // Redraw the game board with the updated Tetrimino position
        renderGameBoard();
    }
}

// Function to move the current Tetrimino right
function moveRight() {
    // Check if the current Tetrimino can move right
    if (!checkCollision(currentTetrimino, currentRow, currentCol + 1)) {
        // Move the Tetrimino right
        currentCol++;
        // Redraw the game board with the updated Tetrimino position
        renderGameBoard();
    }
}

// Function to move the current Tetrimino down
function moveDown() {
    // Check if the current Tetrimino can move down
    if (!checkCollision(currentTetrimino, currentRow + 1, currentCol)) {
        // Move the Tetrimino down
        currentRow++;
        // Redraw the game board with the updated Tetrimino position
        renderGameBoard();
    } else {
        // If the Tetrimino cannot move down further, lock it in place and generate a new Tetrimino
        lockTetrimino(getColorClass(currentTetrimino));
        generateNewTetrimino();
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        moveLeft();
    } else if (event.key === 'ArrowRight') {
        moveRight();
    } else if (event.key === 'ArrowDown') {
        moveDown();
    } else if (event.key === 'ArrowUp') {
        rotateClockwise();
    }
});



// Function to move the current Tetrimino down automatically
function moveDownAutomatically() {
    if (!checkCollision(currentTetrimino, currentRow + 1, currentCol)) {
        currentRow++;
        renderGameBoard();
    } else {
        lockTetrimino(getColorClass(currentTetrimino));
    }
}

// Function to start the automatic downward movement
function startAutomaticDownMovement() {
    stopDownwardMovement();
    intervalId = setInterval(moveDownAutomatically, 1000);
}

// Function to stop automatic downward movement
function stopDownwardMovement() {
    clearInterval(intervalId);
}


/*
------------------------------- ROTATION -------------------------------
 */
// Function to rotate the current Tetrimino clockwise
// Function to rotate the current Tetrimino clockwise
function rotateClockwise() {
    // Clone the current Tetrimino for rotation
    const rotatedTetrimino = rotateMatrixClockwise(currentTetrimino);
    // Check if the rotated Tetrimino collides with the game board or other Tetriminos
    if (!checkCollision(rotatedTetrimino, currentRow, currentCol)) {
        // Update the current Tetrimino with the rotated Tetrimino
        currentTetrimino = rotatedTetrimino;
        // Redraw the game board with the rotated Tetrimino
        renderGameBoard();
        // Apply color class after rotation
        displayTetrimino(currentTetrimino, currentRow, currentCol);
    }
}


// Function to rotate a matrix clockwise
function rotateMatrixClockwise(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotatedMatrix = [];
    for (let col = 0; col < cols; col++) {
        const newRow = [];
        for (let row = rows - 1; row >= 0; row--) {
            newRow.push(matrix[row][col]);
        }
        rotatedMatrix.push(newRow);
    }
    return rotatedMatrix;
}




/*
------------------------------- GAME STATE LOGIC -------------------------------
 */

// Function to check if the current Tetrimino collides with the game board or other Tetriminos
function checkCollision(tetrimino, row, col) {
    for (let i = 0; i < tetrimino.length; i++) {
        for (let j = 0; j < tetrimino[i].length; j++) {
            // Check if the cell of the Tetrimino is outside the game board boundaries
            if (tetrimino[i][j] !== 0 && (row + i < 0 || row + i >= ROWS || col + j < 0 || col + j >= COLS)) {
                return true; // Collision with game board boundaries
            }
            // Check if the cell of the Tetrimino collides with a filled cell on the game board
            if (tetrimino[i][j] !== 0 && gameBoard[row + i][col + j] !== 0) {
                return true; // Collision with another Tetrimino
            }
        }
    }
    return false; // No collision detected
}


// Function to clear completed rows and update the score
function clearCompletedRows() {
    let completedRows = 0;
    for (let row = 0; row < ROWS; row++) {
        if (gameBoard[row].every(cell => cell !== 0)) {
            // Clear the completed row by shifting all rows above it down
            for (let r = row; r > 0; r--) {
                gameBoard[r] = [...gameBoard[r - 1]];
            }
            // Set the top row to empty
            gameBoard[0] = new Array(COLS).fill(0);
            completedRows++;
        }
    }
    // Update the score based on the number of completed rows
    updateScore(score + completedRows);
}

// Update score
function updateScore(newScore) {
    score = newScore;
    document.getElementById('score').textContent = score;
}

// Function to check if the game is lost (Tetrimino reaches the top)
function checkGameLost() {
    for (let col = 0; col < COLS; col++) {
        if (gameBoard[0][col] !== 0) {
            console.log("Game Lost!");
            return true; // Game is lost if any cell in the top row is filled
        }
    }
    return false;
}

function endGame() {
    gameOver = true;
    stopDownwardMovement();
    const loseOverlay = document.createElement('div');
    loseOverlay.setAttribute('id', 'lose');
    document.getElementById('gameBoard').appendChild(loseOverlay);
}


// start game
function init() {
    gameOver = false;
    stopDownwardMovement();
    gameBoard = [];
    clearInterval(intervalId);

    if(document.getElementById('lose')) document.getElementById('lose').remove();


    initGameBoard();
    generateNewTetrimino();
    renderGameBoard();
    startAutomaticDownMovement();
    updateScore(score);
}

// Start the game
document.getElementById("start").addEventListener("click" , function (e) {
    init();
})



/*
--------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------
----------------------------------------------------- AI -----------------------------------------------------
--------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------
 */
