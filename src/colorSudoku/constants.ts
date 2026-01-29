// Color Sudoku Constants

import type { Difficulty } from './types';

// 9 vibrant high-contrast colors for Sudoku
export const SUDOKU_COLORS: { hex: string; name: string }[] = [
  { hex: '#FF0E41', name: 'Red' },      // 0
  { hex: '#FF510B', name: 'Orange' },   // 1
  { hex: '#FFCA09', name: 'Amber' },    // 2
  { hex: '#09F04A', name: 'Green' },    // 3
  { hex: '#12FFD1', name: 'Cyan' },     // 4
  { hex: '#1E91FF', name: 'Blue' },     // 5
  { hex: '#540FFF', name: 'Indigo' },   // 6
  { hex: '#CB0EFF', name: 'Magenta' },  // 7
  { hex: '#FF0EBC', name: 'Pink' },     // 8
];

// Number of cells to remove based on difficulty
// Higher = more empty cells = harder puzzle
export const DIFFICULTY_CELLS_TO_REMOVE: Record<Difficulty, number> = {
  easy: 35,   // ~35 empty cells (46 clues)
  medium: 45, // ~45 empty cells (36 clues)
  hard: 55,   // ~55 empty cells (26 clues)
};

// Difficulty display names
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

// localStorage key for saving game state
export const STORAGE_KEY = 'color-sudoku-game-state';
