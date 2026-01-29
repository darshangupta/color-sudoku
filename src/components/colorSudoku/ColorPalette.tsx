// ColorPalette - Desktop color selection sidebar (like PieceTray)

import { memo } from 'react';
import type { SelectedColor, SudokuColorIndex } from '../../colorSudoku/types';
import { SUDOKU_COLORS } from '../../colorSudoku/constants';

interface ColorPaletteProps {
  selectedColor: SelectedColor;
  onSelectColor: (color: SelectedColor) => void;
  showNumbers?: boolean;
  colorUsageCounts?: number[];
}

function ColorPaletteComponent({
  selectedColor,
  onSelectColor,
  showNumbers,
  colorUsageCounts,
}: ColorPaletteProps) {
  const colors: SudokuColorIndex[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-48">
      <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">Colors</h3>

      {/* Color grid - 3x3 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {colors.map((colorIndex) => {
          const color = SUDOKU_COLORS[colorIndex];
          const isSelected = selectedColor === colorIndex;
          const usageCount = colorUsageCounts?.[colorIndex] ?? 0;
          const isMaxed = usageCount >= 9;

          return (
            <button
              key={colorIndex}
              className={`
                aspect-square rounded-lg transition-all duration-200
                flex items-center justify-center relative
                ${isMaxed ? 'cursor-not-allowed' : ''}
                ${isSelected && !isMaxed
                  ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-lg'
                  : !isMaxed ? 'hover:scale-105 hover:shadow-md' : ''
                }
              `}
              style={{ backgroundColor: color.hex }}
              onClick={() => !isMaxed && onSelectColor(isSelected ? null : colorIndex)}
              title={isMaxed ? `${color.name} (complete)` : color.name}
              aria-label={isMaxed ? `${color.name} complete` : `Select ${color.name}`}
              disabled={isMaxed}
            >
              {/* X overlay for maxed colors */}
              {isMaxed && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <span className="text-white font-bold text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
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
        })}
      </div>

      {/* Eraser button */}
      <button
        className={`
          w-full py-2 px-4 rounded-lg font-medium transition-all duration-200
          flex items-center justify-center gap-2
          ${selectedColor === 'eraser'
            ? 'bg-gray-800 text-white ring-2 ring-blue-500 ring-offset-2'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
        onClick={() => onSelectColor(selectedColor === 'eraser' ? null : 'eraser')}
      >
        <span className="text-lg">🧹</span>
        <span>Eraser</span>
      </button>

      {/* Selected color indicator */}
      {selectedColor !== null && selectedColor !== 'eraser' && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Selected: <span className="font-semibold">{SUDOKU_COLORS[selectedColor].name}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export const ColorPalette = memo(ColorPaletteComponent);
