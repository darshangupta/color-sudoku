import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu } from './pages/Menu';
import { ColorSudokuScreen } from './components/colorSudoku/ColorSudokuScreen';
import { BaccaratScreen } from './components/baccarat/BaccaratScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/sudoku" element={<ColorSudokuScreen />} />
        <Route path="/play" element={<ColorSudokuScreen />} />
        <Route path="/baccarat" element={<BaccaratScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
