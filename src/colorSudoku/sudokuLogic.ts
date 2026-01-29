// Sudoku Logic - Validation and Win Detection

import {
  GRID_SIZE,
  BOX_SIZE,
  HINT_POSITION_ORDER,
  type SudokuCellState,
  type SudokuColorIndex,
  type HintPosition,
} from './types';

// Create an empty cell state
export function createEmptyCell(): SudokuCellState {
  return {
    filledColor: null,
    hints: {
      'top-right': null,
      'top-left': null,
      'bottom-left': null,
      'bottom-right': null,
    },
    isClue: false,
    nextHintPosition: 'top-right',
  };
}

// Create a clue cell (pre-filled, cannot be edited)
export function createClueCell(color: SudokuColorIndex): SudokuCellState {
  return {
    filledColor: color,
    hints: {
      'top-right': null,
      'top-left': null,
      'bottom-left': null,
      'bottom-right': null,
    },
    isClue: true,
    nextHintPosition: 'top-right',
  };
}

// Initialize grid from puzzle
export function initializeGrid(
  puzzle: (SudokuColorIndex | null)[][]
): SudokuCellState[][] {
  return puzzle.map(row =>
    row.map(cell =>
      cell !== null ? createClueCell(cell) : createEmptyCell()
    )
  );
}

// Get next hint position (cycles through corners)
export function getNextHintPosition(current: HintPosition): HintPosition {
  const currentIndex = HINT_POSITION_ORDER.indexOf(current);
  const nextIndex = (currentIndex + 1) % HINT_POSITION_ORDER.length;
  return HINT_POSITION_ORDER[nextIndex];
}

// Check if a row contains all 9 colors exactly once
function isRowValid(grid: SudokuCellState[][], row: number): boolean {
  const colors = new Set<SudokuColorIndex>();
  for (let col = 0; col < GRID_SIZE; col++) {
    const color = grid[row][col].filledColor;
    if (color === null) return false;
    if (colors.has(color)) return false;
    colors.add(color);
  }
  return colors.size === GRID_SIZE;
}

// Check if a column contains all 9 colors exactly once
function isColumnValid(grid: SudokuCellState[][], col: number): boolean {
  const colors = new Set<SudokuColorIndex>();
  for (let row = 0; row < GRID_SIZE; row++) {
    const color = grid[row][col].filledColor;
    if (color === null) return false;
    if (colors.has(color)) return false;
    colors.add(color);
  }
  return colors.size === GRID_SIZE;
}

// Check if a 3x3 box contains all 9 colors exactly once
function isBoxValid(grid: SudokuCellState[][], boxRow: number, boxCol: number): boolean {
  const colors = new Set<SudokuColorIndex>();
  const startRow = boxRow * BOX_SIZE;
  const startCol = boxCol * BOX_SIZE;

  for (let r = startRow; r < startRow + BOX_SIZE; r++) {
    for (let c = startCol; c < startCol + BOX_SIZE; c++) {
      const color = grid[r][c].filledColor;
      if (color === null) return false;
      if (colors.has(color)) return false;
      colors.add(color);
    }
  }
  return colors.size === GRID_SIZE;
}

// Check if the puzzle is completely and correctly solved
export function checkWin(grid: SudokuCellState[][]): boolean {
  // Check all rows
  for (let row = 0; row < GRID_SIZE; row++) {
    if (!isRowValid(grid, row)) return false;
  }

  // Check all columns
  for (let col = 0; col < GRID_SIZE; col++) {
    if (!isColumnValid(grid, col)) return false;
  }

  // Check all 3x3 boxes
  for (let boxRow = 0; boxRow < BOX_SIZE; boxRow++) {
    for (let boxCol = 0; boxCol < BOX_SIZE; boxCol++) {
      if (!isBoxValid(grid, boxRow, boxCol)) return false;
    }
  }

  return true;
}

// Count filled cells
export function countFilledCells(grid: SudokuCellState[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.filledColor !== null) count++;
    }
  }
  return count;
}

// Count empty cells
export function countEmptyCells(grid: SudokuCellState[][]): number {
  return GRID_SIZE * GRID_SIZE - countFilledCells(grid);
}

// Count how many times each color is used (returns array of 9 counts)
export function countColorUsage(grid: SudokuCellState[][]): number[] {
  const counts = new Array(GRID_SIZE).fill(0);
  for (const row of grid) {
    for (const cell of row) {
      if (cell.filledColor !== null) {
        counts[cell.filledColor]++;
      }
    }
  }
  return counts;
}
