// SudokuCell - Individual cell with filled color or hint markers

import { memo } from 'react';
import type { SudokuCellState } from '../../colorSudoku/types';
import { SUDOKU_COLORS } from '../../colorSudoku/constants';

interface SudokuCellProps {
  cell: SudokuCellState;
  row: number;
  col: number;
  isSelected: boolean;
  isHinted?: boolean;
  isRevealing?: boolean;
  revealResult?: 'success' | 'fail' | null;
  revealColor?: string; // Hex color to show during success reveal animation
  borderRight: boolean;
  borderBottom: boolean;
  showNumbers: boolean;
  onClick: () => void;
}

function SudokuCellComponent({
  cell,
  isSelected,
  isHinted,
  isRevealing,
  revealResult,
  revealColor,
  borderRight,
  borderBottom,
  showNumbers,
  onClick,
}: SudokuCellProps) {
  const { filledColor, hints, isClue } = cell;

  // Determine cell background
  const getBgColor = () => {
    if (filledColor !== null) {
      return SUDOKU_COLORS[filledColor].hex;
    }
    return 'transparent';
  };

  // Check if any hints exist
  const hasHints =
    hints['top-right'] !== null ||
    hints['top-left'] !== null ||
    hints['bottom-left'] !== null ||
    hints['bottom-right'] !== null;

  // Render a hint marker in corner (absolute positioned, on top of fill)
  const renderCornerHint = (position: keyof typeof hints) => {
    const hintColor = hints[position];
    if (hintColor === null) return null;

    const positionClasses = {
      'top-right': 'top-0 right-0',
      'top-left': 'top-0 left-0',
      'bottom-left': 'bottom-0 left-0',
      'bottom-right': 'bottom-0 right-0',
    };

    return (
      <div
        className={`absolute ${positionClasses[position]} w-3 h-3 rounded-sm border border-white/50 shadow-sm z-20`}
        style={{ backgroundColor: SUDOKU_COLORS[hintColor].hex }}
      />
    );
  };

  return (
    <div
      className={`
        relative aspect-square cursor-pointer
        border border-gray-300
        transition-colors duration-150
        ${borderRight ? 'border-r-[4px] border-r-black' : ''}
        ${borderBottom ? 'border-b-[4px] border-b-black' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}
        ${isHinted && !isRevealing ? 'animate-hint-reveal' : ''}
        ${isRevealing && !revealResult ? 'animate-reveal-gold' : ''}
        ${revealResult === 'success' ? 'animate-reveal-success' : ''}
        ${revealResult === 'fail' ? 'animate-reveal-fail' : ''}
        ${isClue ? 'cursor-not-allowed' : 'hover:bg-gray-100'}
      `}
      style={{
        touchAction: 'manipulation',
        ...(revealResult === 'success' && revealColor ? { backgroundColor: revealColor } : {}),
      }}
      onClick={onClick}
    >
      {/* Background color (filled or empty) - z-10 so hints can be on top */}
      <div
        className={`
          absolute inset-0 z-10
          ${isClue ? 'opacity-100' : filledColor !== null ? 'opacity-90' : ''}
        `}
        style={{ backgroundColor: getBgColor() }}
      >
        {/* Show number when toggled, or clue dot when not */}
        {filledColor !== null && (
          <div className="w-full h-full flex items-center justify-center">
            {showNumbers ? (
              <span className={`font-bold text-2xl ${isClue ? 'text-black' : 'text-white drop-shadow-md'}`}>
                {filledColor + 1}
              </span>
            ) : isClue ? (
              <div className="w-2 h-2 rounded-full bg-white/40" />
            ) : null}
          </div>
        )}
      </div>

      {/* Hint markers - small squares in corners (shown on top of fill) */}
      {hasHints && (
        <>
          {renderCornerHint('top-right')}
          {renderCornerHint('top-left')}
          {renderCornerHint('bottom-left')}
          {renderCornerHint('bottom-right')}
        </>
      )}
    </div>
  );
}

export const SudokuCell = memo(SudokuCellComponent);
