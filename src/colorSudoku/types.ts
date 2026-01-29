// Color Sudoku Types

export const GRID_SIZE = 9;
export const BOX_SIZE = 3;

// Color indices 0-8, or null for empty, or 'eraser' for clear mode
export type SudokuColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type SelectedColor = SudokuColorIndex | 'eraser' | null;

// Hint marker positions in cell corners
export type HintPosition = 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right';

// Order for cycling through hint positions
export const HINT_POSITION_ORDER: HintPosition[] = [
  'top-right',
  'top-left',
  'bottom-left',
  'bottom-right',
];

// Difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Individual cell state
export interface SudokuCellState {
  // The filled color (null if empty)
  filledColor: SudokuColorIndex | null;

  // Hint markers (pencil marks) - up to 4 corner positions
  hints: Record<HintPosition, SudokuColorIndex | null>;

  // Is this a pre-filled clue cell? (cannot be edited)
  isClue: boolean;

  // Next hint position to use (cycles through corners)
  nextHintPosition: HintPosition;
}

// Full game state
export interface ColorSudokuState {
  // 9x9 grid of cells (row-major: grid[row][col])
  grid: SudokuCellState[][];

  // The solution for validation
  solution: SudokuColorIndex[][];

  // Currently selected color from palette
  selectedColor: SelectedColor;

  // Currently selected cell position (for keyboard navigation)
  selectedCell: { row: number; col: number } | null;

  // Game status
  isWon: boolean;
  isPaused: boolean;

  // Puzzle metadata
  puzzleSeed: string;
  difficulty: Difficulty;

  // Timer
  startTime: number | null;
  elapsedSeconds: number;

  // Show numbers overlay on cells
  showNumbers: boolean;

  // Last cell filled by hint (for highlight animation)
  lastHintedCell: { row: number; col: number } | null;

  // Undo/Reset support
  history: SudokuCellState[][][]; // Stack of previous grid states (max 50)
  initialGrid: SudokuCellState[][]; // Starting grid for reset
}

// Game actions
export type ColorSudokuAction =
  | { type: 'NEW_GAME'; difficulty: Difficulty; seed?: string }
  | { type: 'SELECT_COLOR'; color: SelectedColor }
  | { type: 'SELECT_CELL'; row: number; col: number }
  | { type: 'FILL_CELL'; row: number; col: number } // Single click/tap
  | { type: 'ADD_HINT'; row: number; col: number } // Double click/tap
  | { type: 'CLEAR_CELL'; row: number; col: number }
  | { type: 'CLEAR_HINTS'; row: number; col: number }
  | { type: 'DESELECT' }
  | { type: 'START_TIMER'; startTime: number }
  | { type: 'UPDATE_TIMER'; elapsedSeconds: number }
  | { type: 'TOGGLE_NUMBERS' }
  | { type: 'CHECK_WIN' }
  | { type: 'USE_HINT' } // Fill one empty cell with correct answer (hard mode only)
  | { type: 'CLEAR_HINTED_CELL' } // Clear the hint highlight
  | { type: 'UNDO' } // Undo last grid change
  | { type: 'RESET' } // Reset puzzle to initial state
  | { type: 'REVEAL_SPECIFIC_CELL'; row: number; col: number; success: boolean }; // Reveal user-selected cell (hard mode)
