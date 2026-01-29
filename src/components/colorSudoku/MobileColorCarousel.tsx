// MobileColorCarousel - Two-row color picker for mobile (5 colors + 4 colors + eraser)

import { memo } from 'react';
import type { SelectedColor, SudokuColorIndex } from '../../colorSudoku/types';
import { SUDOKU_COLORS } from '../../colorSudoku/constants';

interface MobileColorCarouselProps {
  selectedColor: SelectedColor;
  onSelectColor: (color: SelectedColor) => void;
  showNumbers?: boolean;
  colorUsageCounts?: number[];
}

function MobileColorCarouselComponent({
  selectedColor,
  onSelectColor,
  showNumbers,
  colorUsageCounts,
}: MobileColorCarouselProps) {
  const row1Colors: SudokuColorIndex[] = [0, 1, 2, 3, 4];
  const row2Colors: SudokuColorIndex[] = [5, 6, 7, 8];

  const renderColorButton = (colorIndex: SudokuColorIndex) => {
    const color = SUDOKU_COLORS[colorIndex];
    const isSelected = selectedColor === colorIndex;
    const usageCount = colorUsageCounts?.[colorIndex] ?? 0;
    const isMaxed = usageCount >= 9;
    // Use red ring for blue color (index 5), blue ring for others
    const ringColor = colorIndex === 5 ? 'ring-red-500' : 'ring-blue-500';

    return (
      <button
        key={colorIndex}
        className={`
          aspect-square w-full rounded-lg transition-all duration-200
          flex items-center justify-center relative
          ${isMaxed ? 'cursor-not-allowed' : ''}
          ${isSelected && !isMaxed
            ? `ring-2 ${ringColor} shadow-lg`
            : !isMaxed ? 'shadow-sm' : ''
          }
        `}
        style={{ backgroundColor: color.hex }}
        onClick={() => !isMaxed && onSelectColor(isSelected ? null : colorIndex)}
        aria-label={isMaxed ? `${color.name} complete` : `Select ${color.name}`}
        disabled={isMaxed}
      >
        {/* X overlay for maxed colors */}
        {isMaxed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
            <span className="text-white font-bold text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              ✕
            </span>
          </div>
        )}
        {showNumbers && !isMaxed && (
          <span className="text-white font-bold text-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            {colorIndex + 1}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-200 safe-area-bottom">
      {/* Row 1: 5 colors */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        {row1Colors.map(renderColorButton)}
      </div>

      {/* Row 2: 4 colors + eraser */}
      <div className="grid grid-cols-5 gap-2">
        {row2Colors.map(renderColorButton)}
        <button
          className={`
            aspect-square w-full rounded-lg transition-all duration-200
            flex items-center justify-center
            ${selectedColor === 'eraser'
              ? 'bg-gray-800 text-white ring-2 ring-blue-500'
              : 'bg-gray-100 text-gray-700'
            }
          `}
          onClick={() => onSelectColor(selectedColor === 'eraser' ? null : 'eraser')}
          aria-label="Eraser"
        >
          <span className="text-lg">🧹</span>
        </button>
      </div>

      {/* Hint text */}
      <p className="text-xs text-gray-500 text-center mt-2">
        Tap to fill • Double-tap to add hint
      </p>
    </div>
  );
}

export const MobileColorCarousel = memo(MobileColorCarouselComponent);
