// Function to create a solved Sudoku board
function createSolvedBoard() {
  const board = Array(9)
    .fill()
    .map(() => Array(9).fill(""));

  function solve(row = 0, col = 0) {
    if (col === 9) {
      row++;
      col = 0;
    }
    if (row === 9) return true;
    if (board[row][col] !== "") return solve(row, col + 1);

    const nums = Array.from({ length: 9 }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }

    for (const num of nums) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        if (solve(row, col + 1)) return true;
        board[row][col] = "";
      }
    }
    return false;
  }

  solve();
  return board;
}

// Function to check if a number is valid in a position
function isValid(board, row, col, num) {
  // Check if the number is already in the cell
  if (board[row][col] === num) {
    return true;
  }

  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
}

// Function to create a puzzle with specified difficulty
function createPuzzle(difficulty) {
  const solvedBoard = createSolvedBoard();
  const puzzle = solvedBoard.map((row) => [...row]);

  // Number of cells to remove based on difficulty
  const cellsToRemove =
    {
      easy: 30,
      medium: 40,
      hard: 50,
    }[difficulty] || 40;

  // Remove cells randomly
  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== "") {
      puzzle[row][col] = "";
      removed++;
    }
  }

  return {
    puzzle,
    solution: solvedBoard,
  };
}

// Function to check if the current board is solved correctly
function isSolvedCorrectly(currentBoard, solution) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (currentBoard[i][j] !== solution[i][j]) {
        return false;
      }
    }
  }
  return true;
}

// Function to get a hint (returns the solution for a given cell)
function getHint(currentBoard, solution, row, col) {
  if (currentBoard[row][col] === "") {
    return solution[row][col];
  }
  return null;
}

export { createPuzzle, isValid, isSolvedCorrectly, getHint };
