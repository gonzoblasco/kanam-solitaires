/**
 * Spider Solitaire — renderer.
 */

import { announce } from '../../lib/announcer.js';
import { createCardElement } from '../../lib/dom.js';
import { showHelpModal, showModal } from '../../lib/modal.js';
import { playClick, playFoundation, playSlide, playVictory } from '../../lib/sound.js';
import { getAllStats, getStats, recordGame, resetStats } from '../../lib/stats.js';
import {
  autoComplete,
  createSpider,
  drawStock,
  findHint,
  formatTime,
  isGameWon,
  moveRun,
  stopTimer,
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

/* ─── Timer ─── */
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

export function renderSpider(container, state, isNew = false) {
  currentState = state;
  stopTimerDisplay();
  container.innerHTML = '';
  const table = document.createElement('div');
  table.className = 'spider-tableau';

  // Score bar
  const scoreBar = document.createElement('div');
  scoreBar.className = 'score-bar';
  scoreBar.setAttribute('aria-live', 'polite');
  scoreBar.setAttribute('aria-atomic', 'true');
  scoreBar.innerHTML = `<span>⏱ <span id="timer-display" aria-live="off">${formatTime(state.elapsed)}</span></span> <span>Runs: <span class="runs-value" aria-live="off">${state.completedRuns}/8</span></span> <span>Score: <span class="score-value" aria-live="off">${state.score}</span></span> <span>Moves: <span class="moves-value" aria-live="off">${state.moves}</span></span>`;
  table.appendChild(scoreBar);

  // Top: stock
  const topRow = document.createElement('div');
  topRow.className = 'spider-top';
  topRow.setAttribute('role', 'group');
  topRow.setAttribute('aria-label', 'Stock pile');
  topRow.appendChild(createStockElement(state));
  table.appendChild(topRow);

  // Columns
  const columnsEl = document.createElement('div');
  columnsEl.className = 'spider-columns';
  columnsEl.setAttribute('role', 'group');
  columnsEl.setAttribute('aria-label', 'Tableau columns');
  state.tableau.forEach((_, i) => {
    columnsEl.appendChild(createColumnElement(state, i, isNew));
  });
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
    if (state.moves === 0) {
      const ns = createSpider(state.difficulty, state.variant);
      renderSpider(document.getElementById('game-container'), ns, true);
      return;
    }
    const confirmed = await showModal({
      title: 'New Game',
      message: 'Start a new game? Current progress will be lost.',
      confirmText: 'New Game',
      cancelText: 'Cancel',
    });
    if (confirmed) {
      const ns = createSpider(state.difficulty, state.variant);
      renderSpider(document.getElementById('game-container'), ns, true);
    }
  });
  bottomBar.appendChild(newGameBtn);

  const helpBtn = document.createElement('button');
  helpBtn.className = 'action-btn';
  helpBtn.textContent = '❓ Help';
  helpBtn.addEventListener('click', () => showHelpModal('spider'));
  bottomBar.appendChild(helpBtn);

  container.appendChild(bottomBar);

  // Win
  if (isGameWon(state)) {
    stopTimer(state);
    stopTimerDisplay();
    const modeKey = `diff${state.difficulty}-${state.variant ?? 'classic'}`;
    recordGame('spider', modeKey, true, state.elapsed, state.score, state.moves);
    const stats = getStats('spider', modeKey);
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
  renderSpider(document.getElementById('game-container'), state, false);
}

function createStockElement(state) {
  const el = document.createElement('div');
  el.className = 'spider-stock';
  if (state.stock.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'stock-empty';
    empty.textContent = '—';
    el.appendChild(empty);
  } else {
    const card = state.stock[state.stock.length - 1];
    const cardEl = createCardElement(card);
    cardEl.addEventListener('click', () => {
      drawStock(state);
      announce(`Drew ${Math.min(10, state.stock.length)} cards. ${state.stock.length} remaining.`);
      playClick();
      rerender(state);
    });
    el.appendChild(cardEl);
    // Show count
    const count = document.createElement('span');
    count.className = 'stock-count';
    count.textContent = `${state.stock.length}`;
    el.appendChild(count);
  }
  return el;
}

function createColumnElement(state, colIndex, isNew) {
  const el = document.createElement('div');
  el.className = 'spider-column';
  el.dataset.columnIndex = colIndex;
  el.setAttribute('role', 'list');
  el.setAttribute('aria-label', `Column ${colIndex + 1}, ${state.tableau[colIndex].length} cards`);

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
        label: card.faceUp ? `${card.rank} of ${getSuitName(card.suit)}, column ${colIndex + 1}` : 'Face-down card',
      });
      const overlap = card.faceUp ? 20 : 8;
      cardEl.style.top = `${cardIndex * overlap}px`;
      cardEl.style.zIndex = cardIndex;
      if (isNew) {
        cardEl.classList.add('dealing');
        cardEl.style.animationDelay = `${colIndex * 0.08 + cardIndex * 0.04}s`;
      }
      if (card.faceUp) {
        cardEl.draggable = true;
        cardEl.addEventListener('dragstart', (e) =>
          e.dataTransfer.setData('text/plain', `spider-${colIndex}-${cardIndex}`),
        );
      }
      pileEl.appendChild(cardEl);
    });
    const lastOverlap = column[column.length - 1].faceUp ? 20 : 8;
    const lastCardOffset = (column.length - 1) * lastOverlap;
    pileEl.style.height = `${lastCardOffset + 112}px`;
  }

  pileEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    pileEl.classList.add('drag-over');
  });
  pileEl.addEventListener('dragleave', () => pileEl.classList.remove('drag-over'));
  pileEl.addEventListener('drop', (e) => {
    e.preventDefault();
    pileEl.classList.remove('drag-over');
    const data = e.dataTransfer.getData('text/plain');
    let moved = false;
    if (data.startsWith('spider-')) {
      const parts = data.split('-');
      const srcCol = Number.parseInt(parts[1], 10);
      const cardIdx = Number.parseInt(parts[2], 10);
      if (srcCol !== colIndex) moved = moveRun(state, srcCol, cardIdx, colIndex);
    }
    if (moved) {
      playSlide();
      announce(`Moved cards to column ${colIndex + 1}`);
    }
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
    const col = document.querySelectorAll('.spider-column')[hint.sourceIndex];
    if (col) sourceEl = col.querySelectorAll('.card')[hint.cardIndex];
  }
  let destEl = null;
  if (hint.dest === 'tableau') destEl = document.querySelectorAll('.spider-column')[hint.destIndex];
  if (sourceEl) sourceEl.classList.add('hint-source');
  if (destEl) destEl.classList.add('hint-target');
  setTimeout(clearHint, 3000);
}

/* ─── Stats Panel ─── */

function showStatsPanel(state) {
  const allStats = getAllStats('spider');
  const modeKey = `diff${state.difficulty}-${state.variant}`;
  let html = '<div class="stats-content">';
  if (Object.keys(allStats).length === 0) {
    html += '<p class="stats-empty">No games played yet.</p>';
  } else {
    html +=
      '<table class="stats-table"><tr><th>Mode</th><th>Played</th><th>Won</th><th>Best Time</th><th>Best Score</th></tr>';
    for (const [mode, s] of Object.entries(allStats)) {
      html += `<tr class="${mode === modeKey ? 'stats-current' : ''}"><td>${mode}</td><td>${s.played}</td><td>${s.won}</td><td>${s.bestTime ? formatTime(s.bestTime) : '—'}</td><td>${s.bestScore ?? '—'}</td></tr>`;
    }
    html += '</table>';
  }
  html += `<div class="stats-actions"><button class="action-btn" id="stats-reset-btn">🗑 Reset All</button><button class="action-btn" id="stats-close-btn">Close</button></div></div>`;
  showModal({ title: '📊 Statistics', message: html, confirmText: 'Close', cancelText: null });
  setTimeout(() => {
    const resetBtn = document.getElementById('stats-reset-btn');
    if (resetBtn)
      resetBtn.addEventListener('click', () => {
        showModal({
          title: 'Reset Stats',
          message: 'Are you sure you want to reset all statistics?',
          confirmText: 'Reset',
          cancelText: 'Cancel',
        }).then((confirmed) => {
          if (confirmed) {
            resetStats('spider');
            showStatsPanel(state);
          }
        });
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
