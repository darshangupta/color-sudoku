import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu } from './pages/Menu';
import { ColorSudokuScreen } from './components/colorSudoku/ColorSudokuScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/play" element={<ColorSudokuScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
