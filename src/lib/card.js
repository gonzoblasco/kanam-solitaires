/**
 * Card module — suits, ranks, deck, and card model.
 */

export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const SUIT_COLORS = {
  '♠': 'black',
  '♣': 'black',
  '♥': 'red',
  '♦': 'red',
};

export const SUIT_NAMES = {
  '♠': 'spades',
  '♥': 'hearts',
  '♦': 'diamonds',
  '♣': 'clubs',
};

export function rankValue(rank) {
  const values = { A: 1, J: 11, Q: 12, K: 13 };
  return values[rank] ?? Number.parseInt(rank, 10);
}

export function isRed(suit) {
  return suit === '♥' || suit === '♦';
}

export function isBlack(suit) {
  return suit === '♠' || suit === '♣';
}

export function oppositeColor(suit) {
  return isRed(suit) ? 'black' : 'red';
}

export function createCard(suit, rank) {
  return {
    suit,
    rank,
    value: rankValue(rank),
    color: SUIT_COLORS[suit],
    faceUp: false,
    id: `${SUIT_NAMES[suit]}-${rank}`,
  };
}

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank));
    }
  }
  return deck;
}

export function shuffle(deck) {
  const a = [...deck];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
