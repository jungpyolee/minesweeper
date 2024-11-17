import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  startGame,
  revealCell,
  toggleFlag,
  resetGame,
  areaOpen,
} from "../store/gameSlice";
import { RootState } from "../store";

const Board = () => {
  const dispatch = useDispatch();
  const {
    grid,
    isGameOver,
    mineCount,
    isSuccess,
    rows: numRows,
    cols: numCols,
  } = useSelector((state: RootState) => state.game);
  const [difficulty, setDifficulty] = useState("easy");
  const [flagsRemaining, setFlagsRemaining] = useState(mineCount);
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customRows, setCustomRows] = useState(8);
  const [customCols, setCustomCols] = useState(8);
  const [customMines, setCustomMines] = useState(10);
  const [mouseDown, setMouseDown] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDown(e.buttons);
  };
  const handleMouseUp = (e: React.MouseEvent, x: number, y: number) => {
    if (mouseDown === 3) {
      dispatch(areaOpen({ x, y }));
    }
    setMouseDown(e.buttons);
  };
  let timer: number;

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDifficulty(value);
    localStorage.setItem("difficulty", value); // 로컬스토리지에 난이도 저장

    if (value === "custom") {
      setShowModal(true);
    } else {
      let rows, cols, mines;
      switch (value) {
        case "easy":
          rows = 8;
          cols = 8;
          mines = 10;
          break;
        case "intermediate":
          rows = 16;
          cols = 16;
          mines = 40;
          break;
        case "expert":
          rows = 16;
          cols = 32;
          mines = 99;
          break;
        default:
          rows = 8;
          cols = 8;
          mines = 10;
      }
      dispatch(
        startGame({
          rows,
          cols,
          firstClick: { x: -1, y: -1 },
          mineCount: mines,
        })
      );
      localStorage.setItem("customRows", rows.toString());
      localStorage.setItem("customCols", cols.toString());
      localStorage.setItem("customMines", mines.toString());
    }
  };

  const handleModalClose = () => setShowModal(false);

  const handleCustomStart = () => {
    if (customRows < 2 || customCols < 2 || customMines < 1) {
      alert("가로, 세로 길이는 2, 지뢰 수는 1 이상이어야 합니다.");
      return;
    }
    if (customRows > 100 || customCols > 100) {
      alert("가로, 세로는 100 이하이어야 합니다.");
      return;
    }

    const maxMines = Math.floor(customRows * customCols * 0.33);
    if (customMines > maxMines) {
      alert(`이 크기에서 지뢰 수는 최대 ${maxMines}개까지 가능합니다.`);
      return;
    }

    dispatch(
      startGame({
        rows: customRows,
        cols: customCols,
        firstClick: { x: -1, y: -1 },
        mineCount: customMines,
      })
    );

    // 로컬 스토리지에 설정 값 저장
    localStorage.setItem("difficulty", "custom");
    localStorage.setItem("customRows", customRows.toString());
    localStorage.setItem("customCols", customCols.toString());
    localStorage.setItem("customMines", customMines.toString());

    setShowModal(false);
  };
  useEffect(() => {
    if (timerRunning && !isGameOver && !isSuccess) {
      timer = window.setInterval(
        () => setTime((prevTime) => prevTime + 1),
        1000
      );
    } else {
      window.clearInterval(timer);
    }
    return () => window.clearInterval(timer);
  }, [timerRunning, isGameOver, isSuccess]);

  useEffect(() => {
    setFlagsRemaining(mineCount);
  }, [mineCount]);

  const handleLeftClick = useCallback(
    (x: number, y: number) => {
      if (!isGameOver && !grid[x][y].isFlagged) {
        if (!timerRunning) {
          dispatch(
            startGame({
              rows: numRows,
              cols: numCols,
              firstClick: { x, y },
              mineCount,
            })
          );
        }
        dispatch(revealCell({ x, y }));
        setTimerRunning(true);
      }
    },
    [isGameOver, timerRunning, dispatch, grid, numRows, numCols, mineCount]
  );

  const handleRightClick = useCallback(
    (x: number, y: number, event: React.MouseEvent) => {
      event.preventDefault();
      if (!isGameOver && !grid[x][y].isRevealed) {
        dispatch(toggleFlag({ x, y }));
        setFlagsRemaining((prevFlags) =>
          grid[x][y].isFlagged ? prevFlags + 1 : prevFlags - 1
        );
      }
    },
    [isGameOver, dispatch, grid]
  );

  const handleReset = () => {
    setFlagsRemaining(mineCount);
    setTime(0);
    setTimerRunning(false);
    dispatch(
      resetGame({ rows: numRows, cols: numCols, firstClick: { x: -1, y: -1 } })
    );
  };

  useEffect(() => {
    handleReset();
  }, [difficulty]);

  useEffect(() => {
    // 로컬 스토리지에서 값 불러오기
    const storedDifficulty = localStorage.getItem("difficulty");
    const storedRows = localStorage.getItem("customRows");
    const storedCols = localStorage.getItem("customCols");
    const storedMines = localStorage.getItem("customMines");

    if (storedDifficulty) setDifficulty(storedDifficulty);
    if (storedRows) setCustomRows(Number(storedRows));
    if (storedCols) setCustomCols(Number(storedCols));
    if (storedMines) setCustomMines(Number(storedMines));

    // 기본적으로 로컬스토리지에서 값을 불러왔을 때 시작하는 게임
    if (storedRows && storedCols && storedMines) {
      dispatch(
        startGame({
          rows: Number(storedRows),
          cols: Number(storedCols),
          firstClick: { x: -1, y: -1 },
          mineCount: Number(storedMines),
        })
      );
    }
  }, []); // 컴포넌트가 처음 마운트될 때 한 번만 실행

  return (
    <div className="p-20 flex flex-col items-center justify-center min-h-screen bg-lime-100">
      <h2 className="pt-4 text-2xl font-bold">MINESWEEPER</h2>
      <div className="flex items-center gap-4 my-4 text-lg font-medium">
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 text-lg font-bold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={difficulty}
            onChange={handleDifficultyChange}
          >
            <option value="easy">Easy</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>🚩 {flagsRemaining}</div>
        <div className="flex items-center w-20">⏰ {time}</div>
        <button
          className="w-20 px-1 py-2 text-white transition-all bg-blue-500 rounded-lg hover:bg-blue-600 active:bg-blue-700"
          onClick={handleReset}
        >
          게임 시작
        </button>
      </div>

      <div
        className={`grid gap-1 p-2 bg-green-500 rounded-lg shadow-lg`}
        onContextMenu={(e) => e.preventDefault()}
        style={{ gridTemplateColumns: `repeat(${numCols}, 32px)` }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-8 h-8 text-center font-bold ${
                cell.isRevealed
                  ? cell.isMine
                    ? "bg-red-400"
                    : "bg-yellow-300"
                  : cell.isFlagged
                  ? "bg-violet-300 text-red-500"
                  : "bg-green-200"
              }`}
              onClick={() => handleLeftClick(rowIndex, colIndex)}
              onContextMenu={(event) => {
                handleRightClick(rowIndex, colIndex, event);
              }}
              onMouseDown={(event) => handleMouseDown(event)}
              onMouseUp={(event) => handleMouseUp(event, rowIndex, colIndex)}
            >
              {cell.isRevealed && !cell.isMine
                ? cell.neighborMines > 0
                  ? cell.neighborMines
                  : ""
                : ""}
              {cell.isFlagged && "🚩"}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4">Customize Difficulty</h3>
            <div className="mb-4">
              <label className="block mb-2">가로</label>
              <input
                type="number"
                max="100"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={customRows || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomRows(value === "" ? 0 : Number(value)); // 빈 입력은 0으로 처리
                }}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">세로</label>
              <input
                type="number"
                max="100"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={customCols || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomCols(value === "" ? 0 : Number(value)); // 빈 입력은 0으로 처리
                }}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">지뢰 수</label>
              <input
                type="number"
                min="1"
                max={Math.floor(customRows * customCols * 0.33)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={customMines || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomMines(value === "" ? 0 : Number(value)); // 빈 입력은 0으로 처리
                }}
              />
            </div>
            <div className="flex gap-4">
              <button
                className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleCustomStart}
              >
                Start Game
              </button>
              <button
                className="w-full px-3 py-2 bg-red-500 text-white rounded-lg"
                onClick={handleModalClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isGameOver && !isSuccess && (
        <div className="mt-4 text-2xl font-bold text-red-600">GAME OVER</div>
      )}
      {isSuccess && (
        <div className="mt-4 text-2xl font-bold text-green-600">YOU WIN!</div>
      )}
    </div>
  );
};

export default Board;
