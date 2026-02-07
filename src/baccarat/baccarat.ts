import type { Card, GameResult } from './types';

export function calculateHandScore(cards: Card[]): number {
  const total = cards.reduce((sum, card) => sum + card.value, 0);
  return total % 10;
}

export function isNatural(score: number): boolean {
  return score === 8 || score === 9;
}

// Player draws third card if score is 0-5, stands on 6-7
export function playerDrawsThird(playerScore: number): boolean {
  return playerScore <= 5;
}

// Banker third card rules based on banker score and player's third card
export function bankerDrawsThird(
  bankerScore: number,
  playerThirdCard: Card | null
): boolean {
  // If player didn't draw, banker draws on 0-5
  if (playerThirdCard === null) {
    return bankerScore <= 5;
  }

  const p3 = playerThirdCard.value;

  switch (bankerScore) {
    case 0:
    case 1:
    case 2:
      return true;
    case 3:
      return p3 !== 8;
    case 4:
      return p3 >= 2 && p3 <= 7;
    case 5:
      return p3 >= 4 && p3 <= 7;
    case 6:
      return p3 === 6 || p3 === 7;
    case 7:
      return false;
    default:
      return false;
  }
}

export function determineWinner(playerScore: number, bankerScore: number): GameResult {
  if (playerScore > bankerScore) return 'player';
  if (bankerScore > playerScore) return 'banker';
  return 'tie';
}

export function calculatePayout(
  betType: 'player' | 'banker' | 'tie',
  betAmount: number,
  result: GameResult
): number {
  if (betType !== result) {
    return -betAmount; // Lost bet
  }

  switch (betType) {
    case 'player':
      return betAmount; // 1:1
    case 'banker':
      return betAmount * 0.95; // 1:1 minus 5% commission
    case 'tie':
      return betAmount * 8; // 8:1
  }
}
