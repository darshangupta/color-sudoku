// Sudoku Solver using Constraint Propagation
// Implements logical solving techniques without guessing/backtracking

import { GRID_SIZE, BOX_SIZE, type SudokuColorIndex, type Difficulty } from './types';

// All possible values for a Sudoku cell
const ALL_VALUES: Set<SudokuColorIndex> = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]);

// Candidates grid: each cell has a set of possible values
type CandidatesGrid = Set<SudokuColorIndex>[][];

// Result of a solving step
interface SolveStepResult {
  progress: boolean; // Did we make any progress?
  solved: boolean;   // Is the puzzle fully solved?
  invalid: boolean;  // Is the puzzle in an invalid state?
}

// Initialize candidates grid from a puzzle
function initializeCandidates(puzzle: (SudokuColorIndex | null)[][]): CandidatesGrid {
  const candidates: CandidatesGrid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null).map(() => new Set<SudokuColorIndex>()));

  // First pass: set filled cells to single candidate, empty to all
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = puzzle[row][col];
      if (value !== null) {
        candidates[row][col] = new Set([value]);
      } else {
        candidates[row][col] = new Set(ALL_VALUES);
      }
    }
  }

  // Second pass: eliminate based on existing filled cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const value = puzzle[row][col];
      if (value !== null) {
        eliminateFromPeers(candidates, row, col, value);
      }
    }
  }

  return candidates;
}

// Get all peer positions (same row, column, or box)
function getPeerPositions(row: number, col: number): [number, number][] {
  const peers: [number, number][] = [];

  // Same row
  for (let c = 0; c < GRID_SIZE; c++) {
    if (c !== col) peers.push([row, c]);
  }

  // Same column
  for (let r = 0; r < GRID_SIZE; r++) {
    if (r !== row) peers.push([r, col]);
  }

  // Same box (avoid duplicates from row/col)
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if (r !== row && c !== col) {
        peers.push([r, c]);
      }
    }
  }

  return peers;
}

// Eliminate a value from all peers of a cell
function eliminateFromPeers(
  candidates: CandidatesGrid,
  row: number,
  col: number,
  value: SudokuColorIndex
): void {
  for (const [r, c] of getPeerPositions(row, col)) {
    candidates[r][c].delete(value);
  }
}

// Check if puzzle is solved (all cells have exactly one candidate)
function isSolved(candidates: CandidatesGrid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (candidates[row][col].size !== 1) return false;
    }
  }
  return true;
}

// Check if puzzle is in invalid state (any cell has no candidates)
function isInvalid(candidates: CandidatesGrid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (candidates[row][col].size === 0) return true;
    }
  }
  return false;
}

// Technique 1: Naked Singles
// If a cell has only one candidate, fill it and eliminate from peers
function applyNakedSingles(candidates: CandidatesGrid): boolean {
  let progress = false;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (candidates[row][col].size === 1) {
        const value = [...candidates[row][col]][0];
        // Check if any peer still has this value (meaning we need to eliminate)
        for (const [r, c] of getPeerPositions(row, col)) {
          if (candidates[r][c].has(value)) {
            candidates[r][c].delete(value);
            progress = true;
          }
        }
      }
    }
  }

  return progress;
}

// Technique 2: Hidden Singles
// If a value can only go in one cell within a row/col/box, fill it
function applyHiddenSingles(candidates: CandidatesGrid): boolean {
  let progress = false;

  // Check rows
  for (let row = 0; row < GRID_SIZE; row++) {
    for (const value of ALL_VALUES) {
      const possibleCols: number[] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        if (candidates[row][col].has(value)) {
          possibleCols.push(col);
        }
      }
      if (possibleCols.length === 1) {
        const col = possibleCols[0];
        if (candidates[row][col].size > 1) {
          candidates[row][col] = new Set([value]);
          eliminateFromPeers(candidates, row, col, value);
          progress = true;
        }
      }
    }
  }

  // Check columns
  for (let col = 0; col < GRID_SIZE; col++) {
    for (const value of ALL_VALUES) {
      const possibleRows: number[] = [];
      for (let row = 0; row < GRID_SIZE; row++) {
        if (candidates[row][col].has(value)) {
          possibleRows.push(row);
        }
      }
      if (possibleRows.length === 1) {
        const row = possibleRows[0];
        if (candidates[row][col].size > 1) {
          candidates[row][col] = new Set([value]);
          eliminateFromPeers(candidates, row, col, value);
          progress = true;
        }
      }
    }
  }

  // Check boxes
  for (let boxRow = 0; boxRow < GRID_SIZE; boxRow += BOX_SIZE) {
    for (let boxCol = 0; boxCol < GRID_SIZE; boxCol += BOX_SIZE) {
      for (const value of ALL_VALUES) {
        const possiblePositions: [number, number][] = [];
        for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
          for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
            if (candidates[r][c].has(value)) {
              possiblePositions.push([r, c]);
            }
          }
        }
        if (possiblePositions.length === 1) {
          const [row, col] = possiblePositions[0];
          if (candidates[row][col].size > 1) {
            candidates[row][col] = new Set([value]);
            eliminateFromPeers(candidates, row, col, value);
            progress = true;
          }
        }
      }
    }
  }

  return progress;
}

// Helper: Get cells in a unit (row, column, or box)
type Unit = { type: 'row' | 'col' | 'box'; positions: [number, number][] };

function getAllUnits(): Unit[] {
  const units: Unit[] = [];

  // Rows
  for (let row = 0; row < GRID_SIZE; row++) {
    const positions: [number, number][] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      positions.push([row, col]);
    }
    units.push({ type: 'row', positions });
  }

  // Columns
  for (let col = 0; col < GRID_SIZE; col++) {
    const positions: [number, number][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      positions.push([row, col]);
    }
    units.push({ type: 'col', positions });
  }

  // Boxes
  for (let boxRow = 0; boxRow < GRID_SIZE; boxRow += BOX_SIZE) {
    for (let boxCol = 0; boxCol < GRID_SIZE; boxCol += BOX_SIZE) {
      const positions: [number, number][] = [];
      for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
        for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
          positions.push([r, c]);
        }
      }
      units.push({ type: 'box', positions });
    }
  }

  return units;
}

// Technique 3: Naked Pairs
// If two cells in a unit have exactly the same two candidates,
// eliminate those candidates from other cells in the unit
function applyNakedPairs(candidates: CandidatesGrid): boolean {
  let progress = false;

  for (const unit of getAllUnits()) {
    // Find cells with exactly 2 candidates
    const pairCells: { pos: [number, number]; cands: Set<SudokuColorIndex> }[] = [];
    for (const [row, col] of unit.positions) {
      if (candidates[row][col].size === 2) {
        pairCells.push({ pos: [row, col], cands: candidates[row][col] });
      }
    }

    // Check for matching pairs
    for (let i = 0; i < pairCells.length; i++) {
      for (let j = i + 1; j < pairCells.length; j++) {
        const set1 = pairCells[i].cands;
        const set2 = pairCells[j].cands;

        // Check if sets are equal
        if (set1.size === set2.size && [...set1].every(v => set2.has(v))) {
          const pairValues = [...set1];
          const [pos1Row, pos1Col] = pairCells[i].pos;
          const [pos2Row, pos2Col] = pairCells[j].pos;

          // Eliminate from other cells in unit
          for (const [row, col] of unit.positions) {
            if ((row !== pos1Row || col !== pos1Col) &&
                (row !== pos2Row || col !== pos2Col)) {
              for (const value of pairValues) {
                if (candidates[row][col].has(value)) {
                  candidates[row][col].delete(value);
                  progress = true;
                }
              }
            }
          }
        }
      }
    }
  }

  return progress;
}

// Technique 4: Hidden Pairs
// If two values can only go in two cells within a unit,
// remove all other candidates from those two cells
function applyHiddenPairs(candidates: CandidatesGrid): boolean {
  let progress = false;

  for (const unit of getAllUnits()) {
    // For each pair of values
    const values = [...ALL_VALUES];
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        const v1 = values[i];
        const v2 = values[j];

        // Find cells that can contain v1 or v2
        const cellsForV1: [number, number][] = [];
        const cellsForV2: [number, number][] = [];

        for (const [row, col] of unit.positions) {
          if (candidates[row][col].has(v1)) cellsForV1.push([row, col]);
          if (candidates[row][col].has(v2)) cellsForV2.push([row, col]);
        }

        // Check if both values appear in exactly 2 cells, and they're the same cells
        if (cellsForV1.length === 2 && cellsForV2.length === 2) {
          const samePositions =
            cellsForV1[0][0] === cellsForV2[0][0] &&
            cellsForV1[0][1] === cellsForV2[0][1] &&
            cellsForV1[1][0] === cellsForV2[1][0] &&
            cellsForV1[1][1] === cellsForV2[1][1];

          if (samePositions) {
            // Remove all other candidates from these two cells
            for (const [row, col] of cellsForV1) {
              const originalSize = candidates[row][col].size;
              if (originalSize > 2) {
                candidates[row][col] = new Set([v1, v2]);
                progress = true;
              }
            }
          }
        }
      }
    }
  }

  return progress;
}

// Main solving loop: apply techniques until no more progress
function solveWithLogic(candidates: CandidatesGrid): SolveStepResult {
  let madeProgress = true;

  while (madeProgress) {
    madeProgress = false;

    // Check for invalid state first
    if (isInvalid(candidates)) {
      return { progress: false, solved: false, invalid: true };
    }

    // Check if solved
    if (isSolved(candidates)) {
      return { progress: true, solved: true, invalid: false };
    }

    // Apply techniques in order of simplicity
    if (applyNakedSingles(candidates)) {
      madeProgress = true;
      continue;
    }

    if (applyHiddenSingles(candidates)) {
      madeProgress = true;
      continue;
    }

    if (applyNakedPairs(candidates)) {
      madeProgress = true;
      continue;
    }

    if (applyHiddenPairs(candidates)) {
      madeProgress = true;
      continue;
    }
  }

  // If we get here, we're stuck (can't solve without guessing)
  return { progress: false, solved: isSolved(candidates), invalid: isInvalid(candidates) };
}

// Deep clone a candidates grid
function cloneCandidates(candidates: CandidatesGrid): CandidatesGrid {
  return candidates.map(row => row.map(cell => new Set(cell)));
}

/**
 * Check if a puzzle can be solved using only logical techniques (no guessing)
 * @param puzzle The puzzle grid with null for empty cells
 * @param _difficulty Optional difficulty level (not currently used, reserved for future)
 * @returns true if the puzzle can be solved logically, false if it requires guessing
 */
export function isSolvableWithLogic(
  puzzle: (SudokuColorIndex | null)[][],
  _difficulty?: Difficulty
): boolean {
  const candidates = initializeCandidates(puzzle);
  const result = solveWithLogic(candidates);
  return result.solved && !result.invalid;
}

/**
 * Attempt to solve a puzzle using logical techniques
 * @param puzzle The puzzle grid with null for empty cells
 * @returns The solved grid if successful, or null if it requires guessing
 */
export function solveLogically(
  puzzle: (SudokuColorIndex | null)[][]
): SudokuColorIndex[][] | null {
  const candidates = initializeCandidates(puzzle);
  const result = solveWithLogic(candidates);

  if (!result.solved || result.invalid) {
    return null;
  }

  // Convert candidates back to grid
  const solution: SudokuColorIndex[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0));

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      solution[row][col] = [...candidates[row][col]][0];
    }
  }

  return solution;
}

// Export internals for testing
export const __testing = {
  initializeCandidates,
  applyNakedSingles,
  applyHiddenSingles,
  applyNakedPairs,
  applyHiddenPairs,
  solveWithLogic,
  cloneCandidates,
  isSolved,
  isInvalid,
  getPeerPositions,
};
