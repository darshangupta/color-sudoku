import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Card as CardType, BetType, GameResult as GameResultType, GameState } from '../../baccarat/types';
import { createShoe, dealCard } from '../../baccarat/deck';
import {
  calculateHandScore,
  isNatural,
  playerDrawsThird,
  bankerDrawsThird,
  determineWinner,
  calculatePayout,
} from '../../baccarat/baccarat';
import { Hand } from './Hand';
import { BettingControls } from './BettingControls';
import { GameResult } from './GameResult';

const INITIAL_BALANCE = 1000;

export function BaccaratScreen() {
  const navigate = useNavigate();
  const [shoe, setShoe] = useState<CardType[]>(() => createShoe());
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [currentBet, setCurrentBet] = useState<{ type: BetType; amount: number } | null>(null);
  const [lastPayout, setLastPayout] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    playerHand: [],
    bankerHand: [],
    playerScore: 0,
    bankerScore: 0,
    result: null,
    phase: 'betting',
  });

  const handlePlaceBet = useCallback((type: BetType, amount: number) => {
    if (amount <= balance) {
      setCurrentBet({ type, amount });
    }
  }, [balance]);

  const dealCards = useCallback(() => {
    if (!currentBet) return;

    let currentShoe = shoe.length < 20 ? createShoe() : shoe;
    const playerHand: CardType[] = [];
    const bankerHand: CardType[] = [];

    // Deal initial 4 cards
    let card: CardType;
    [card, currentShoe] = dealCard(currentShoe);
    playerHand.push(card);
    [card, currentShoe] = dealCard(currentShoe);
    bankerHand.push(card);
    [card, currentShoe] = dealCard(currentShoe);
    playerHand.push(card);
    [card, currentShoe] = dealCard(currentShoe);
    bankerHand.push(card);

    let playerScore = calculateHandScore(playerHand);
    let bankerScore = calculateHandScore(bankerHand);

    // Check for naturals
    if (!isNatural(playerScore) && !isNatural(bankerScore)) {
      // Player third card
      let playerThirdCard: CardType | null = null;
      if (playerDrawsThird(playerScore)) {
        [card, currentShoe] = dealCard(currentShoe);
        playerHand.push(card);
        playerThirdCard = card;
        playerScore = calculateHandScore(playerHand);
      }

      // Banker third card
      if (bankerDrawsThird(bankerScore, playerThirdCard)) {
        [card, currentShoe] = dealCard(currentShoe);
        bankerHand.push(card);
        bankerScore = calculateHandScore(bankerHand);
      }
    }

    const result = determineWinner(playerScore, bankerScore);
    const payout = calculatePayout(currentBet.type, currentBet.amount, result);

    setShoe(currentShoe);
    setLastPayout(payout);
    setGameState({
      playerHand,
      bankerHand,
      playerScore,
      bankerScore,
      result,
      phase: 'dealing',
    });

    // Show result after dealing animation
    setTimeout(() => {
      setBalance((prev) => prev + payout);
      setGameState((prev) => ({ ...prev, phase: 'result' }));
    }, 1000);
  }, [currentBet, shoe]);

  const handlePlayAgain = useCallback(() => {
    setCurrentBet(null);
    setGameState({
      playerHand: [],
      bankerHand: [],
      playerScore: 0,
      bankerScore: 0,
      result: null,
      phase: 'betting',
    });
  }, []);

  const isBettingPhase = gameState.phase === 'betting';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-900/20 to-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Baccarat
        </h1>
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Game Table */}
      <div className="max-w-2xl mx-auto">
        {/* Hands */}
        <div className="flex justify-around mb-12">
          <Hand
            cards={gameState.bankerHand}
            label="Banker"
            score={gameState.phase !== 'betting' ? gameState.bankerScore : null}
            isWinner={gameState.result === 'banker'}
          />
          <Hand
            cards={gameState.playerHand}
            label="Player"
            score={gameState.phase !== 'betting' ? gameState.playerScore : null}
            isWinner={gameState.result === 'player'}
          />
        </div>

        {/* Betting Controls */}
        <BettingControls
          balance={balance}
          currentBet={currentBet}
          onPlaceBet={handlePlaceBet}
          onDeal={dealCards}
          disabled={!isBettingPhase}
        />
      </div>

      {/* Result Modal */}
      {gameState.phase === 'result' && gameState.result && (
        <GameResult
          result={gameState.result}
          payout={lastPayout}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {/* Shoe indicator */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-500">
        Cards remaining: {shoe.length}
      </div>
    </div>
  );
}
