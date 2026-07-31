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

import { createDeck, shuffle, rankValue, isRed } from '../../lib/card.js';

const SUIT_GROUPS = {
  1: [['♠']],
  2: [['♠', '♥'], ['♦', '♣']],
  4: [['♠'], ['♥'], ['♦'], ['♣']],
};

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createSpider(difficulty = 1) {
  const suitGroups = SUIT_GROUPS[difficulty] || SUIT_GROUPS[1];
  const suits = suitGroups.flat();
  const cards = [];

  if (difficulty === 1) {
    // 1 suit: 8 copies of each rank (104 cards total, all same suit)
    for (let i = 0; i < 8; i++) {
      for (const rank of RANKS) {
        cards.push({ suit: '♠', rank, value: rankValue(rank), color: 'black', faceUp: false, id: `♠-${rank}-${i}` });
      }
    }
  } else {
    // 2 or 4 suits: 2 full decks with the selected suits
    for (let d = 0; d < 2; d++) {
      for (const suit of suits) {
        for (const rank of RANKS) {
          cards.push({ suit, rank, value: rankValue(rank), color: isRed(suit) ? 'red' : 'black', faceUp: false, id: `${suit}-${rank}-${d}` });
        }
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
    for (let row = 0; row < count; row++) {
      const card = deck[idx++];
      card.faceUp = row === count - 1;
      colCards.push(card);
    }
    tableau.push(colCards);
  }

  // Remaining cards go to stock
  const stock = deck.slice(idx).map(c => ({ ...c, faceUp: false }));

  return {
    tableau,
    stock,
    score: 0,
    moves: 0,
    history: [],
    difficulty,
    startTime: null,
    elapsed: 0,
    timerRunning: false,
    won: false,
  };
}

/* ─── Undo ─── */

function snapshot(state) {
  return {
    tableau: state.tableau.map(col => col.map(c => ({ ...c }))),
    stock: state.stock.map(c => ({ ...c })),
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
  if (state.timerRunning && !state.won) {
    state.elapsed = Date.now() - state.startTime;
  }
}

export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

/* ─── Validation ─── */

/**
 * Can a card be placed on a column?
 * In Spider, cards build down regardless of color.
 * For difficulty > 1, the run must be of the same suit group.
 */
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

  const cards = state.tableau[sourceCol].splice(runStart);
  if (!canMoveToColumn(cards[0], state.tableau[targetCol])) {
    state.tableau[sourceCol].push(...cards);
    return false;
  }

  pushUndo(state);
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
 * Check if the last 13 cards of a column form a complete K→A run of the same suit.
 * If so, remove them.
 */
function checkCompleteRun(state, colIndex) {
  const column = state.tableau[colIndex];
  if (column.length < 13) return false;

  // Look for any complete A→K run of the same suit anywhere in the column
  for (let start = 0; start <= column.length - 13; start++) {
    const run = column.slice(start, start + 13);

    // Must be A→K of the same suit
    const suit = run[0].suit;
    if (run[0].rank !== 'A') continue;
    let valid = true;
    for (let i = 0; i < 12; i++) {
      if (run[i].suit !== suit || rankValue(run[i].rank) !== rankValue(run[i + 1].rank) - 1) {
        valid = false;
        break;
      }
    }
    if (!valid || run[12].rank !== 'K') continue;

    // Found a complete run — remove it
    column.splice(start, 13);
    state.score += 100;

    // Flip new top card if any card below was face-down
    if (start > 0 && column[start - 1] && !column[start - 1].faceUp) {
      column[start - 1].faceUp = true;
      state.score += 5;
    } else if (column.length > 0) {
      const newTop = column[column.length - 1];
      if (!newTop.faceUp) {
        newTop.faceUp = true;
        state.score += 5;
      }
    }

    return true;
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

/* ─── Hint ─── */

export function findHint(state) {
  // 1. Try to move a run to complete another run
  for (let srcCol = 0; srcCol < 10; srcCol++) {
    const column = state.tableau[srcCol];
    for (let cardIdx = 0; cardIdx < column.length; cardIdx++) {
      const runStart = getRunStart(column, cardIdx);
      if (runStart === -1) continue;
      const runCard = column[runStart];
      for (let dstCol = 0; dstCol < 10; dstCol++) {
        if (dstCol === srcCol) continue;
        if (canMoveToColumn(runCard, state.tableau[dstCol])) {
          return { source: 'tableau', sourceIndex: srcCol, cardIndex: runStart, dest: 'tableau', destIndex: dstCol };
        }
      }
    }
  }
  return null;
}

/* ─── Auto-complete ─── */

export function autoComplete(state) {
  // In Spider, auto-complete means finding and completing runs
  // This is complex; for now, just find hints
  return 0;
}

/* ─── Win ─── */

export function isGameWon(state) {
  return state.tableau.every(col => col.length === 0);
}
