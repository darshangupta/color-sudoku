import type { Card as CardType } from '../../baccarat/types';

interface CardProps {
  card: CardType;
  hidden?: boolean;
  delay?: number;
}

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

export function Card({ card, hidden = false, delay = 0 }: CardProps) {
  if (hidden) {
    return (
      <div
        className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg bg-gradient-to-br from-blue-800 to-blue-900 border-2 border-blue-700 shadow-lg animate-deal-card"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-10 h-14 sm:w-12 sm:h-16 rounded border-2 border-blue-600 bg-blue-700/50" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg bg-white border border-gray-300 shadow-lg flex flex-col p-1.5 animate-deal-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`text-sm sm:text-base font-bold ${suitColors[card.suit]}`}>
        {card.rank}
      </div>
      <div className={`flex-1 flex items-center justify-center text-2xl sm:text-3xl ${suitColors[card.suit]}`}>
        {suitSymbols[card.suit]}
      </div>
      <div className={`text-sm sm:text-base font-bold self-end rotate-180 ${suitColors[card.suit]}`}>
        {card.rank}
      </div>
    </div>
  );
}
