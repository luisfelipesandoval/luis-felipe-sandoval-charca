export type CardSuit = '♠' | '♥' | '♦' | '♣';
export type CardRank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

export interface PlayingCard {
  suit: CardSuit;
  rank: CardRank;
  id: string;
}

export type BlackjackOutcome =
  | 'blackjack'
  | 'win'
  | 'dealer_bust'
  | 'push'
  | 'bust'
  | 'loss';

const SUITS: CardSuit[] = ['♠', '♥', '♦', '♣'];
const RANKS: CardRank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

/**
 * Creates and shuffles a standard 52-card deck.
 */
export function createShuffledDeck(randomFn: () => number = Math.random): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}${suit}` });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
  return deck;
}

/**
 * Calculates the best Blackjack total for a hand, counting Aces as 11 or 1
 * to avoid busting over 21 whenever possible.
 */
export function calculateHandValue(hand: PlayingCard[]): {
  total: number;
  isSoft: boolean;
  isBlackjack: boolean;
  isBust: boolean;
} {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === 'A') {
      aces += 1;
      total += 11;
    } else if (card.rank === 'K' || card.rank === 'Q' || card.rank === 'J') {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  const isBlackjack = hand.length === 2 && total === 21;
  const isBust = total > 21;

  return {
    total,
    isSoft: aces > 0 && total <= 21,
    isBlackjack,
    isBust,
  };
}

/**
 * Evaluates the final outcome of a Blackjack round once both hands are complete.
 */
export function evaluateBlackjackOutcome(
  playerHand: PlayingCard[],
  dealerHand: PlayingCard[]
): BlackjackOutcome {
  const p = calculateHandValue(playerHand);
  const d = calculateHandValue(dealerHand);

  if (p.isBust) return 'bust';
  if (p.isBlackjack && !d.isBlackjack) return 'blackjack';
  if (d.isBust) return 'dealer_bust';
  if (d.isBlackjack && !p.isBlackjack) return 'loss';
  if (p.total > d.total) return 'win';
  if (p.total < d.total) return 'loss';
  return 'push';
}
