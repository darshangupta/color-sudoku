// ColorSudokuScreen - Main game screen

import { useReducer, useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SudokuBoard } from './SudokuBoard';
import { ColorPalette } from './ColorPalette';
import { MobileColorCarousel } from './MobileColorCarousel';
import { sudokuReducer, createInitialState } from '../../colorSudoku/sudokuReducer';
import { countEmptyCells, countColorUsage } from '../../colorSudoku/sudokuLogic';
import { STORAGE_KEY, DIFFICULTY_LABELS, SUDOKU_COLORS } from '../../colorSudoku/constants';
import type { Difficulty, ColorSudokuState } from '../../colorSudoku/types';
import { useIsMobile } from '../../hooks/useIsMobile';

// Load saved state from localStorage with migration for new fields
function loadSavedState(): ColorSudokuState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved) as ColorSudokuState;

      // Migrate old saved states that don't have history/initialGrid
      if (!state.history) {
        state.history = [];
      }
      if (!state.initialGrid) {
        // Derive initialGrid from current grid - keep only clue cells
        state.initialGrid = state.grid.map(row =>
          row.map(cell => ({
            ...cell,
            // Reset non-clue cells to empty state
            filledColor: cell.isClue ? cell.filledColor : null,
            hints: {
              'top-right': null,
              'top-left': null,
              'bottom-left': null,
              'bottom-right': null,
            },
            nextHintPosition: 'top-right' as const,
          }))
        );
      }

      return state;
    }
  } catch {
    // Invalid saved state
  }
  return null;
}

export function ColorSudokuScreen() {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  // Show difficulty selection on first load or after win
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  // Track if user has an active game (to show X button on difficulty modal)
  const [hasActiveGame, setHasActiveGame] = useState(false);
  // Hint cooldown (2 minute recharge)
  const [hintCooldownEnd, setHintCooldownEnd] = useState<number | null>(null);
  const [hintCooldownRemaining, setHintCooldownRemaining] = useState(0);
  // Reveal mode state (hard mode "Reveal a Square" feature)
  const [isRevealMode, setIsRevealMode] = useState(false);
  const [revealingCell, setRevealingCell] = useState<{ row: number; col: number } | null>(null);
  const [revealResult, setRevealResult] = useState<'success' | 'fail' | null>(null);
  const [revealColor, setRevealColor] = useState<string | undefined>(undefined);
  // Simple feedback message
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Initialize state from localStorage or show difficulty selector
  const [gameState, dispatch] = useReducer(sudokuReducer, null, () => {
    const saved = loadSavedState();
    if (saved && !saved.isWon) {
      setHasActiveGame(true);
      return saved;
    }
    // No valid saved state, show difficulty selector
    setShowDifficultySelect(true);
    return createInitialState('easy');
  });

  // Double-click detection
  const lastClickTimeRef = useRef<number>(0);
  const lastClickCellRef = useRef<string | null>(null);
  const doubleClickedRef = useRef(false);

  // Save state to localStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // Timer effect
  useEffect(() => {
    if (gameState.isWon || showDifficultySelect) return;

    // Start timer if not started
    if (gameState.startTime === null) {
      dispatch({ type: 'START_TIMER', startTime: Date.now() });
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameState.startTime!) / 1000);
      dispatch({ type: 'UPDATE_TIMER', elapsedSeconds: elapsed });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.startTime, gameState.isWon, showDifficultySelect]);

  // Keyboard support for delete/backspace to erase selected cell
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && gameState.selectedCell) {
        e.preventDefault();
        const { row, col } = gameState.selectedCell;
        dispatch({ type: 'CLEAR_CELL', row, col });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.selectedCell]);

  // Show win modal when game is won (but not if difficulty selector is open)
  useEffect(() => {
    if (gameState.isWon && !showWinModal && !showDifficultySelect) {
      // Small delay for dramatic effect
      const timer = setTimeout(() => setShowWinModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isWon, showWinModal, showDifficultySelect]);

  // Handle reveal mode cell tap - 30% success, 70% fail
  const handleRevealCellTap = useCallback(
    (row: number, col: number) => {
      const cell = gameState.grid[row][col];

      // If it's a clue cell, do nothing
      if (cell.isClue) {
        return;
      }

      // If cell is already filled by user, show feedback
      if (cell.filledColor !== null) {
        setFeedbackMessage('Select an empty cell');
        setTimeout(() => setFeedbackMessage(null), 2000);
        return;
      }

      // Valid empty cell - proceed with reveal
      setIsRevealMode(false);
      setRevealingCell({ row, col });

      // After gold animation (500ms), reveal the cell
      setTimeout(() => {
        // Always reveal the correct color
        const correctColorIndex = gameState.solution[row][col];
        setRevealColor(SUDOKU_COLORS[correctColorIndex].hex);
        setRevealResult('success');
        dispatch({ type: 'REVEAL_SPECIFIC_CELL', row, col, success: true });
        // 2 minute cooldown
        setHintCooldownEnd(Date.now() + 2 * 60 * 1000);

        // Clear reveal animation state after animation completes
        setTimeout(() => {
          setRevealingCell(null);
          setRevealResult(null);
          setRevealColor(undefined);
          dispatch({ type: 'CLEAR_HINTED_CELL' });
        }, 600);
      }, 500);
    },
    [gameState.grid, gameState.solution]
  );

  // Handle cell click with double-click detection
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      // If in reveal mode, handle reveal tap instead
      if (isRevealMode) {
        handleRevealCellTap(row, col);
        return;
      }

      const cellKey = `${row}-${col}`;
      const now = Date.now();
      const isDoubleClick =
        lastClickCellRef.current === cellKey && now - lastClickTimeRef.current < 400;

      lastClickTimeRef.current = now;
      lastClickCellRef.current = cellKey;

      // Select the cell
      dispatch({ type: 'SELECT_CELL', row, col });

      if (isDoubleClick) {
        // Mark as double-click to prevent pending fill
        doubleClickedRef.current = true;
        // Double-click: add hint marker
        dispatch({ type: 'ADD_HINT', row, col });
      } else {
        // Reset for new click sequence
        doubleClickedRef.current = false;
        // Single click: fill cell (after small delay to detect double-click)
        setTimeout(() => {
          // Skip fill if a double-click happened
          if (!doubleClickedRef.current && lastClickCellRef.current === cellKey) {
            dispatch({ type: 'FILL_CELL', row, col });
          }
        }, 350);
      }
    },
    [isRevealMode, handleRevealCellTap]
  );

  // Deselect when clicking outside board/palette
  const handleBackgroundClick = useCallback(() => {
    dispatch({ type: 'SELECT_COLOR', color: null });
    dispatch({ type: 'DESELECT' });
  }, []);

  // Start new game with selected difficulty
  const handleStartGame = (difficulty: Difficulty) => {
    dispatch({ type: 'NEW_GAME', difficulty });
    setShowDifficultySelect(false);
    setShowWinModal(false);
    setHasActiveGame(true);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const emptyCells = countEmptyCells(gameState.grid);
  const colorUsageCounts = countColorUsage(gameState.grid);
  const isBoardFull = emptyCells === 0;
  const isIncorrect = isBoardFull && !gameState.isWon;

  // Cooldown timer effect
  useEffect(() => {
    if (!hintCooldownEnd) return;

    const updateCooldown = () => {
      const remaining = Math.max(0, Math.ceil((hintCooldownEnd - Date.now()) / 1000));
      setHintCooldownRemaining(remaining);
      if (remaining === 0) {
        setHintCooldownEnd(null);
      }
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [hintCooldownEnd]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex flex-col"
      onClick={handleBackgroundClick}
    >
      {/* Header */}
      <header className="p-4 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-white/80 backdrop-blur rounded-lg shadow hover:bg-white transition-colors"
        >
          ← Menu
        </button>

        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">Color Sudoku</h1>
          <p className="text-sm text-gray-600">
            {DIFFICULTY_LABELS[gameState.difficulty]} • {emptyCells} remaining
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-gray-800">
            {formatTime(gameState.elapsedSeconds)}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 p-4">
        {/* Desktop: Palette on left */}
        {!isMobile && (
          <div onClick={(e) => e.stopPropagation()}>
            <ColorPalette
              selectedColor={gameState.selectedColor}
              onSelectColor={(color) => dispatch({ type: 'SELECT_COLOR', color })}
              showNumbers={gameState.showNumbers}
              colorUsageCounts={colorUsageCounts}
            />
          </div>
        )}

        {/* Board */}
        <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              width: isMobile ? 'min(95vw, 400px)' : 'min(70vh, 540px)',
              height: isMobile ? 'min(95vw, 400px)' : 'min(70vh, 540px)',
              touchAction: 'manipulation', // Prevent double-tap zoom and reduce mobile tap delay
              transform: 'translateZ(0)', // Force GPU layer to isolate hint animations from layout
            }}
          >
            <SudokuBoard
              grid={gameState.grid}
              selectedCell={gameState.selectedCell}
              showNumbers={gameState.showNumbers}
              onCellClick={handleCellClick}
              lastHintedCell={gameState.lastHintedCell}
              revealingCell={revealingCell}
              revealResult={revealResult}
              revealColor={revealColor}
            />
          </div>

          {/* Incorrect message */}
          {isIncorrect && (
            <div className="bg-red-100 border border-red-300 rounded-lg px-4 py-2 text-center">
              <span className="text-red-700 font-medium">Not quite right!</span>
              <span className="text-red-600 text-sm ml-2">Keep trying</span>
            </div>
          )}

          {/* Feedback message */}
          {feedbackMessage && (
            <div className="bg-amber-100 border border-amber-300 rounded-lg px-4 py-2 text-center">
              <span className="text-amber-800 font-medium">{feedbackMessage}</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_NUMBERS' })}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                gameState.showNumbers
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
            >
              {gameState.showNumbers ? 'Hide #' : 'Show #'}
            </button>

            {/* Undo button */}
            <button
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={gameState.history.length === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                gameState.history.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
              }`}
              title={gameState.history.length === 0 ? 'Nothing to undo' : 'Undo last action'}
            >
              ↩ Undo
            </button>

            {/* Reset button */}
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="px-4 py-2 bg-white/80 text-gray-700 rounded-lg font-medium hover:bg-white transition-colors"
              title="Reset puzzle to start"
            >
              🔄 Reset
            </button>

            {/* Reveal button - hard mode only */}
            {gameState.difficulty === 'hard' && (
              <button
                onClick={() => {
                  if (hintCooldownRemaining > 0 || revealingCell) return;
                  setIsRevealMode(true);
                }}
                disabled={hintCooldownRemaining > 0 || !!revealingCell}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  hintCooldownRemaining > 0 || revealingCell
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isRevealMode
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {hintCooldownRemaining > 0
                  ? `Reveal (${Math.floor(hintCooldownRemaining / 60)}:${(hintCooldownRemaining % 60).toString().padStart(2, '0')})`
                  : isRevealMode
                    ? 'Tap a cell...'
                    : '🔍 Reveal a Square'}
              </button>
            )}

            <button
              onClick={() => setShowDifficultySelect(true)}
              className="px-4 py-2 bg-white/80 text-gray-700 rounded-lg font-medium hover:bg-white transition-colors"
            >
              New Game
            </button>
          </div>
        </div>
      </main>

      {/* Mobile: Carousel at bottom */}
      {isMobile && (
        <div className="sticky bottom-0 px-4 pb-4" onClick={(e) => e.stopPropagation()}>
          <MobileColorCarousel
            selectedColor={gameState.selectedColor}
            onSelectColor={(color) => dispatch({ type: 'SELECT_COLOR', color })}
            showNumbers={gameState.showNumbers}
            colorUsageCounts={colorUsageCounts}
          />
        </div>
      )}

      {/* Difficulty Selection Modal */}
      {showDifficultySelect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative">
            {/* X button - only show if user has an active game */}
            {hasActiveGame && (
              <button
                onClick={() => setShowDifficultySelect(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Color Sudoku
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Fill the grid so each row, column, and 3×3 box contains all 9 colors
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleStartGame('easy')}
                className="w-full py-3 px-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
              >
                Easy
                <span className="block text-sm font-normal opacity-80">46 clues given</span>
              </button>

              <button
                onClick={() => handleStartGame('medium')}
                className="w-full py-3 px-4 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 transition-colors"
              >
                Medium
                <span className="block text-sm font-normal opacity-80">36 clues given</span>
              </button>

              <button
                onClick={() => handleStartGame('hard')}
                className="w-full py-3 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Hard
                <span className="block text-sm font-normal opacity-80">26 clues given</span>
              </button>
            </div>

            {/* Back to menu option */}
            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Win Modal */}
      {showWinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Puzzle Complete!
            </h2>
            <p className="text-gray-600 mb-2">
              {DIFFICULTY_LABELS[gameState.difficulty]} difficulty
            </p>
            <p className="text-3xl font-mono font-bold text-purple-600 mb-6">
              {formatTime(gameState.elapsedSeconds)}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowWinModal(false);
                  setShowDifficultySelect(true);
                }}
                className="w-full py-3 px-4 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 transition-colors"
              >
                Play Again
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
