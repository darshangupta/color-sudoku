import type { Card as CardType } from '../../baccarat/types';
import { Card } from './Card';

interface HandProps {
  cards: CardType[];
  label: string;
  score: number | null;
  isWinner?: boolean;
}

export function Hand({ cards, label, score, isWinner = false }: HandProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`text-lg font-bold uppercase tracking-wider ${
        isWinner ? 'text-yellow-400' : 'text-gray-400'
      }`}>
        {label}
        {score !== null && (
          <span className={`ml-2 px-2 py-0.5 rounded text-sm ${
            isWinner
              ? 'bg-yellow-500/30 text-yellow-300'
              : 'bg-gray-700 text-gray-300'
          }`}>
            {score}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {cards.map((card, index) => (
          <Card key={`${card.suit}-${card.rank}-${index}`} card={card} delay={index * 150} />
        ))}
        {cards.length === 0 && (
          <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg border-2 border-dashed border-gray-600" />
        )}
      </div>
    </div>
  );
}
