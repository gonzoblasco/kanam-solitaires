/**
 * Pyramid Solitaire — game logic.
 *
 * Rules:
 *   - Pyramid of 28 cards (7 rows: 1+2+3+4+5+6+7)
 *   - Only exposed cards (no card above them) can be selected
 *   - Pair cards that sum to 13 (A=1, J=11, Q=12, K=13)
 *   - K can be removed solo
 *   - Stock of 24 cards, waste pile
 */

import { createDeck, shuffle, rankValue } from '../../lib/card.js';

export function createPyramid() {
  const deck = shuffle(createDeck());
  deck.forEach(c => c.faceUp = true);

  // Build pyramid
  const pyramid = [];
  let idx = 0;
  for (let row = 0; row < 7; row++) {
    const rowCards = [];
    for (let col = 0; col <= row; col++) {
      rowCards.push({ ...deck[idx++], row, col, removed: false });
    }
    pyramid.push(rowCards);
  }

  // Stock = remaining cards
  const stock = deck.slice(idx).map(c => ({ ...c, faceUp: false }));

  return {
    pyramid,
    stock,
    waste: [],
    selected: [], // [{ row, col }]
    score: 0,
    moves: 0,
    history: [],
    startTime: null,
    elapsed: 0,
    timerRunning: false,
    won: false,
  };
}

/* ─── Undo ─── */

function snapshot(state) {
  return {
    pyramid: state.pyramid.map(row => row.map(c => ({ ...c }))),
    stock: state.stock.map(c => ({ ...c })),
    waste: state.waste.map(c => ({ ...c })),
    selected: state.selected.map(s => ({ ...s })),
    score: state.score,
    moves: state.moves,
  };
}

function restore(state, snap) {
  state.pyramid = snap.pyramid;
  state.stock = snap.stock;
  state.waste = snap.waste;
  state.selected = snap.selected;
  state.score = snap.score;
  state.moves = snap.moves;
}

function pushUndo(state) {
  state.history.push(snapshot(state));
  if (state.history.length > 50) state.history.shift();
}

export function undo(state) {
  if (state.history.length === 0) return false;
  restore(state, state.history.pop());
  return true;
}

/* ─── Timer ─── */

export function startTimer(state) {
  if (!state.timerRunning && !state.won) {
    state.startTime = Date.now() - state.elapsed;
    state.timerRunning = true;
  }
}

export function stopTimer(state) {
  if (state.timerRunning) {
    state.elapsed = Date.now() - state.startTime;
    state.timerRunning = false;
  }
}

export function tickTimer(state) {
  if (state.timerRunning && !state.won) state.elapsed = Date.now() - state.startTime;
}

export function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/* ─── Pyramid helpers ─── */

/**
 * Check if a card in the pyramid is exposed (no card above it).
 */
function isExposed(pyramid, row, col) {
  if (row === 6) return true; // Bottom row is always exposed
  // Check if the two cards below are both removed
  const belowLeft = pyramid[row + 1][col];
  const belowRight = pyramid[row + 1][col + 1];
  return belowLeft.removed && belowRight.removed;
}

/**
 * Get all currently exposed cards in the pyramid.
 */
function getExposedCards(pyramid) {
  const exposed = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col <= row; col++) {
      const card = pyramid[row][col];
      if (!card.removed && isExposed(pyramid, row, col)) {
        exposed.push(card);
      }
    }
  }
  return exposed;
}

/**
 * Check if two cards sum to 13.
 */
function cardsSumTo13(a, b) {
  return rankValue(a.rank) + rankValue(b.rank) === 13;
}

/**
 * Check if a card is a King (value 13, can be removed solo).
 */
function isKing(card) {
  return card.rank === 'K';
}

/* ─── Selection ─── */

/**
 * Toggle selection of a pyramid card.
 */
export function toggleSelect(state, row, col) {
  const card = state.pyramid[row][col];
  if (card.removed) return false;
  if (!isExposed(state.pyramid, row, col)) return false;

  // Check if already selected
  const existingIdx = state.selected.findIndex(s => s.row === row && s.col === col);
  if (existingIdx !== -1) {
    state.selected.splice(existingIdx, 1);
    return true;
  }

  // If a waste card is already selected, try to pair
  const wasteIdx = state.selected.findIndex(s => s.source === 'waste');
  if (wasteIdx !== -1) {
    const wasteCard = state.waste[state.waste.length - 1];
    if (wasteCard && cardsSumTo13(card, wasteCard)) {
      pushUndo(state);
      card.removed = true;
      state.waste.pop();
      state.selected = [];
      state.score += 20;
      state.moves++;
      startTimer(state);
      return true;
    }
    return false;
  }

  // Can't select more than 2
  if (state.selected.length >= 2) return false;

  state.selected.push({ row, col });
  return true;
}

/**
 * Remove selected pair (or king).
 */
export function removeSelected(state) {
  if (state.selected.length === 0) return false;

  pushUndo(state);

  if (state.selected.length === 1) {
    // Single card — must be a King
    const { row, col } = state.selected[0];
    const card = state.pyramid[row][col];
    if (!isKing(card)) {
      state.history.pop(); // undo the push
      return false;
    }
    card.removed = true;
    state.score += 10;
  } else {
    // Pair
    const a = state.selected[0];
    const b = state.selected[1];
    const cardA = state.pyramid[a.row][a.col];
    const cardB = state.pyramid[b.row][b.col];
    if (!cardsSumTo13(cardA, cardB)) {
      state.history.pop();
      return false;
    }
    cardA.removed = true;
    cardB.removed = true;
    state.score += 20;
  }

  state.selected = [];
  state.moves++;
  startTimer(state);
  return true;
}

/**
 * Select waste top card.
 */
export function selectWaste(state) {
  if (state.waste.length === 0) return false;
  if (state.selected.some(s => s.source === 'waste')) return false;

  const card = state.waste[state.waste.length - 1];

  // Check if it pairs with a selected pyramid card
  if (state.selected.length > 0) {
    const { row, col } = state.selected[0];
    const pyramidCard = state.pyramid[row][col];
    if (cardsSumTo13(card, pyramidCard)) {
      pushUndo(state);
      pyramidCard.removed = true;
      state.waste.pop();
      state.selected = [];
      state.score += 20;
      state.moves++;
      startTimer(state);
      return true;
    }
  }

  // King can be removed alone from waste
  if (isKing(card)) {
    pushUndo(state);
    state.waste.pop();
    state.selected = [];
    state.score += 10;
    state.moves++;
    startTimer(state);
    return true;
  }

  // Select waste card alone
  state.selected = [{ source: 'waste' }];
  return true;
}

/* ─── Draw ─── */

export function drawStock(state) {
  if (state.stock.length === 0) return false;
  pushUndo(state);
  const card = state.stock.pop();
  card.faceUp = true;
  state.waste.push(card);
  state.moves++;
  startTimer(state);
  return true;
}

/* ─── Hint ─── */

export function findHint(state) {
  const exposed = getExposedCards(state.pyramid);

  // 1. Find pairs among exposed cards
  for (let i = 0; i < exposed.length; i++) {
    for (let j = i + 1; j < exposed.length; j++) {
      if (cardsSumTo13(exposed[i], exposed[j])) {
        return { type: 'pyramid-pair', cards: [exposed[i], exposed[j]] };
      }
    }
  }

  // 2. Find kings
  for (const card of exposed) {
    if (isKing(card)) {
      return { type: 'pyramid-king', card };
    }
  }

  // 3. Check waste + exposed pairs
  if (state.waste.length > 0) {
    const wasteCard = state.waste[state.waste.length - 1];
    if (isKing(wasteCard)) {
      return { type: 'waste-king' };
    }
    for (const card of exposed) {
      if (cardsSumTo13(wasteCard, card)) {
        return { type: 'waste-pyramid', wasteCard, pyramidCard: card };
      }
    }
  }

  return null;
}

export function autoComplete(state) {
  let moved = 0;
  let found = true;
  while (found) {
    found = false;
    const hint = findHint(state);
    if (!hint) break;

    if (hint.type === 'pyramid-pair') {
      const a = hint.cards[0];
      const b = hint.cards[1];
      pushUndo(state);
      a.removed = true;
      b.removed = true;
      state.score += 20;
      state.moves++;
      moved++;
      found = true;
    } else if (hint.type === 'pyramid-king') {
      pushUndo(state);
      hint.card.removed = true;
      state.score += 10;
      state.moves++;
      moved++;
      found = true;
    } else if (hint.type === 'waste-king') {
      pushUndo(state);
      state.waste.pop();
      state.score += 10;
      state.moves++;
      moved++;
      found = true;
    } else if (hint.type === 'waste-pyramid') {
      pushUndo(state);
      hint.pyramidCard.removed = true;
      state.waste.pop();
      state.score += 20;
      state.moves++;
      moved++;
      found = true;
    }
  }
  return moved;
}

export function isGameWon(state) {
  return state.pyramid.every(row => row.every(c => c.removed));
}
