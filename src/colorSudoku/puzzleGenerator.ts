// Sudoku Puzzle Generator
// Uses backtracking algorithm with seeded RNG for reproducible puzzles
// Validates each cell removal to ensure puzzles remain logically solvable

import { GRID_SIZE, BOX_SIZE, type SudokuColorIndex, type Difficulty } from './types';
import { DIFFICULTY_CELLS_TO_REMOVE } from './constants';
import { isSolvableWithLogic } from './sudokuSolver';

// Simple seeded random number generator (Mulberry32)
function createSeededRng(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }

  return function () {
    h |= 0;
    h = h + 0x6d2b79f5 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Shuffle array using Fisher-Yates with seeded RNG
function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Check if placing a value at (row, col) is valid
function isValidPlacement(
  grid: (SudokuColorIndex | null)[][],
  row: number,
  col: number,
  value: SudokuColorIndex
): boolean {
  // Check row
  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid[row][c] === value) return false;
  }

  // Check column
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r][col] === value) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if (grid[r][c] === value) return false;
    }
  }

  return true;
}

// Generate a complete valid Sudoku solution using backtracking
function generateCompleteSolution(rng: () => number): SudokuColorIndex[][] {
  const grid: (SudokuColorIndex | null)[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null));

  const values: SudokuColorIndex[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  function solve(pos: number): boolean {
    if (pos === GRID_SIZE * GRID_SIZE) return true;

    const row = Math.floor(pos / GRID_SIZE);
    const col = pos % GRID_SIZE;

    // Shuffle values for variety
    const shuffledValues = shuffleArray(values, rng);

    for (const value of shuffledValues) {
      if (isValidPlacement(grid, row, col, value)) {
        grid[row][col] = value;
        if (solve(pos + 1)) return true;
        grid[row][col] = null;
      }
    }

    return false;
  }

  solve(0);
  return grid as SudokuColorIndex[][];
}

// Remove cells from solution to create puzzle
// Validates each removal to ensure the puzzle remains logically solvable
function createPuzzle(
  solution: SudokuColorIndex[][],
  cellsToRemove: number,
  rng: () => number,
  difficulty: Difficulty
): (SudokuColorIndex | null)[][] {
  const puzzle: (SudokuColorIndex | null)[][] = solution.map(row => [...row]);

  // Create list of all cell positions
  const positions: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      positions.push([r, c]);
    }
  }

  // Shuffle positions
  const shuffledPositions = shuffleArray(positions, rng);

  // Remove cells, validating each removal keeps puzzle logically solvable
  let removed = 0;
  let attempts = 0;
  const maxAttempts = GRID_SIZE * GRID_SIZE; // Don't try more than all cells

  for (const [row, col] of shuffledPositions) {
    if (removed >= cellsToRemove || attempts >= maxAttempts) break;
    attempts++;

    const savedValue = puzzle[row][col];
    puzzle[row][col] = null;

    // Verify the puzzle is still logically solvable
    if (isSolvableWithLogic(puzzle, difficulty)) {
      removed++;
    } else {
      // Restore the cell - removing it would require guessing
      puzzle[row][col] = savedValue;
    }
  }

  return puzzle;
}

// Main export: Generate a Sudoku puzzle with given difficulty
export function generateSudokuPuzzle(
  seed: string,
  difficulty: Difficulty
): {
  solution: SudokuColorIndex[][];
  puzzle: (SudokuColorIndex | null)[][];
} {
  const rng = createSeededRng(seed);
  const solution = generateCompleteSolution(rng);
  const cellsToRemove = DIFFICULTY_CELLS_TO_REMOVE[difficulty];
  const puzzle = createPuzzle(solution, cellsToRemove, rng, difficulty);

  return { solution, puzzle };
}

// Generate a random seed
export function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}
