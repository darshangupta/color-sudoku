export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // Baccarat value (0-9)
}

export type BetType = 'player' | 'banker' | 'tie';

export interface Bet {
  type: BetType;
  amount: number;
}

export type GameResult = 'player' | 'banker' | 'tie';

export interface GameState {
  playerHand: Card[];
  bankerHand: Card[];
  playerScore: number;
  bankerScore: number;
  result: GameResult | null;
  phase: 'betting' | 'dealing' | 'result';
}
