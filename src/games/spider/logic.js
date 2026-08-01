/**
 * Spider Solitaire — game logic.
 *
 * Rules:
 *   - 2 decks (104 cards)
 *   - 10 columns: 6 with 6 cards (5 face-down), 4 with 5 cards (4 face-down)
 *   - Build runs K→A of the same suit
 *   - Complete run = removed from board
 *   - Draw: 10 cards (1 per column)
 *   - Difficulty: 1 suit (easy), 2 suits (medium), 4 suits (hard)
 */

import { createDeck, isRed, rankValue, shuffle } from '../../lib/card.js';

const SUIT_SETS = {
  1: ['♠'],
  2: ['♠', '♥'],
  4: ['♠', '♥', '♦', '♣'],
};

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createSpider(difficulty = 1) {
  const suits = SUIT_SETS[difficulty] || SUIT_SETS[1];
  // Total cards must be 104. With 13 ranks and N suits, each rank appears 104 / (N * 13) times.
  const copiesPerRank = Math.floor(104 / (suits.length * RANKS.length));
  const cards = [];

  for (let i = 0; i < copiesPerRank; i++) {
    for (const suit of suits) {
      for (const rank of RANKS) {
        cards.push({
          suit,
          rank,
          value: rankValue(rank),
          color: isRed(suit) ? 'red' : 'black',
          faceUp: false,
          id: `${suit}-${rank}-${i}`,
        });
      }
    }
  }

  const deck = shuffle(cards);

  // Deal tableau
  const tableau = [];
  let idx = 0;
  for (let col = 0; col < 10; col++) {
    const count = col < 6 ? 6 : 5;
    const colCards = [];
    for (let r = 0; r < count; r++) {
      const card = deck[idx++];
      card.faceUp = r === count - 1; // last card in each column face up
      colCards.push(card);
    }
    tableau.push(colCards);
  }

  const stock = deck.slice(idx);
  return {
    difficulty,
    tableau,
    stock,
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
    tableau: state.tableau.map((col) => col.map((c) => ({ ...c }))),
    stock: state.stock.map((c) => ({ ...c })),
    score: state.score,
    moves: state.moves,
  };
}

function restore(state, snap) {
  state.tableau = snap.tableau;
  state.stock = snap.stock;
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

/* ─── Validation ─── */

export function canMoveToColumn(card, column) {
  if (column.length === 0) return true;
  const top = column[column.length - 1];
  return rankValue(card.rank) === rankValue(top.rank) - 1;
}

/**
 * Get the start of a valid run from cardIndex to end.
 * A valid run is K→A of the same suit (for difficulty 1, any suit works).
 */
export function getRunStart(column, cardIndex) {
  if (cardIndex < 0 || cardIndex >= column.length) return -1;
  if (!column[cardIndex].faceUp) return -1;

  for (let i = cardIndex; i < column.length - 1; i++) {
    const a = column[i];
    const b = column[i + 1];
    if (a.suit !== b.suit || rankValue(a.rank) !== rankValue(b.rank) + 1) {
      return -1;
    }
  }
  return cardIndex;
}

/**
 * Move a run from source column to target column.
 */
export function moveRun(state, sourceCol, cardIndex, targetCol) {
  const runStart = getRunStart(state.tableau[sourceCol], cardIndex);
  if (runStart === -1) return false;

  const cards = state.tableau[sourceCol].slice(runStart);
  if (!canMoveToColumn(cards[0], state.tableau[targetCol])) return false;

  pushUndo(state);
  state.tableau[sourceCol].splice(runStart);
  state.tableau[targetCol].push(...cards);

  // Flip new top card
  if (state.tableau[sourceCol].length > 0) {
    const newTop = state.tableau[sourceCol][state.tableau[sourceCol].length - 1];
    if (!newTop.faceUp) {
      newTop.faceUp = true;
      state.score += 5;
    }
  }

  state.moves++;
  startTimer(state);

  // Check all columns for completed runs
  checkAllColumns(state);

  return true;
}

/**
 * Check all columns for completed runs.
 */
function checkAllColumns(state) {
  for (let i = 0; i < 10; i++) {
    checkCompleteRun(state, i);
  }
}

/**
 * Check if any 13 consecutive face-up cards of the same suit form a complete run.
 * Accepts A→K ascending or K→A descending (tableau order).
 */
export function checkCompleteRun(state, colIndex) {
  const column = state.tableau[colIndex];
  if (column.length < 13) return false;

  for (let start = 0; start <= column.length - 13; start++) {
    const run = column.slice(start, start + 13);
    if (run.some((c) => !c.faceUp)) continue;

    const suit = run[0].suit;
    if (run.some((c) => c.suit !== suit)) continue;

    const ranks = run.map((c) => rankValue(c.rank));

    // A→K ascending
    let ascending = true;
    for (let i = 0; i < 12; i++) {
      if (ranks[i + 1] !== ranks[i] + 1) {
        ascending = false;
        break;
      }
    }
    if (ascending && run[0].rank === 'A' && run[12].rank === 'K') {
      column.splice(start, 13);
      state.score += 100;
      if (column.length > 0) {
        const newTop = column[column.length - 1];
        if (!newTop.faceUp) {
          newTop.faceUp = true;
          state.score += 5;
        }
      }
      return true;
    }

    // K→A descending
    let descending = true;
    for (let i = 0; i < 12; i++) {
      if (ranks[i + 1] !== ranks[i] - 1) {
        descending = false;
        break;
      }
    }
    if (descending && run[0].rank === 'K' && run[12].rank === 'A') {
      column.splice(start, 13);
      state.score += 100;
      if (column.length > 0) {
        const newTop = column[column.length - 1];
        if (!newTop.faceUp) {
          newTop.faceUp = true;
          state.score += 5;
        }
      }
      return true;
    }
  }

  return false;
}

/* ─── Draw ─── */

/**
 * Draw 10 cards from stock (1 per column).
 */
export function drawStock(state) {
  if (state.stock.length === 0) return false;
  pushUndo(state);

  const count = Math.min(10, state.stock.length);
  for (let i = 0; i < count; i++) {
    const card = state.stock.pop();
    card.faceUp = true;
    state.tableau[i].push(card);
  }

  state.moves++;
  startTimer(state);

  // Check all columns for completed runs after draw
  checkAllColumns(state);

  return true;
}

/* ─── Hints ─── */

export function findHint(state) {
  // Find any exposed run that can move to another column
  for (let srcCol = 0; srcCol < 10; srcCol++) {
    const column = state.tableau[srcCol];
    for (let cardIndex = 0; cardIndex < column.length; cardIndex++) {
      const runStart = getRunStart(column, cardIndex);
      if (runStart === -1) continue;
      const runCard = column[runStart];
      for (let dstCol = 0; dstCol < 10; dstCol++) {
        if (dstCol === srcCol) continue;
        if (canMoveToColumn(runCard, state.tableau[dstCol])) {
          return { sourceCol: srcCol, cardIndex: runStart, destCol: dstCol };
        }
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
    if (hint) {
      const column = state.tableau[hint.sourceCol];
      const runStart = getRunStart(column, hint.cardIndex);
      if (runStart !== -1) {
        const cards = column.slice(runStart);
        pushUndo(state);
        column.splice(runStart);
        state.tableau[hint.destCol].push(...cards);
        state.moves++;
        checkAllColumns(state);
        moved++;
        found = true;
      }
    }
  }
  return moved;
}

export function isGameWon(state) {
  return state.tableau.every((col) => col.length === 0);
}
