import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  createPuzzle,
  isValid,
  isSolvedCorrectly,
  getHint,
} from "./utils/sudokuGenerator";
import "./App.css";

const SudokuBoard = forwardRef(
  ({ difficulty, onGameStart, onGameComplete, isPaused }, ref) => {
    const [board, setBoard] = useState([]);
    const [initialBoard, setInitialBoard] = useState([]);
    const [solution, setSolution] = useState([]);
    const [selected, setSelected] = useState({ row: null, col: null });
    const [errors, setErrors] = useState([]);
    const [hints, setHints] = useState([]);
    const [isComplete, setIsComplete] = useState(false);
    const boardRef = useRef(null);

    // Generate new puzzle
    const generateNewPuzzle = useCallback(() => {
      const { puzzle, solution: newSolution } = createPuzzle(difficulty);
      setBoard(puzzle);
      setInitialBoard(puzzle.map((row) => [...row]));
      setSolution(newSolution);
      setErrors([]);
      setHints([]);
      setIsComplete(false);
      onGameStart();
    }, [difficulty, onGameStart]);

    // Initialize game
    useEffect(() => {
      if (!boardRef.current) {
        generateNewPuzzle();
        boardRef.current = true;
      }
    }, [generateNewPuzzle]);

    // Reset board ref when difficulty changes
    useEffect(() => {
      boardRef.current = false;
    }, [difficulty]);

    // Check for completion
    useEffect(() => {
      if (board.length > 0 && isSolvedCorrectly(board, solution)) {
        setIsComplete(true);
        onGameComplete();
      }
    }, [board, solution, onGameComplete]);

    const handleChange = useCallback(
      (row, col, val) => {
        if (isPaused) return;

        // Don't allow changes to initial numbers
        if (initialBoard[row][col] !== "") {
          return;
        }

        // Only allow empty string or numbers 1-9
        if (val === "" || /^[1-9]$/.test(val)) {
          const numVal = val === "" ? "" : Number(val);

          // Don't update if the value is the same
          if (board[row][col] === numVal) {
            return;
          }

          // Create new board with the change
          const newBoard = board.map((r, i) =>
            r.map((c, j) => (i === row && j === col ? numVal : c))
          );

          // Check for errors
          const newErrors = [];
          if (numVal !== "") {
            // Only check for errors if the number is different from the current value
            if (
              numVal !== board[row][col] &&
              !isValid(newBoard, row, col, numVal)
            ) {
              newErrors.push({ row, col });
            }
          }

          setBoard(newBoard);
          setErrors(newErrors);
        }
      },
      [board, initialBoard, isPaused]
    );

    const handleHint = useCallback(() => {
      if (isPaused) return;

      if (selected.row !== null && selected.col !== null) {
        // Don't allow hints for initial numbers
        if (initialBoard[selected.row][selected.col] !== "") {
          return;
        }
        const hint = getHint(board, solution, selected.row, selected.col);
        if (hint !== null) {
          const newBoard = board.map((r, i) =>
            r.map((c, j) =>
              i === selected.row && j === selected.col ? hint : c
            )
          );
          setBoard(newBoard);
          setHints([...hints, { row: selected.row, col: selected.col }]);
        }
      }
    }, [board, solution, selected, initialBoard, hints, isPaused]);

    const handleKeyDown = useCallback(
      (e, row, col) => {
        if (isPaused) return;

        // Don't allow changes to initial numbers
        if (initialBoard[row][col] !== "") {
          return;
        }

        if (e.key >= "1" && e.key <= "9") {
          handleChange(row, col, e.key);
        } else if (e.key === "Backspace" || e.key === "Delete") {
          handleChange(row, col, "");
        } else if (e.key === "ArrowUp" && row > 0) {
          setSelected({ row: row - 1, col });
        } else if (e.key === "ArrowDown" && row < 8) {
          setSelected({ row: row + 1, col });
        } else if (e.key === "ArrowLeft" && col > 0) {
          setSelected({ row, col: col - 1 });
        } else if (e.key === "ArrowRight" && col < 8) {
          setSelected({ row, col: col + 1 });
        }
      },
      [handleChange, initialBoard, isPaused]
    );

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      generateNewPuzzle,
      handleHint,
    }));

    return (
      <div className="sudoku-container">
        <div className={`sudoku-board ${isPaused ? "paused" : ""}`}>
          {board.map((row, i) => (
            <div
              className={`sudoku-row${
                selected.row === i ? " highlight-row" : ""
              }`}
              key={i}
            >
              {row.map((cell, j) => {
                const isError = errors.some((e) => e.row === i && e.col === j);
                const isHint = hints.some((h) => h.row === i && h.col === j);
                const isInitial = initialBoard[i][j] !== "";
                return (
                  <input
                    className={`sudoku-cell
                    ${
                      selected.row === i && selected.col === j
                        ? " selected"
                        : ""
                    }
                    ${selected.col === j ? " highlight-col" : ""}
                    ${isError ? " error" : ""}
                    ${isHint ? " hint" : ""}
                    ${isInitial ? " initial" : ""}
                  `}
                    key={j}
                    type="text"
                    maxLength={1}
                    value={cell}
                    aria-label={`Row ${i + 1} Column ${j + 1}`}
                    onFocus={() => !isPaused && setSelected({ row: i, col: j })}
                    onChange={(e) => handleChange(i, j, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, i, j)}
                    disabled={isInitial || isComplete || isPaused}
                    tabIndex={0}
                    autoComplete="off"
                    inputMode="numeric"
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default SudokuBoard;
