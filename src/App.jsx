import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import React, { useState, useCallback, useEffect } from "react";
import SudokuBoard from "./SudokuBoard";
import "./App.css";

function App() {
  const [dark, setDark] = useState(true);
  const [difficulty, setDifficulty] = useState("medium");
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStatus, setGameStatus] = useState("");
  const [bestTimes, setBestTimes] = useState(() => {
    const saved = localStorage.getItem("sudokuBestTimes");
    return saved
      ? JSON.parse(saved)
      : {
          easy: Infinity,
          medium: Infinity,
          hard: Infinity,
        };
  });

  const handleGameStart = useCallback(() => {
    setTimer(0);
    setIsPlaying(true);
    setIsPaused(false);
    setGameStatus("");
  }, []);

  const handleGameComplete = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setGameStatus("Completed! 🎉");

    // Update best time if current time is better
    if (timer < bestTimes[difficulty]) {
      const newBestTimes = { ...bestTimes, [difficulty]: timer };
      setBestTimes(newBestTimes);
      localStorage.setItem("sudokuBestTimes", JSON.stringify(newBestTimes));
    }
  }, [timer, difficulty, bestTimes]);

  const handleNewGame = useCallback(() => {
    setTimer(0);
    setIsPlaying(true);
    setIsPaused(false);
    setGameStatus("");
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused((prev) => !prev);
    setGameStatus((prev) => (prev === "Paused" ? "" : "Paused"));
  }, []);

  // Timer effect
  useEffect(() => {
    let intervalId;
    if (isPlaying && !isPaused) {
      intervalId = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatBestTime = (time) => {
    return time === Infinity ? "--:--" : formatTime(time);
  };

  return (
    <div className={dark ? "sudoku-app dark" : "sudoku-app"}>
      <div className="theme-toggle">
        <button onClick={() => setDark((d) => !d)}>
          {dark ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
      <div className="sudoku-card">
        <h1>Sudoku Game</h1>

        <div className="game-controls">
          <div className="difficulty-selector">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="difficulty-select"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <div className="best-time">
              Best: {formatBestTime(bestTimes[difficulty])}
            </div>
          </div>

          <div className="game-stats">
            <div className="timer">{formatTime(timer)}</div>
            {gameStatus && <div className="game-status">{gameStatus}</div>}
          </div>

          <div className="game-buttons">
            {isPlaying && (
              <button className="pause-button" onClick={handlePause}>
                {isPaused ? "▶️ Resume" : "⏸️ Pause"}
              </button>
            )}
            <button className="new-game-btn" onClick={handleNewGame}>
              New Game
            </button>
          </div>
        </div>

        <SudokuBoard
          dark={dark}
          difficulty={difficulty}
          onGameStart={handleGameStart}
          onGameComplete={handleGameComplete}
          isPaused={isPaused}
        />
      </div>
      <footer className="sudoku-footer">
        <span>A fun Sudoku game</span>
      </footer>
    </div>
  );
}

export default App;
