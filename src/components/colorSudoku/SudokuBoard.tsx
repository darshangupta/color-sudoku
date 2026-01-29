// SudokuBoard - 9x9 grid with 3x3 box borders

import { memo } from 'react';
import { SudokuCell } from './SudokuCell';
import type { SudokuCellState } from '../../colorSudoku/types';
import { GRID_SIZE, BOX_SIZE } from '../../colorSudoku/types';

interface SudokuBoardProps {
  grid: SudokuCellState[][];
  selectedCell: { row: number; col: number } | null;
  showNumbers: boolean;
  onCellClick: (row: number, col: number) => void;
  lastHintedCell?: { row: number; col: number } | null;
  revealingCell?: { row: number; col: number } | null;
  revealResult?: 'success' | 'fail' | null;
  revealColor?: string;
}

function SudokuBoardComponent({
  grid,
  selectedCell,
  showNumbers,
  onCellClick,
  lastHintedCell,
  revealingCell,
  revealResult,
  revealColor,
}: SudokuBoardProps) {
  return (
    <div className="w-full h-full border-[4px] border-black rounded-lg overflow-hidden bg-white shadow-xl">
      <div
        className="grid w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // Thicker borders for 3x3 box separation
            const borderRight =
              (colIndex + 1) % BOX_SIZE === 0 && colIndex < GRID_SIZE - 1;
            const borderBottom =
              (rowIndex + 1) % BOX_SIZE === 0 && rowIndex < GRID_SIZE - 1;

            const isSelected =
              selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isHinted =
              lastHintedCell?.row === rowIndex && lastHintedCell?.col === colIndex;
            const isRevealing =
              revealingCell?.row === rowIndex && revealingCell?.col === colIndex;

            return (
              <SudokuCell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                isSelected={isSelected}
                isHinted={isHinted}
                isRevealing={isRevealing}
                revealResult={isRevealing ? revealResult : null}
                revealColor={isRevealing ? revealColor : undefined}
                borderRight={borderRight}
                borderBottom={borderBottom}
                showNumbers={showNumbers}
                onClick={() => onCellClick(rowIndex, colIndex)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export const SudokuBoard = memo(SudokuBoardComponent);
