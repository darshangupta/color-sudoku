import type { BetType } from '../../baccarat/types';

interface BettingControlsProps {
  balance: number;
  currentBet: { type: BetType; amount: number } | null;
  onPlaceBet: (type: BetType, amount: number) => void;
  onDeal: () => void;
  disabled?: boolean;
}

const BET_AMOUNTS = [10, 25, 50, 100, 500];

export function BettingControls({
  balance,
  currentBet,
  onPlaceBet,
  onDeal,
  disabled = false,
}: BettingControlsProps) {
  const betTypes: { type: BetType; label: string; payout: string }[] = [
    { type: 'player', label: 'Player', payout: '1:1' },
    { type: 'banker', label: 'Banker', payout: '0.95:1' },
    { type: 'tie', label: 'Tie', payout: '8:1' },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl font-bold text-emerald-400">
        Balance: ${balance.toLocaleString()}
      </div>

      {/* Bet Type Selection */}
      <div className="flex gap-3">
        {betTypes.map(({ type, label, payout }) => (
          <button
            key={type}
            onClick={() => onPlaceBet(type, currentBet?.amount || 10)}
            disabled={disabled}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              currentBet?.type === type
                ? 'bg-yellow-500 text-gray-900 scale-105 shadow-lg shadow-yellow-500/30'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div>{label}</div>
            <div className="text-xs opacity-70">{payout}</div>
          </button>
        ))}
      </div>

      {/* Bet Amount Selection */}
      <div className="flex gap-2 flex-wrap justify-center">
        {BET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => currentBet && onPlaceBet(currentBet.type, amount)}
            disabled={disabled || !currentBet || amount > balance}
            className={`w-14 h-14 rounded-full font-bold transition-all ${
              currentBet?.amount === amount
                ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/30'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            } ${disabled || !currentBet || amount > balance ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Current Bet Display */}
      {currentBet && (
        <div className="text-lg text-gray-300">
          Betting <span className="text-yellow-400 font-bold">${currentBet.amount}</span> on{' '}
          <span className="text-yellow-400 font-bold capitalize">{currentBet.type}</span>
        </div>
      )}

      {/* Deal Button */}
      <button
        onClick={onDeal}
        disabled={disabled || !currentBet}
        className={`px-8 py-3 rounded-lg text-xl font-bold transition-all ${
          currentBet && !disabled
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 hover:scale-105'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        Deal
      </button>
    </div>
  );
}
