/**
 * FreeCell Solitaire — renderer.
 */

import { announce } from '../../lib/announcer.js';
import { createCardElement } from '../../lib/dom.js';
import { showHelpModal, showModal } from '../../lib/modal.js';
import { saveGameState } from '../../lib/saveState.js';
import { playClick, playFoundation, playSlide, playVictory } from '../../lib/sound.js';
import { getAllStats, getStats, recordGame, resetStats, startGame } from '../../lib/stats.js';
import {
  autoComplete,
  createFreeCell,
  findHint,
  formatTime,
  freeCellToFoundation,
  isGameWon,
  moveFromFreeCell,
  moveRun,
  moveToFreeCell,
  stopTimer,
  tableauToFoundation,
  tickTimer,
  undo,
} from './logic.js';

let currentState = null;
let timerInterval = null;
const animating = false;

const SUIT_NAMES = {
  '♠': 'Spades',
  '♥': 'Hearts',
  '♦': 'Diamonds',
  '♣': 'Clubs',
};

function getSuitName(suit) {
  return SUIT_NAMES[suit] || suit;
}

function startTimerDisplay(state) {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    tickTimer(state);
    const el = document.getElementById('timer-display');
    if (el) el.textContent = formatTime(state.elapsed);
  }, 1000);
}

function stopTimerDisplay() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function renderFreeCell(container, state, isNew = false) {
  currentState = state;
  if (isNew) {
    stopTimerDisplay();
  }
  container.innerHTML = '';
  const table = document.createElement('div');
  table.className = 'freecell-tableau';

  // Score bar
  const scoreBar = document.createElement('div');
  scoreBar.className = 'score-bar';
  scoreBar.setAttribute('aria-live', 'polite');
  scoreBar.setAttribute('aria-atomic', 'true');
  scoreBar.innerHTML = `<span>⏱ <span id="timer-display" aria-live="off">${formatTime(state.elapsed)}</span></span> <span>Score: <span class="score-value" aria-live="off">${state.score}</span></span> <span>Moves: <span class="moves-value" aria-live="off">${state.moves}</span></span>`;
  table.appendChild(scoreBar);

  // Top row: free cells + foundations
  const topRow = document.createElement('div');
  topRow.className = 'freecell-top';

  const freeCellsEl = document.createElement('div');
  freeCellsEl.className = 'freecell-cells';
  freeCellsEl.setAttribute('role', 'group');
  freeCellsEl.setAttribute('aria-label', 'Free cells');
  state.freeCells.forEach((_, i) => freeCellsEl.appendChild(createFreeCellElement(state, i)));
  topRow.appendChild(freeCellsEl);

  const foundationsEl = document.createElement('div');
  foundationsEl.className = 'freecell-foundations';
  foundationsEl.setAttribute('role', 'group');
  foundationsEl.setAttribute('aria-label', 'Foundation piles');
  state.foundations.forEach((_, i) => foundationsEl.appendChild(createFoundationElement(state, i)));
  topRow.appendChild(foundationsEl);

  table.appendChild(topRow);

  // Columns
  const columnsEl = document.createElement('div');
  columnsEl.className = 'freecell-columns';
  columnsEl.setAttribute('role', 'group');
  columnsEl.setAttribute('aria-label', 'Tableau columns');
  state.tableau.forEach((_, i) => columnsEl.appendChild(createColumnElement(state, i, isNew)));
  table.appendChild(columnsEl);
  container.appendChild(table);

  // Bottom bar
  const bottomBar = document.createElement('div');
  bottomBar.className = 'bottom-bar';

  const undoBtn = document.createElement('button');
  undoBtn.className = 'action-btn';
  undoBtn.textContent = '↩ Undo';
  undoBtn.disabled = state.history.length === 0;
  undoBtn.addEventListener('click', () => {
    clearHint();
    undo(state);
    announce('Undo');
    rerender(state);
  });
  bottomBar.appendChild(undoBtn);

  const hintBtn = document.createElement('button');
  hintBtn.className = 'action-btn';
  hintBtn.textContent = '💡 Hint';
  hintBtn.addEventListener('click', () => {
    clearHint();
    const h = findHint(state);
    if (h) showHint(h);
  });
  bottomBar.appendChild(hintBtn);

  const autoBtn = document.createElement('button');
  autoBtn.className = 'action-btn';
  autoBtn.textContent = '✨ Auto';
  autoBtn.addEventListener('click', () => {
    clearHint();
    const m = autoComplete(state);
    if (m > 0) rerender(state);
  });
  bottomBar.appendChild(autoBtn);

  const statsBtn = document.createElement('button');
  statsBtn.className = 'action-btn';
  statsBtn.textContent = '📊 Stats';
  statsBtn.addEventListener('click', () => showStatsPanel(state));
  bottomBar.appendChild(statsBtn);

  const newGameBtn = document.createElement('button');
  newGameBtn.className = 'action-btn new-game-btn';
  newGameBtn.textContent = '♠ New Game';
  newGameBtn.addEventListener('click', async () => {
    clearHint();
    const modeKey = state.variant ?? 'classic';
    if (state.moves > 0 && !state.won) {
      recordGame('freecell', modeKey, false, state.elapsed, state.score, state.moves);
    }
    if (state.moves === 0) {
      const ns = createFreeCell(state.variant);
      startGame('freecell', modeKey);
      renderFreeCell(document.getElementById('game-container'), ns, true);
      return;
    }
    const confirmed = await showModal({
      title: 'New Game',
      message: 'Start a new game? Current progress will be lost.',
      confirmText: 'New Game',
      cancelText: 'Cancel',
    });
    if (confirmed) {
      const ns = createFreeCell(state.variant);
      startGame('freecell', modeKey);
      renderFreeCell(document.getElementById('game-container'), ns, true);
    }
  });
  bottomBar.appendChild(newGameBtn);

  const helpBtn = document.createElement('button');
  helpBtn.className = 'action-btn';
  helpBtn.textContent = '❓ Help';
  helpBtn.addEventListener('click', () => showHelpModal('freecell'));
  bottomBar.appendChild(helpBtn);

  container.appendChild(bottomBar);

  // Win
  if (isGameWon(state)) {
    stopTimer(state);
    stopTimerDisplay();
    const modeKey = state.variant ?? 'classic';
    recordGame('freecell', modeKey, true, state.elapsed, state.score, state.moves);
    const stats = getStats('freecell', modeKey);
    const wb = document.createElement('div');
    wb.className = 'win-banner';
    wb.innerHTML = `🎉 You Win! 🎉<small>Time: ${formatTime(state.elapsed)} · Score: ${state.score} · Moves: ${state.moves}<br>Best: ${formatTime(stats.bestTime || 0)} / ${stats.bestScore || 0} pts (${stats.won}/${stats.played} won)</small>`;
    container.appendChild(wb);
    spawnConfetti();
    playVictory();
  } else if (isNew || !timerInterval) {
    startTimerDisplay(state);
  }
}

function rerender(state) {
  saveGameState('freecell', state);
  renderFreeCell(document.getElementById('game-container'), state, false);
}

function createFreeCellElement(state, index) {
  const el = document.createElement('div');
  el.className = 'freecell-slot';
  el.dataset.freecellIndex = index;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', `Free cell ${index + 1}, ${state.freeCells[index] ? 'occupied' : 'empty'}`);

  const card = state.freeCells[index];
  if (card) {
    const cardEl = createCardElement(card, {
      label: `${card.rank} of ${getSuitName(card.suit)}, free cell ${index + 1}`,
    });
    cardEl.draggable = true;
    cardEl.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', `freecell-${index}`));
    cardEl.addEventListener('dblclick', () => {
      for (let i = 0; i < 4; i++) {
        if (freeCellToFoundation(state, index, i)) {
          rerender(state);
          return;
        }
      }
    });
    el.appendChild(cardEl);
  } else {
    const target = document.createElement('div');
    target.className = 'pile-target';
    target.style.width = 'var(--card-width)';
    target.style.height = 'var(--card-height)';
    el.appendChild(target);
  }

  // Drop target
  el.addEventListener('dragover', (e) => e.preventDefault());
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data.startsWith('tableau-')) {
      const colIdx = Number.parseInt(data.split('-')[1], 10);
      moveToFreeCell(state, colIdx);
      rerender(state);
    }
  });

  return el;
}

function createFoundationElement(state, index) {
  const el = document.createElement('div');
  el.className = 'foundation';
  el.dataset.foundationIndex = index;
  el.setAttribute('role', 'button');
  const suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
  el.setAttribute('aria-label', `Foundation ${suits[index]}, ${state.foundations[index].length} cards`);

  const pile = state.foundations[index];
  if (pile.length > 0) {
    el.appendChild(
      createCardElement(pile[pile.length - 1], {
        label: `${pile[pile.length - 1].rank} of ${getSuitName(pile[pile.length - 1].suit)}, foundation ${suits[index]}`,
      }),
    );
  } else {
    const target = document.createElement('div');
    target.className = 'pile-target';
    target.style.width = 'var(--card-width)';
    target.style.height = 'var(--card-height)';
    el.appendChild(target);
  }

  el.addEventListener('dragover', (e) => e.preventDefault());
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    let moved = false;
    if (data.startsWith('tableau-')) {
      const colIdx = Number.parseInt(data.split('-')[1], 10);
      moved = tableauToFoundation(state, colIdx, index);
    } else if (data.startsWith('freecell-')) {
      const cellIdx = Number.parseInt(data.split('-')[1], 10);
      moved = freeCellToFoundation(state, cellIdx, index);
    }
    if (moved) playFoundation();
    rerender(state);
  });

  return el;
}

function createColumnElement(state, colIndex, isNew) {
  const el = document.createElement('div');
  el.className = 'freecell-column';
  el.dataset.columnIndex = colIndex;
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', `Tableau column ${colIndex + 1}, ${state.tableau[colIndex].length} cards`);

  const pileEl = document.createElement('div');
  pileEl.className = 'column-pile';
  const column = state.tableau[colIndex];

  if (column.length === 0) {
    const target = document.createElement('div');
    target.className = 'pile-target';
    target.style.width = 'var(--card-width)';
    target.style.height = 'var(--card-height)';
    pileEl.appendChild(target);
  } else {
    column.forEach((card, cardIndex) => {
      const cardEl = createCardElement(card, {
        label: `${card.rank} of ${getSuitName(card.suit)}, column ${colIndex + 1}`,
      });
      cardEl.style.top = `${cardIndex * 20}px`;
      cardEl.style.zIndex = cardIndex;
      if (isNew) {
        cardEl.classList.add('dealing');
        cardEl.style.animationDelay = `${colIndex * 0.08 + cardIndex * 0.04}s`;
      }
      cardEl.draggable = true;
      cardEl.addEventListener('dragstart', (e) =>
        e.dataTransfer.setData('text/plain', `tableau-${colIndex}-${cardIndex}`),
      );
      cardEl.addEventListener('dblclick', () => {
        for (let i = 0; i < 4; i++) {
          if (tableauToFoundation(state, colIndex, i)) {
            rerender(state);
            return;
          }
        }
      });
      pileEl.appendChild(cardEl);
    });
    pileEl.style.height = `${(column.length - 1) * 20 + 112}px`;
  }

  pileEl.addEventListener('dragover', (e) => e.preventDefault());
  pileEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    let moved = false;
    if (data.startsWith('tableau-')) {
      const parts = data.split('-');
      const srcCol = Number.parseInt(parts[1], 10);
      const cardIdx = Number.parseInt(parts[2], 10);
      if (srcCol !== colIndex) moved = moveRun(state, srcCol, cardIdx, colIndex);
    } else if (data.startsWith('freecell-')) {
      const cellIdx = Number.parseInt(data.split('-')[1], 10);
      moved = moveFromFreeCell(state, cellIdx, colIndex);
    }
    if (moved) playSlide();
    rerender(state);
  });

  el.appendChild(pileEl);
  return el;
}

/* ─── Hint ─── */

function clearHint() {
  document
    .querySelectorAll('.hint-source, .hint-target')
    .forEach((el) => el.classList.remove('hint-source', 'hint-target'));
}

function showHint(hint) {
  let sourceEl = null;
  if (hint.source === 'tableau') {
    const col = document.querySelectorAll('.freecell-column')[hint.sourceIndex];
    if (col) sourceEl = col.querySelectorAll('.card')[hint.cardIndex];
  } else if (hint.source === 'freecell') {
    sourceEl = document.querySelectorAll('.freecell-slot')[hint.sourceIndex]?.querySelector('.card');
  }
  let destEl = null;
  if (hint.dest === 'foundation') destEl = document.querySelectorAll('.foundation')[hint.destIndex];
  else if (hint.dest === 'tableau') destEl = document.querySelectorAll('.freecell-column')[hint.destIndex];
  if (sourceEl) sourceEl.classList.add('hint-source');
  if (destEl) destEl.classList.add('hint-target');
  setTimeout(clearHint, 3000);
}

/* ─── Stats Panel ─── */

function showStatsPanel(state) {
  const allStats = getAllStats('freecell');
  let html = '<div class="stats-content">';
  if (Object.keys(allStats).length === 0) html += '<p class="stats-empty">No games played yet.</p>';
  else {
    html +=
      '<table class="stats-table"><tr><th>Mode</th><th>Played</th><th>Won</th><th>Best Time</th><th>Best Score</th></tr>';
    for (const [mode, s] of Object.entries(allStats)) {
      html += `<tr><td>${mode}</td><td>${s.played}</td><td>${s.won}</td><td>${s.bestTime ? formatTime(s.bestTime) : '—'}</td><td>${s.bestScore ?? '—'}</td></tr>`;
    }
    html += '</table>';
  }
  html += `<div class="stats-actions"><button class="action-btn" id="stats-reset-btn">🗑 Reset All</button><button class="action-btn" id="stats-close-btn">Close</button></div></div>`;
  showModal({ title: '📊 Statistics', message: html, confirmText: 'Close', cancelText: null });
  setTimeout(() => {
    document.getElementById('stats-reset-btn')?.addEventListener('click', () => {
      showModal({ title: 'Reset Stats', message: 'Are you sure?', confirmText: 'Reset', cancelText: 'Cancel' }).then(
        (c) => {
          if (c) {
            resetStats('freecell');
            showStatsPanel(state);
          }
        },
      );
    });
  }, 50);
}

/* ─── Confetti ─── */

const CONFETTI_COLORS = ['#d4a017', '#c0392b', '#1a5276', '#27ae60', '#8e44ad', '#e67e22', '#fff'];

function spawnConfetti() {
  const c = document.createElement('div');
  c.className = 'confetti-container';
  document.body.appendChild(c);
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    p.style.width = `${6 + Math.random() * 6}px`;
    p.style.height = `${6 + Math.random() * 6}px`;
    p.style.animationDuration = `${2 + Math.random() * 2}s`;
    p.style.animationDelay = `${Math.random() * 1.5}s`;
    c.appendChild(p);
  }
  setTimeout(() => c.remove(), 4000);
}
