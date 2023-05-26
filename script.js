document.addEventListener('DOMContentLoaded', () => {

    // Constants
    const ROWS = 20;
    const COLS = 10;
    const EMPTY_CELL = 0;

	// Scoring values
	const SCORE_SINGLE_LINE = 40;
	const SCORE_DOUBLE_LINE = 100;
	const SCORE_TRIPLE_LINE = 300;
	const SCORE_TETRIS = 1200;

	// Array of block shapes
	const blockShapes = [
		[[1, 1, 1, 1]], // I shape
		[[2, 2], [2, 2]], // O shape
		[[0, 3, 3], [3, 3, 0]], // S shape
		[[4, 4, 4], [0, 4, 0]], // T shape
		[[5, 0, 0], [5, 5, 5]], // L shape
		[[0, 0, 6], [6, 6, 6]], // J shape
		[[7, 7, 0], [0, 7, 7]], // Z shape
	];
	const blockValues = [7, 14, 21, 28, 35, 42, 49];

    // Game state
    let board = [];
    let currentBlock = {};
    let speed = 1000; // Initial speed in milliseconds
    let lastFrameTime = 0;

	// Variable to track the pause state
	let isPaused = false;
	let isGameOver = false;
	let score = 0;
    let linesCompleted = 0;

    // DOM elements
    const gameBoard = document.querySelector('.game-board');

	// Function to check collision between the block and the game board
	// Function to check if the game is over
	const checkCollision = (block, row, col) => {
	    for (let r = 0; r < block.shape.length; r++) {
	        for (let c = 0; c < block.shape[r].length; c++) {
	            if (block.shape[r][c] !== EMPTY_CELL) {
	                const newRow = row + r;
	                const newCol = col + c;
	
	                // Check if the block is outside the game board boundaries
	                if (newRow >= ROWS || newCol < 0 || newCol >= COLS) {
	                    return false;
	                }
	
	                // Check if there is a collision with other blocks
	                if (newRow >= 0 && board[newRow][newCol] !== EMPTY_CELL) {
	                    return false;
	                }
	            }
	        }
	    }
	    return true;
	};
	const checkGameOver = () => {
	    isGameOver = !checkCollision(currentBlock, currentBlock.row, currentBlock.col);
	    if (isGameOver) {
	        console.log('Game over!');
	        // Additional handling for game over if needed
	    }
	};

	// Function to rotate the current block
	// Function to spawn a new block
	// Function to randomly select a block shape
	const getRotatedBlock = () => {
	    const { shape } = currentBlock;
	    const numRows = shape.length;
	    const numCols = shape[0].length;
	
	    const rotatedShape = [];
	
	    for (let col = 0; col < numCols; col++) {
	        const newRow = [];
	
	        for (let row = numRows - 1; row >= 0; row--) {
	            newRow.push(shape[row][col]);
	        }
	
	        rotatedShape.push(newRow);
	    }
	
	    return { ...currentBlock, shape: rotatedShape };
	};
	const spawnNewBlock = () => {
	    // Get a random block shape
	    const shape = getRandomBlockShape();
	
	    // Assign the shape and initial position to currentBlock
	    currentBlock = {
	        shape,
	        // Initial row position
	        row: 0,
	        // Initial column position
			// col: Math.floor(COLS / 2) - Math.floor(currentBlock.shape[0].length / 2),
	        col: Math.floor(COLS / 2) - 1,
	    };
	};
	const getRandomBlockShape = () => {
	    const randomIndex = Math.floor(Math.random() * blockShapes.length);
	    return blockShapes[randomIndex];
	};
	
	const calculateLevelBonus = (linesCleared) => {
	    const level = Math.floor(linesCleared / 10) + 1;
	    const bonusMultiplier = getLevelBonusMultiplier(level);
	    return linesCleared * bonusMultiplier;
	};
	const getLevelBonusMultiplier = (level) => {
		return 1 + (level - 1) / 25;
	};
	const getTetriminoClass = (cell) => (['I', 'O', 'S', 'T', 'L', 'J', 'Z'])[cell - 1] || '';

    // Function to create an empty game board
    const createGameBoard = () => {
        board = Array.from({
            length: ROWS
        },
        () => Array(COLS).fill(EMPTY_CELL));
    };

    // Function to update the speed based on the number of completed lines
	// Function to update the game state. Calculates the next state so to speak
    const updateSpeed = () => {
        if (linesCompleted < 450) {
            // Decrease the speed as more lines are completed
            speed = 1000 - (linesCompleted * 2);
        } else {
            // After 500 lines, set the speed to the fastest value
            speed = 100;
        }
        
        renderSpeed();
    };
	const updateGameState = () => {
	    if (checkCollision(currentBlock, currentBlock.row + 1, currentBlock.col)) {
	        currentBlock.row++;
	    } else {
	        mergeBlockWithBoard();
	        clearCompletedLines();
	        spawnNewBlock();
	    }
	};
	const updateScore = (linesCleared) => {
		linesCompleted += linesCleared;
		if (linesCleared === 1) {
		    score += 40;
		} else if (linesCleared === 2) {
		    score += 100;
		} else if (linesCleared === 3) {
		    score += 300;
		} else if (linesCleared === 4) {
		    score += 1200;
		}
		
		score += calculateLevelBonus(linesCleared);

		renderScore();
	};
	
	// Updated gameLoop function
	const gameLoop = (timestamp) => {
	    if (!isPaused && !isGameOver) {
	        const deltaTime = timestamp - lastFrameTime;
	        if (lastFrameTime === 0 || deltaTime >= speed) {
	            lastFrameTime = timestamp;
	            updateGameState();
	            renderGameState();
	            checkGameOver();
	            if (!isGameOver) {
	                requestAnimationFrame(gameLoop);
	            }
	        } else {
	            requestAnimationFrame(gameLoop);
	        }
	    }
	};
	
    // Functions to render different areas of the game, board, block, score
	const renderGameState = () => {
	    renderGameBoard();
	    renderCurrentBlock();
	    renderScore();
	    renderSpeed();
	};
    const renderGameBoard = () => {
        gameBoard.innerHTML = '';

        board.forEach((row) => {
            row.forEach((cell) => {
                const block = document.createElement('div');
                block.className = cell === EMPTY_CELL ? 'block' : 'block filled ' + getTetriminoClass(cell);
                gameBoard.appendChild(block);
            });
        });
    };
	const renderCurrentBlock = () => {
	    const { shape, row, col } = currentBlock;
	
	    shape.forEach((rowArr, rowIndex) => {
	        rowArr.forEach((cell, colIndex) => {
	            if (cell !== EMPTY_CELL) {
	                const newRow = row + rowIndex;
	                const newCol = col + colIndex;
	
	                const block = gameBoard.children[newRow * COLS + newCol];
	                block.className = "block filled current " + getTetriminoClass(cell);
	            }
	        });
	    });
	};
	const renderScore = () => {
		const scoreValueElement = document.getElementById('score-value');
		scoreValueElement.textContent = score.toString();
		const linesValueElement = document.getElementById('lines-value');
		linesValueElement.textContent = linesCompleted.toString();
	};
	const renderSpeed = () => {
		const speedValueElement = document.getElementById('speed-value');
		speedValueElement.textContent = speed.toString();
	};

    // Function to merge the current block with the game board
	// Function to clear completed lines
	const mergeBlockWithBoard = () => {
	    currentBlock.shape.forEach((row, blockRow) => {
	        row.forEach((cell, blockCol) => {
	            if (cell !== EMPTY_CELL) {
	                const newRow = currentBlock.row + blockRow;
	                const newCol = currentBlock.col + blockCol;
	                board[newRow][newCol] = cell;
	                
			        const block = gameBoard.children[newRow * COLS + newCol];
			        block.className = "block filled " + getTetriminoClass(cell);
	            }
	        });
	    });
	};
	const clearCompletedLines = () => {
		let linesCleared = 0;
		
	    for (let row = ROWS - 1; row >= 0; row--) {
	        if (board[row].every((cell) => cell !== EMPTY_CELL)) {
	            board.splice(row, 1);
	            board.unshift(Array(COLS).fill(EMPTY_CELL));
			    linesCleared++;
			    
			    renderGameState();
	
	            row++;
	        }
	    }
	    
	    updateScore(linesCleared);
		updateSpeed();		

	    return linesCleared;
	};
	// Functions to move the current block left, right or down
    const moveBlockLeft = () => {
        if (checkCollision(currentBlock, currentBlock.row, currentBlock.col - 1)) {
            currentBlock.col--;
            renderGameState();
        }
    };
    const moveBlockRight = () => {
        if (checkCollision(currentBlock, currentBlock.row, currentBlock.col + 1)) {
            currentBlock.col++;
            renderGameState();
        }
    };
	const moveBlockDown = () => {
	    if (!isPaused) {
	        if (checkCollision(currentBlock, currentBlock.row + 1, currentBlock.col)) {
	        	// TODO Soft Drop Scoring
	            currentBlock.row++;
	            renderGameState();
	        }
	    }
	};

	// // Functions to drop or rotate the current block (counter)clockwise
	const rotateBlockClockwise = () => {
	    const rotatedShape = currentBlock.shape[0].map((_, colIndex) => currentBlock.shape.map((row) => row[colIndex]).reverse());
	
	    const rotatedBlock = { shape: rotatedShape, row: currentBlock.row, col: currentBlock.col, };
	
	    if (checkCollision(rotatedBlock, rotatedBlock.row, rotatedBlock.col)) {
	        currentBlock.shape = rotatedShape;
	    }
	
	    renderGameState();
	};
	const rotateBlockCounterClockwise = () => {
	    const rotatedShape = currentBlock.shape[0].map((_, colIndex) => currentBlock.shape.map((row) => row[colIndex])).reverse();
	
	    const rotatedBlock = {
	        shape: rotatedShape,
	        row: currentBlock.row,
	        col: currentBlock.col,
	    };
	
	    if (checkCollision(rotatedBlock, rotatedBlock.row, rotatedBlock.col)) {
	        currentBlock.shape = rotatedShape;
	    }
	
	    renderGameState();
	};
    const dropBlock = () => {
        let canMoveDown = true;
        while (canMoveDown) {
            canMoveDown = checkCollision(currentBlock, currentBlock.row + 1, currentBlock.col);
            if (canMoveDown) {
                currentBlock.row++;
            }
	        renderGameState();
        }
        renderGameState();
    };

	// Functions to initialize, pause or resume the game
    const initializeGame = () => {
    	
		// Key-function mapping
		const KEYS = {
		    ArrowLeft: moveBlockLeft,
		    ArrowRight: moveBlockRight,
		    ArrowUp: rotateBlockCounterClockwise,
			ArrowDown: moveBlockDown,
		    ' ': dropBlock,
			'[': rotateBlockCounterClockwise,
			']': rotateBlockClockwise,
		    Escape: pauseGame,
		};
		
		// Event listener for key presses
		document.addEventListener('keydown', (event) => {
		    const key = event.key;
		    if (!isPaused || key === 'Escape') {
		        if (key in KEYS) {
		            KEYS[key]();
		            event.preventDefault();
		        }
		    }
		});
	
        createGameBoard();
        spawnNewBlock();
        renderGameState();

	    // Start the game loop
	    requestAnimationFrame(gameLoop);
    };
	const pauseGame = () => {
	    // Toggle the pause state
	    
    	isPaused = isGameOver ? true : !isPaused;

	    // Add code to handle the pause state and update the UI accordingly
	    if (isPaused) {
	        // Pause the game logic
	        // Display a pause message or UI
	        // Disable input handling during the pause
		    gameBoard.classList.add('paused');
	        console.log('Game paused');
	    } else {
	        // Resume the game logic
	        // Remove the pause message or UI
	        // Enable input handling
    		gameBoard.classList.remove('paused');
	        console.log('Game resumed');
	        // Resume the game loop or any other necessary actions
	        requestAnimationFrame(gameLoop);
	    }
	};

    // Initialize the game
    initializeGame();
});