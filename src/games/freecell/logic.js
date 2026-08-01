/**
 * FreeCell Solitaire — game logic.
 *
 * Rules:
 *   - 52 cards, all face up
 *   - 8 columns: 4 with 7 cards, 4 with 6 cards
 *   - 4 free cells (1 card each)
 *   - 4 foundations (A→K by suit)
 *   - Runs move freely (no alternating colors needed)
 *   - Max cards in a move = 2^(empty free cells + 1)
 */

import { createDeck, rankValue, shuffle } from '../../lib/card.js';

export function createFreeCell(variant = 'classic') {
  const deck = shuffle(createDeck());

  // All cards face up
  deck.forEach((c) => {
    c.faceUp = true;
  });

  // Deal 8 columns
  const tableau = [];
  let idx = 0;
  for (let col = 0; col < 8; col++) {
    const count = col < 4 ? 7 : 6;
    tableau.push(deck.slice(idx, idx + count));
    idx += count;
  }

  return {
    tableau,
    freeCells: [null, null, null, null],
    foundations: [[], [], [], []],
    score: 0,
    moves: 0,
    history: [],
    variant,
    startTime: Date.now(),
    elapsed: 0,
    timerRunning: true,
    won: false,
  };
}

/* ─── Undo ─── */

function snapshot(state) {
  return {
    tableau: state.tableau.map((col) => col.map((c) => ({ ...c }))),
    freeCells: state.freeCells.map((c) => (c ? { ...c } : null)),
    foundations: state.foundations.map((f) => f.map((c) => ({ ...c }))),
    score: state.score,
    moves: state.moves,
  };
}

function restore(state, snap) {
  state.tableau = snap.tableau;
  state.freeCells = snap.freeCells;
  state.foundations = snap.foundations;
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

export function canMoveToFoundation(card, foundation) {
  if (foundation.length === 0) return card.rank === 'A';
  const top = foundation[foundation.length - 1];
  return top.suit === card.suit && rankValue(card.rank) === rankValue(top.rank) + 1;
}

export function canMoveToColumn(card, column, variant = 'classic') {
  if (column.length === 0) return true;
  const top = column[column.length - 1];
  if (variant === 'bakers-game') {
    return rankValue(card.rank) === rankValue(top.rank) - 1 && card.suit === top.suit;
  }
  return rankValue(card.rank) === rankValue(top.rank) - 1 && card.color !== top.color;
}

/**
 * Get the max number of cards that can be moved in a run.
 * Real formula: (freeCells + 1) * 2^emptyColumns
 */
export function getMaxMovable(state) {
  const emptyCells = state.freeCells.filter((c) => c === null).length;
  const emptyColumns = state.tableau.filter((col) => col.length === 0).length;
  return (emptyCells + 1) * 2 ** emptyColumns;
}

/**
 * Get the start of a valid run from cardIndex.
 * In FreeCell, runs must be descending by rank and alternate colors.
 */
export function getRunStart(column, cardIndex, maxCount) {
  if (cardIndex < 0 || cardIndex >= column.length) return -1;
  const count = column.length - cardIndex;
  if (count > maxCount) return -1;

  for (let i = cardIndex; i < column.length - 1; i++) {
    const a = column[i];
    const b = column[i + 1];
    if (rankValue(a.rank) !== rankValue(b.rank) + 1 || a.color === b.color) {
      return -1;
    }
  }
  return cardIndex;
}

/* ─── Moves ─── */

export function moveRun(state, sourceCol, cardIndex, targetCol) {
  const maxMovable = getMaxMovable(state);
  const runStart = getRunStart(state.tableau[sourceCol], cardIndex, maxMovable);
  if (runStart === -1) return false;

  const cards = state.tableau[sourceCol].slice(runStart);
  if (!canMoveToColumn(cards[0], state.tableau[targetCol], state.variant)) return false;

  pushUndo(state);
  state.tableau[sourceCol].splice(runStart);
  state.tableau[targetCol].push(...cards);
  state.moves++;
  startTimer(state);
  return true;
}

export function moveToFreeCell(state, colIndex) {
  const column = state.tableau[colIndex];
  if (column.length === 0) return false;
  const emptyIdx = state.freeCells.indexOf(null);
  if (emptyIdx === -1) return false;

  pushUndo(state);
  state.freeCells[emptyIdx] = column.pop();
  state.moves++;
  startTimer(state);
  return true;
}

export function moveFromFreeCell(state, cellIndex, targetCol) {
  const card = state.freeCells[cellIndex];
  if (!card) return false;
  if (!canMoveToColumn(card, state.tableau[targetCol], state.variant)) return false;

  pushUndo(state);
  state.tableau[targetCol].push(card);
  state.freeCells[cellIndex] = null;
  state.moves++;
  startTimer(state);
  return true;
}

export function freeCellToFoundation(state, cellIndex, foundationIndex) {
  const card = state.freeCells[cellIndex];
  if (!card) return false;
  if (!canMoveToFoundation(card, state.foundations[foundationIndex])) return false;

  pushUndo(state);
  state.foundations[foundationIndex].push(card);
  state.freeCells[cellIndex] = null;
  state.score += 10;
  state.moves++;
  startTimer(state);
  return true;
}

export function tableauToFoundation(state, colIndex, foundationIndex) {
  const column = state.tableau[colIndex];
  if (column.length === 0) return false;
  const card = column[column.length - 1];
  if (!canMoveToFoundation(card, state.foundations[foundationIndex])) return false;

  pushUndo(state);
  state.foundations[foundationIndex].push(card);
  column.pop();
  state.score += 10;
  state.moves++;
  startTimer(state);
  return true;
}

/* ─── Hint ─── */

export function findHint(state) {
  // 1. Tableau top → foundation
  for (let col = 0; col < 8; col++) {
    const column = state.tableau[col];
    if (column.length === 0) continue;
    const card = column[column.length - 1];
    for (let i = 0; i < 4; i++) {
      if (canMoveToFoundation(card, state.foundations[i])) {
        return { source: 'tableau', sourceIndex: col, cardIndex: column.length - 1, dest: 'foundation', destIndex: i };
      }
    }
  }

  // 2. Free cell → foundation
  for (let i = 0; i < 4; i++) {
    const card = state.freeCells[i];
    if (!card) continue;
    for (let j = 0; j < 4; j++) {
      if (canMoveToFoundation(card, state.foundations[j])) {
        return { source: 'freecell', sourceIndex: i, cardIndex: null, dest: 'foundation', destIndex: j };
      }
    }
  }

  // 3. Tableau run → tableau
  for (let srcCol = 0; srcCol < 8; srcCol++) {
    const column = state.tableau[srcCol];
    const maxMovable = getMaxMovable(state);
    for (let cardIdx = 0; cardIdx < column.length; cardIdx++) {
      const runStart = getRunStart(column, cardIdx, maxMovable);
      if (runStart === -1) continue;
      const runCard = column[runStart];
      for (let dstCol = 0; dstCol < 8; dstCol++) {
        if (dstCol === srcCol) continue;
        if (canMoveToColumn(runCard, state.tableau[dstCol], state.variant)) {
          return { source: 'tableau', sourceIndex: srcCol, cardIndex: runStart, dest: 'tableau', destIndex: dstCol };
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
    for (let col = 0; col < 8; col++) {
      const column = state.tableau[col];
      if (column.length === 0) continue;
      const card = column[column.length - 1];
      for (let i = 0; i < 4; i++) {
        if (canMoveToFoundation(card, state.foundations[i])) {
          pushUndo(state);
          state.foundations[i].push(column.pop());
          state.score += 10;
          state.moves++;
          moved++;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (found) continue;
    for (let i = 0; i < 4; i++) {
      const card = state.freeCells[i];
      if (!card) continue;
      for (let j = 0; j < 4; j++) {
        if (canMoveToFoundation(card, state.foundations[j])) {
          pushUndo(state);
          state.foundations[j].push(card);
          state.freeCells[i] = null;
          state.score += 10;
          state.moves++;
          moved++;
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }
  return moved;
}

export function isGameWon(state) {
  return state.foundations.every((f) => f.length === 13);
}
