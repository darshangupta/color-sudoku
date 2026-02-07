import { GameResult as GameResultType } from '../../baccarat/types';

interface GameResultProps {
  result: GameResultType;
  payout: number;
  onPlayAgain: () => void;
}

export function GameResult({ result, payout, onPlayAgain }: GameResultProps) {
  const resultText = {
    player: 'Player Wins!',
    banker: 'Banker Wins!',
    tie: "It's a Tie!",
  };

  const isWin = payout > 0;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl p-8 text-center shadow-2xl border border-gray-700 animate-scale-in">
        <h2 className={`text-3xl font-bold mb-4 ${
          isWin ? 'text-yellow-400' : 'text-gray-400'
        }`}>
          {resultText[result]}
        </h2>

        <div className={`text-2xl font-bold mb-6 ${
          isWin ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {isWin ? '+' : ''}{payout >= 0 ? '+' : ''}${Math.abs(payout).toLocaleString()}
        </div>

        <button
          onClick={onPlayAgain}
          className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 rounded-lg text-xl font-bold hover:from-yellow-400 hover:to-orange-400 transition-all hover:scale-105 shadow-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
