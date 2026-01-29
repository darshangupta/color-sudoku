// Color Sudoku Reducer - Pure state management

import type {
  ColorSudokuState,
  ColorSudokuAction,
  SudokuColorIndex,
  SudokuCellState,
  Difficulty,
} from './types';
import { generateSudokuPuzzle, generateRandomSeed } from './puzzleGenerator';
import {
  initializeGrid,
  checkWin,
  getNextHintPosition,
  createEmptyCell,
} from './sudokuLogic';

// Maximum history size to prevent memory issues
const MAX_HISTORY_SIZE = 50;

// Deep clone grid for history storage
function cloneGrid(grid: SudokuCellState[][]): SudokuCellState[][] {
  return grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      hints: { ...cell.hints },
    }))
  );
}

// Add current grid to history stack (with size limit)
function pushHistory(
  history: SudokuCellState[][][],
  grid: SudokuCellState[][]
): SudokuCellState[][][] {
  const newHistory = [...history, cloneGrid(grid)];
  // Limit history size to prevent memory issues
  if (newHistory.length > MAX_HISTORY_SIZE) {
    return newHistory.slice(-MAX_HISTORY_SIZE);
  }
  return newHistory;
}

// Create initial state for a new game
export function createInitialState(
  difficulty: Difficulty = 'easy',
  seed?: string
): ColorSudokuState {
  const puzzleSeed = seed || generateRandomSeed();
  const { solution, puzzle } = generateSudokuPuzzle(puzzleSeed, difficulty);
  const initialGrid = initializeGrid(puzzle);

  return {
    grid: cloneGrid(initialGrid),
    solution: solution,
    selectedColor: null,
    selectedCell: null,
    isWon: false,
    isPaused: false,
    puzzleSeed,
    difficulty,
    startTime: null,
    elapsedSeconds: 0,
    showNumbers: false,
    lastHintedCell: null,
    history: [],
    initialGrid: initialGrid,
  };
}

// Main reducer function
export function sudokuReducer(
  state: ColorSudokuState,
  action: ColorSudokuAction
): ColorSudokuState {
  switch (action.type) {
    case 'NEW_GAME': {
      return createInitialState(action.difficulty, action.seed);
    }

    case 'SELECT_COLOR': {
      return {
        ...state,
        selectedColor: action.color,
      };
    }

    case 'SELECT_CELL': {
      return {
        ...state,
        selectedCell: { row: action.row, col: action.col },
      };
    }

    case 'FILL_CELL': {
      const { row, col } = action;
      const cell = state.grid[row][col];

      // Cannot modify clue cells
      if (cell.isClue) return state;

      // If eraser is selected, clear the cell and hints
      if (state.selectedColor === 'eraser') {
        // Don't save history if cell is already empty (no color and no hints)
        const hasHints =
          cell.hints['top-right'] !== null ||
          cell.hints['top-left'] !== null ||
          cell.hints['bottom-left'] !== null ||
          cell.hints['bottom-right'] !== null;
        if (cell.filledColor === null && !hasHints) return state;

        const newGrid = state.grid.map((r, ri) =>
          r.map((c, ci) => {
            if (ri === row && ci === col) {
              return {
                ...c,
                filledColor: null,
                hints: {
                  'top-right': null,
                  'top-left': null,
                  'bottom-left': null,
                  'bottom-right': null,
                },
                nextHintPosition: 'top-right' as const,
              };
            }
            return c;
          })
        );

        return {
          ...state,
          grid: newGrid,
          history: pushHistory(state.history, state.grid),
        };
      }

      // If no color selected, do nothing
      if (state.selectedColor === null) return state;

      const color = state.selectedColor as SudokuColorIndex;

      // Don't save history if color is the same
      if (cell.filledColor === color) return state;

      // Fill the cell with selected color and clear any existing hints
      const newGrid = state.grid.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            return {
              ...c,
              filledColor: color,
              hints: {
                'top-right': null,
                'top-left': null,
                'bottom-left': null,
                'bottom-right': null,
              },
              nextHintPosition: 'top-right' as const,
            };
          }
          return c;
        })
      );

      // Check for win
      const isWon = checkWin(newGrid);

      return {
        ...state,
        grid: newGrid,
        isWon,
        history: pushHistory(state.history, state.grid),
      };
    }

    case 'ADD_HINT': {
      const { row, col } = action;
      const cell = state.grid[row][col];

      // Cannot modify clue cells
      if (cell.isClue) return state;

      // Cannot add hints to cells that already have a color
      if (cell.filledColor !== null) return state;

      // If eraser is selected, clear all hints
      if (state.selectedColor === 'eraser') {
        // Check if there are any hints to clear
        const hasHints =
          cell.hints['top-right'] !== null ||
          cell.hints['top-left'] !== null ||
          cell.hints['bottom-left'] !== null ||
          cell.hints['bottom-right'] !== null;
        if (!hasHints) return state;

        const newGrid = state.grid.map((r, ri) =>
          r.map((c, ci) => {
            if (ri === row && ci === col) {
              return {
                ...c,
                hints: {
                  'top-right': null,
                  'top-left': null,
                  'bottom-left': null,
                  'bottom-right': null,
                },
                nextHintPosition: 'top-right' as const,
              };
            }
            return c;
          })
        );

        return {
          ...state,
          grid: newGrid,
          history: pushHistory(state.history, state.grid),
        };
      }

      // If no color selected, do nothing
      if (state.selectedColor === null) return state;

      const color = state.selectedColor as SudokuColorIndex;

      // Check if this color already exists in any hint position
      const existingHints = Object.values(cell.hints);
      if (existingHints.includes(color)) {
        return state; // Don't add duplicate
      }

      // Add hint to next position
      const newGrid = state.grid.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            const newHints = { ...c.hints };
            newHints[c.nextHintPosition] = color;

            return {
              ...c,
              hints: newHints,
              nextHintPosition: getNextHintPosition(c.nextHintPosition),
            };
          }
          return c;
        })
      );

      return {
        ...state,
        grid: newGrid,
        history: pushHistory(state.history, state.grid),
      };
    }

    case 'CLEAR_CELL': {
      const { row, col } = action;
      const cell = state.grid[row][col];

      // Cannot modify clue cells
      if (cell.isClue) return state;

      // Check if cell is already empty (no color, no hints)
      const hasHints =
        cell.hints['top-right'] !== null ||
        cell.hints['top-left'] !== null ||
        cell.hints['bottom-left'] !== null ||
        cell.hints['bottom-right'] !== null;
      if (cell.filledColor === null && !hasHints) return state;

      const newGrid = state.grid.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            return createEmptyCell();
          }
          return c;
        })
      );

      return {
        ...state,
        grid: newGrid,
        history: pushHistory(state.history, state.grid),
      };
    }

    case 'CLEAR_HINTS': {
      const { row, col } = action;
      const cell = state.grid[row][col];

      // Cannot modify clue cells
      if (cell.isClue) return state;

      // Check if there are any hints to clear
      const hasHints =
        cell.hints['top-right'] !== null ||
        cell.hints['top-left'] !== null ||
        cell.hints['bottom-left'] !== null ||
        cell.hints['bottom-right'] !== null;
      if (!hasHints) return state;

      const newGrid = state.grid.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            return {
              ...c,
              hints: {
                'top-right': null,
                'top-left': null,
                'bottom-left': null,
                'bottom-right': null,
              },
              nextHintPosition: 'top-right' as const,
            };
          }
          return c;
        })
      );

      return {
        ...state,
        grid: newGrid,
        history: pushHistory(state.history, state.grid),
      };
    }

    case 'DESELECT': {
      return {
        ...state,
        selectedCell: null,
      };
    }

    case 'START_TIMER': {
      return {
        ...state,
        startTime: action.startTime,
      };
    }

    case 'UPDATE_TIMER': {
      return {
        ...state,
        elapsedSeconds: action.elapsedSeconds,
      };
    }

    case 'TOGGLE_NUMBERS': {
      return {
        ...state,
        showNumbers: !state.showNumbers,
      };
    }

    case 'CHECK_WIN': {
      return {
        ...state,
        isWon: checkWin(state.grid),
      };
    }

    case 'USE_HINT': {
      // Find all empty (non-clue, unfilled) cells
      const emptyCells: { row: number; col: number }[] = [];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const cell = state.grid[row][col];
          if (!cell.isClue && cell.filledColor === null) {
            emptyCells.push({ row, col });
          }
        }
      }

      // No empty cells to fill
      if (emptyCells.length === 0) return state;

      // Pick a random empty cell
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const { row, col } = emptyCells[randomIndex];
      const correctColor = state.solution[row][col];

      // Fill the cell as a clue (immutable)
      const newGrid = state.grid.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            return {
              ...c,
              filledColor: correctColor,
              isClue: true, // Make it immutable like initial clues
              hints: {
                'top-right': null,
                'top-left': null,
                'bottom-left': null,
                'bottom-right': null,
              },
              nextHintPosition: 'top-right' as const,
            };
          }
          return c;
        })
      );

      // Check for win
      const isWon = checkWin(newGrid);

      return {
        ...state,
        grid: newGrid,
        isWon,
        lastHintedCell: { row, col },
        history: pushHistory(state.history, state.grid),
      };
    }

    case 'UNDO': {
      // No history to undo
      if (state.history.length === 0) return state;

      // Pop the last grid from history
      const newHistory = [...state.history];
      const previousGrid = newHistory.pop()!;

      return {
        ...state,
        grid: previousGrid,
        history: newHistory,
        isWon: false, // Can't be won if we're undoing
        lastHintedCell: null, // Clear hint highlight to avoid stale UI state
      };
    }

    case 'RESET': {
      // Reset grid to initial state, clear history
      return {
        ...state,
        grid: cloneGrid(state.initialGrid),
        history: [],
        isWon: false,
        selectedCell: null,
        lastHintedCell: null,
      };
    }

    case 'CLEAR_HINTED_CELL': {
      return {
        ...state,
        lastHintedCell: null,
      };
    }

    case 'REVEAL_SPECIFIC_CELL': {
      const { row, col, success } = action;
      const cell = state.grid[row][col];

      // Cannot reveal clue cells
      if (cell.isClue) return state;

      // Cannot reveal cells already filled by user
      if (cell.filledColor !== null) return state;

      // If fail, don't change the grid (animation handled in UI)
      if (!success) {
        return {
          ...state,
          lastHintedCell: { row, col },
        };
      }

      // Success: fill with correct color and mark as clue
      const correctColor = state.solution[row][col];
      const newGrid = state.grid.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            return {
              ...c,
              filledColor: correctColor,
              isClue: true,
              hints: {
                'top-right': null,
                'top-left': null,
                'bottom-left': null,
                'bottom-right': null,
              },
              nextHintPosition: 'top-right' as const,
            };
          }
          return c;
        })
      );

      // Check for win
      const isWon = checkWin(newGrid);

      return {
        ...state,
        grid: newGrid,
        isWon,
        lastHintedCell: { row, col },
        history: pushHistory(state.history, state.grid),
      };
    }

    default:
      return state;
  }
}
