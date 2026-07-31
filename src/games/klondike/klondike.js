/**
 * Klondike Solitaire — game logic.
 *
 * Layout:
 *   - Stock: draw pile (face down)
 *   - Waste: drawn cards (face up)
 *   - Foundations: 4 piles, one per suit, A→K ascending
 *   - Tableau: 7 columns, cards build down in alternating colors
 */

import { createDeck, shuffle, rankValue, isRed, isBlack } from '../../lib/card.js';

export function createKlondike() {
  const deck = shuffle(createDeck());

  // Deal tableau columns (1-7 cards, only top card face up)
  const tableau = [];
  let cardIndex = 0;
  for (let col = 0; col < 7; col++) {
    const cards = [];
    for (let row = 0; row <= col; row++) {
      const card = deck[cardIndex++];
      card.faceUp = row === col;
      cards.push(card);
    }
    tableau.push(cards);
  }

  // Remaining cards go to stock
  const stock = deck.slice(cardIndex).map(c => ({ ...c, faceUp: false }));
  const waste = [];
  const foundations = [[], [], [], []];

  return {
    stock,
    waste,
    foundations,
    tableau,
    score: 0,
    moves: 0,
  };
}

/**
 * Draw from stock → waste.
 * If stock is empty, flip waste back to stock.
 */
export function drawStock(state) {
  if (state.stock.length > 0) {
    const card = state.stock.pop();
    card.faceUp = true;
    state.waste.push(card);
    state.moves++;
    return true;
  }

  // Flip waste back to stock
  if (state.waste.length > 0) {
    const cards = state.waste.splice(0).reverse();
    for (const c of cards) {
      c.faceUp = false;
    }
    state.stock.push(...cards);
    state.moves++;
    return true;
  }

  return false;
}

/**
 * Can a card be placed on a foundation pile?
 */
export function canMoveToFoundation(card, foundationPile) {
  if (foundationPile.length === 0) {
    return card.rank === 'A';
  }
  const top = foundationPile[foundationPile.length - 1];
  return top.suit === card.suit && rankValue(card.rank) === rankValue(top.rank) + 1;
}

/**
 * Can a card (or stack) be placed on a tableau column?
 */
export function canMoveToTableau(card, column) {
  if (column.length === 0) {
    return card.rank === 'K';
  }
  const top = column[column.length - 1];
  const cardColor = isRed(card.suit) ? 'red' : 'black';
  const topColor = isRed(top.suit) ? 'red' : 'black';
  return cardColor !== topColor && rankValue(card.rank) === rankValue(top.rank) - 1;
}

/**
 * Move top card of waste to foundation.
 */
export function wasteToFoundation(state, foundationIndex) {
  if (state.waste.length === 0) return false;
  const card = state.waste[state.waste.length - 1];
  if (!canMoveToFoundation(card, state.foundations[foundationIndex])) return false;
  state.foundations[foundationIndex].push(state.waste.pop());
  state.score += 10;
  state.moves++;
  return true;
}

/**
 * Move top card of waste to tableau column.
 */
export function wasteToTableau(state, columnIndex) {
  if (state.waste.length === 0) return false;
  const card = state.waste[state.waste.length - 1];
  if (!canMoveToTableau(card, state.tableau[columnIndex])) return false;
  state.tableau[columnIndex].push(state.waste.pop());
  state.moves++;
  return true;
}

/**
 * Move card(s) from one tableau column to another.
 * Returns the index of the card in the source column where the run starts.
 */
export function getTableauRunStart(column, cardIndex) {
  if (cardIndex < 0 || cardIndex >= column.length) return -1;
  const clickedCard = column[cardIndex];
  if (!clickedCard.faceUp) return -1;

  // Verify the run from cardIndex to end is valid
  for (let i = cardIndex; i < column.length - 1; i++) {
    const a = column[i];
    const b = column[i + 1];
    const aColor = isRed(a.suit) ? 'red' : 'black';
    const bColor = isRed(b.suit) ? 'red' : 'black';
    if (aColor === bColor || rankValue(a.rank) !== rankValue(b.rank) + 1) {
      return -1;
    }
  }
  return cardIndex;
}

/**
 * Move a run from source column to target column.
 */
export function moveTableauRun(state, sourceCol, cardIndex, targetCol) {
  const runStart = getTableauRunStart(state.tableau[sourceCol], cardIndex);
  if (runStart === -1) return false;

  const cards = state.tableau[sourceCol].splice(runStart);
  if (!canMoveToTableau(cards[0], state.tableau[targetCol])) {
    // Put them back
    state.tableau[sourceCol].push(...cards);
    return false;
  }

  state.tableau[targetCol].push(...cards);

  // Flip the new top card of source column if face down
  if (state.tableau[sourceCol].length > 0) {
    const newTop = state.tableau[sourceCol][state.tableau[sourceCol].length - 1];
    if (!newTop.faceUp) {
      newTop.faceUp = true;
      state.score += 5;
    }
  }

  state.moves++;
  return true;
}

/**
 * Move a card from tableau to foundation.
 */
export function tableauToFoundation(state, colIndex, foundationIndex) {
  const column = state.tableau[colIndex];
  if (column.length === 0) return false;
  const card = column[column.length - 1];
  if (!card.faceUp) return false;
  if (!canMoveToFoundation(card, state.foundations[foundationIndex])) return false;

  state.foundations[foundationIndex].push(column.pop());

  // Flip new top card if face down
  if (column.length > 0) {
    const newTop = column[column.length - 1];
    if (!newTop.faceUp) {
      newTop.faceUp = true;
      state.score += 5;
    }
  }

  state.score += 10;
  state.moves++;
  return true;
}

/**
 * Auto-move: find the best destination for a card (or run) on double-click.
 * Priority:
 *   1. Foundation (if the card can go there)
 *   2. Tableau column (if the card can be placed)
 * Returns { type: 'foundation'|'tableau', index } or null if no valid move.
 */
export function findAutoDestination(state, card, sourceType, sourceIndex, cardIndex) {
  // 1. Try foundations first (only for single cards, not runs)
  if (sourceType === 'waste' || (sourceType === 'tableau' && cardIndex === state.tableau[sourceIndex].length - 1)) {
    for (let i = 0; i < 4; i++) {
      if (canMoveToFoundation(card, state.foundations[i])) {
        return { type: 'foundation', index: i };
      }
    }
  }

  // 2. Try tableau columns (for runs or cards that didn't fit a foundation)
  for (let i = 0; i < 7; i++) {
    if (sourceType === 'tableau' && i === sourceIndex) continue;
    if (canMoveToTableau(card, state.tableau[i])) {
      return { type: 'tableau', index: i };
    }
  }

  return null;
}

/**
 * Execute an auto-move (double-click action).
 */
export function executeAutoMove(state, dest) {
  if (!dest) return false;
  // The move was already executed by the caller; this is a no-op helper
  return true;
}

/**
 * Check if the game is won (all foundations complete).
 */
export function isGameWon(state) {
  return state.foundations.every(f => f.length === 13);
}
