import { useNavigate } from 'react-router-dom';

export function Menu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-2">
          Genius Square
        </h1>
        <p className="text-gray-400 mb-12">Games Collection</p>

        {/* Game Cards */}
        <div className="flex flex-col gap-4">
          {/* Color Sudoku */}
          <button
            onClick={() => navigate('/sudoku')}
            className="w-full p-6 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex gap-0.5">
                {['#FF0E41', '#09F04A', '#1E91FF'].map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Color Sudoku</h2>
                <p className="text-sm text-purple-200">A colorful twist on the classic puzzle</p>
              </div>
            </div>
          </button>

          {/* Baccarat */}
          <button
            onClick={() => navigate('/baccarat')}
            className="w-full p-6 bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🃏</div>
              <div>
                <h2 className="text-xl font-bold text-white">Baccarat</h2>
                <p className="text-sm text-emerald-200">Classic casino card game</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
