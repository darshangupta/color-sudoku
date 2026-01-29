import { useNavigate } from 'react-router-dom';

export function Menu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Color Sudoku
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-8">
          A colorful twist on the classic puzzle
        </p>

        {/* Color preview - 9 colors in a row */}
        <div className="flex justify-center gap-1 mb-8">
          {[
            '#FF0E41', '#FF510B', '#FFCA09',
            '#09F04A', '#12FFD1', '#1E91FF',
            '#540FFF', '#CB0EFF', '#FF0EBC'
          ].map((color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-md shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Play button */}
        <button
          onClick={() => navigate('/play')}
          className="w-full py-4 px-8 bg-purple-500 text-white text-xl font-semibold rounded-xl shadow-lg hover:bg-purple-600 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          Play
        </button>

        {/* How to play */}
        <p className="mt-8 text-sm text-gray-500">
          Fill each row, column, and 3×3 box with all 9 colors
        </p>
      </div>
    </div>
  );
}
