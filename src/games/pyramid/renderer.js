/**
 * Pyramid Solitaire — renderer.
 */

import { createCardElement } from '../../lib/dom.js';
import { showModal } from '../../lib/modal.js';
import { getStats, recordGame, resetStats, getAllStats } from '../../lib/stats.js';
import { playClick, playSlide, playFoundation, playVictory } from '../../lib/sound.js';
import {
  createPyramid,
  drawStock,
  toggleSelect,
  removeSelected,
  selectWaste,
  findHint,
  undo,
  autoComplete,
  isGameWon,
  formatTime,
  tickTimer,
  stopTimer,
} from './logic.js';

let currentState = null;
let timerInterval = null;

function startTimerDisplay(state) {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    tickTimer(state);
    const el = document.getElementById('timer-display');
    if (el) el.textContent = formatTime(state.elapsed);
  }, 1000);
}

function stopTimerDisplay() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

export function renderPyramid(container, state, isNew = false) {
  currentState = state;
  stopTimerDisplay();
  container.innerHTML = '';
  const table = document.createElement('div');
  table.className = 'pyramid-tableau';

  // Score bar
  const scoreBar = document.createElement('div');
  scoreBar.className = 'score-bar';
  scoreBar.innerHTML = `<span>⏱ <span id="timer-display">${formatTime(state.elapsed)}</span></span> <span>Score: <span class="score-value">${state.score}</span></span> <span>Moves: <span class="moves-value">${state.moves}</span></span>`;
  table.appendChild(scoreBar);

  // Stock + Waste
  const topRow = document.createElement('div');
  topRow.className = 'pyramid-top';
  topRow.appendChild(createStockElement(state));
  topRow.appendChild(createWasteElement(state));
  table.appendChild(topRow);

  // Pyramid
  const pyramidEl = document.createElement('div');
  pyramidEl.className = 'pyramid-grid';
  state.pyramid.forEach((row, rowIdx) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'pyramid-row';
    rowEl.style.zIndex = 7 - rowIdx;
    row.forEach((card, colIdx) => {
      const cardEl = createCardElement(card);
      cardEl.dataset.row = rowIdx;
      cardEl.dataset.col = colIdx;

      if (card.removed) {
        cardEl.classList.add('card-removed');
      } else {
        const isSelected = state.selected.some(s => s.row === rowIdx && s.col === colIdx);
        if (isSelected) cardEl.classList.add('selected');

        cardEl.addEventListener('click', () => {
          toggleSelect(state, rowIdx, colIdx);
          rerender(state);
        });
      }

      rowEl.appendChild(cardEl);
    });
    pyramidEl.appendChild(rowEl);
  });
  table.appendChild(pyramidEl);

  // Remove button (when 1-2 cards selected)
  if (state.selected.length > 0) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'action-btn pyramid-remove-btn';
    removeBtn.textContent = state.selected.length === 1 ? '🗑 Remove King' : '🗑 Remove Pair';
    removeBtn.addEventListener('click', () => {
      if (removeSelected(state)) {
        playFoundation();
        rerender(state);
      }
    });
    table.appendChild(removeBtn);
  }

  container.appendChild(table);

  // Bottom bar
  const bottomBar = document.createElement('div');
  bottomBar.className = 'bottom-bar';

  const undoBtn = document.createElement('button');
  undoBtn.className = 'action-btn';
  undoBtn.textContent = '↩ Undo';
  undoBtn.disabled = state.history.length === 0;
  undoBtn.addEventListener('click', () => { clearHint(); undo(state); rerender(state); });
  bottomBar.appendChild(undoBtn);

  const hintBtn = document.createElement('button');
  hintBtn.className = 'action-btn';
  hintBtn.textContent = '💡 Hint';
  hintBtn.addEventListener('click', () => { clearHint(); const h = findHint(state); if (h) showHint(h); });
  bottomBar.appendChild(hintBtn);

  const autoBtn = document.createElement('button');
  autoBtn.className = 'action-btn';
  autoBtn.textContent = '✨ Auto';
  autoBtn.addEventListener('click', () => { clearHint(); const m = autoComplete(state); if (m > 0) rerender(state); });
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
    if (state.moves === 0) { const ns = createPyramid(); renderPyramid(document.getElementById('game-container'), ns, true); return; }
    const confirmed = await showModal({ title: 'New Game', message: 'Start a new game? Current progress will be lost.', confirmText: 'New Game', cancelText: 'Cancel' });
    if (confirmed) { const ns = createPyramid(); renderPyramid(document.getElementById('game-container'), ns, true); }
  });
  bottomBar.appendChild(newGameBtn);
  container.appendChild(bottomBar);

  // Win
  if (isGameWon(state)) {
    stopTimer(state); stopTimerDisplay();
    const modeKey = 'pyramid';
    recordGame('pyramid', modeKey, true, state.elapsed, state.score, state.moves);
    const stats = getStats('pyramid', modeKey);
    const wb = document.createElement('div');
    wb.className = 'win-banner';
    wb.innerHTML = `🎉 You Win! 🎉<small>Time: ${formatTime(state.elapsed)} · Score: ${state.score} · Moves: ${state.moves}<br>Best: ${formatTime(stats.bestTime || 0)} / ${stats.bestScore || 0} pts (${stats.won}/${stats.played} won)</small>`;
    container.appendChild(wb);
    spawnConfetti(); playVictory();
  }

  startTimerDisplay(state);
}

function rerender(state) { renderPyramid(document.getElementById('game-container'), state, false); }

function createStockElement(state) {
  const el = document.createElement('div');
  el.className = 'pyramid-stock';
  if (state.stock.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'stock-empty';
    empty.textContent = '—';
    el.appendChild(empty);
  } else {
    const card = state.stock[state.stock.length - 1];
    const cardEl = createCardElement(card);
    cardEl.addEventListener('click', () => { drawStock(state); playClick(); rerender(state); });
    el.appendChild(cardEl);
  }
  return el;
}

function createWasteElement(state) {
  const el = document.createElement('div');
  el.className = 'pyramid-waste';
  if (state.waste.length > 0) {
    const card = state.waste[state.waste.length - 1];
    const cardEl = createCardElement(card);
    cardEl.addEventListener('click', () => {
      selectWaste(state);
      rerender(state);
    });
    el.appendChild(cardEl);
  } else {
    const empty = document.createElement('div');
    empty.className = 'pile-target';
    el.appendChild(empty);
  }
  return el;
}

/* ─── Hint ─── */

function clearHint() {
  document.querySelectorAll('.hint-source, .hint-target').forEach(el => el.classList.remove('hint-source', 'hint-target'));
}

function showHint(hint) {
  if (hint.type === 'pyramid-pair') {
    const cards = document.querySelectorAll('.pyramid-grid .card');
    cards.forEach(el => {
      const row = parseInt(el.dataset.row);
      const col = parseInt(el.dataset.col);
      if ((row === hint.cards[0].row && col === hint.cards[0].col) ||
          (row === hint.cards[1].row && col === hint.cards[1].col)) {
        el.classList.add('hint-source');
      }
    });
  } else if (hint.type === 'pyramid-king') {
    const cards = document.querySelectorAll('.pyramid-grid .card');
    cards.forEach(el => {
      if (parseInt(el.dataset.row) === hint.card.row && parseInt(el.dataset.col) === hint.card.col) {
        el.classList.add('hint-source');
      }
    });
  } else if (hint.type === 'waste-king') {
    const wasteEl = document.querySelector('.pyramid-waste .card');
    if (wasteEl) wasteEl.classList.add('hint-source');
  } else if (hint.type === 'waste-pyramid') {
    const wasteEl = document.querySelector('.pyramid-waste .card');
    if (wasteEl) wasteEl.classList.add('hint-source');
    const cards = document.querySelectorAll('.pyramid-grid .card');
    cards.forEach(el => {
      if (parseInt(el.dataset.row) === hint.pyramidCard.row && parseInt(el.dataset.col) === hint.pyramidCard.col) {
        el.classList.add('hint-target');
      }
    });
  }
  setTimeout(clearHint, 3000);
}

/* ─── Stats Panel ─── */

function showStatsPanel(state) {
  const allStats = getAllStats('pyramid');
  let html = '<div class="stats-content">';
  if (Object.keys(allStats).length === 0) html += '<p class="stats-empty">No games played yet.</p>';
  else {
    html += '<table class="stats-table"><tr><th>Mode</th><th>Played</th><th>Won</th><th>Best Time</th><th>Best Score</th></tr>';
    for (const [mode, s] of Object.entries(allStats)) {
      html += `<tr><td>${mode}</td><td>${s.played}</td><td>${s.won}</td><td>${s.bestTime ? formatTime(s.bestTime) : '—'}</td><td>${s.bestScore ?? '—'}</td></tr>`;
    }
    html += '</table>';
  }
  html += `<div class="stats-actions"><button class="action-btn" id="stats-reset-btn">🗑 Reset All</button><button class="action-btn" id="stats-close-btn">Close</button></div></div>`;
  showModal({ title: '📊 Statistics', message: html, confirmText: 'Close', cancelText: null });
  setTimeout(() => {
    document.getElementById('stats-reset-btn')?.addEventListener('click', () => {
      showModal({ title: 'Reset Stats', message: 'Are you sure?', confirmText: 'Reset', cancelText: 'Cancel' }).then(c => { if (c) { resetStats('pyramid'); showStatsPanel(state); } });
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
