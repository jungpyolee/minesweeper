import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

interface GameState {
  grid: Cell[][];
  rows: number;
  cols: number;
  mineCount: number;
  isGameOver: boolean;
  isSuccess: boolean;
}

const initialState: GameState = {
  grid: [],
  rows: 10,
  cols: 10,
  mineCount: 10, // Set default mine count (e.g., 10)
  isGameOver: false,
  isSuccess: false,
};

const generateGrid = (
  rows: number,
  cols: number,
  firstClick: { x: number; y: number },
  minesToPlace: number
): { grid: Cell[][]; mineCount: number } => {
  let mineCount = 0;
  const grid: Cell[][] = Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => ({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        }))
    );

  // 지뢰 배치
  const positions: { x: number; y: number }[] = [];
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      if (!(x === firstClick.x && y === firstClick.y)) {
        positions.push({ x, y });
      }
    }
  }

  for (let i = 0; i < minesToPlace; i++) {
    const randomIndex = Math.floor(Math.random() * positions.length);
    const { x, y } = positions.splice(randomIndex, 1)[0];
    grid[x][y].isMine = true;
    mineCount++;
  }

  // 각 칸의 주변 지뢰 수 계산
  grid.forEach((row, x) => {
    row.forEach((cell, y) => {
      if (!cell.isMine) {
        let minesCount = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newX = x + i;
            const newY = y + j;
            if (
              newX >= 0 &&
              newX < rows &&
              newY >= 0 &&
              newY < cols &&
              grid[newX][newY].isMine
            ) {
              minesCount++;
            }
          }
        }
        cell.neighborMines = minesCount;
      }
    });
  });

  return { grid, mineCount };
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    startGame(
      state,
      action: PayloadAction<{
        rows: number;
        cols: number;
        firstClick: { x: number; y: number };
        mineCount: number;
      }>
    ) {
      const { rows, cols, firstClick, mineCount } = action.payload;
      const { grid } = generateGrid(rows, cols, firstClick, mineCount);
      state.grid = grid;
      state.rows = rows;
      state.cols = cols;
      state.mineCount = mineCount;
      state.isGameOver = false;
      state.isSuccess = false;
    },
    revealCell(state, action: PayloadAction<{ x: number; y: number }>) {
      const { x, y } = action.payload;

      const revealAdjacentCells = (grid: Cell[][], x: number, y: number) => {
        if (grid[x][y].isRevealed || grid[x][y].isFlagged) return;

        grid[x][y].isRevealed = true;

        if (grid[x][y].neighborMines === 0) {
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const newX = x + i;
              const newY = y + j;
              if (
                newX >= 0 &&
                newX < state.rows &&
                newY >= 0 &&
                newY < state.cols &&
                !grid[newX][newY].isRevealed &&
                !grid[newX][newY].isMine
              ) {
                revealAdjacentCells(grid, newX, newY);
              }
            }
          }
        }
      };

      revealAdjacentCells(state.grid, x, y);

      if (state.grid[x][y].isMine) {
        state.grid.forEach((row) =>
          row.forEach((cell) => {
            cell.isRevealed = true;
            if (cell.isFlagged && !cell.isMine) cell.isFlagged = false;
          })
        );
        state.isGameOver = true;
      } else {
        const nonMineCells = state.grid.flat().filter((cell) => !cell.isMine);
        state.isSuccess = nonMineCells.every((cell) => cell.isRevealed);
        state.isGameOver = state.isSuccess;
      }
    },
    toggleFlag(state, action: PayloadAction<{ x: number; y: number }>) {
      const { x, y } = action.payload;
      const cell = state.grid[x][y];
      if (!cell.isRevealed) {
        cell.isFlagged = !cell.isFlagged;
      }
    },
    resetGame(
      state,
      action: PayloadAction<{
        rows: number;
        cols: number;
        firstClick: { x: number; y: number };
      }>
    ) {
      const { rows, cols, firstClick } = action.payload;
      const { grid, mineCount } = generateGrid(
        rows,
        cols,
        firstClick,
        state.mineCount
      );
      state.grid = grid;
      state.rows = rows;
      state.cols = cols;
      state.mineCount = mineCount;
      state.isGameOver = false;
      state.isSuccess = false;
    },
  },
});

export const { startGame, revealCell, toggleFlag, resetGame } =
  gameSlice.actions;

export default gameSlice.reducer;
