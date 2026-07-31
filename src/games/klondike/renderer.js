/**
 * Klondike renderer — builds and updates the DOM.
 *
 * On new game: full render with deal animation.
 * On moves: animate the card(s) with CSS transition, then sync DOM.
 */

import { createCardElement } from '../../lib/dom.js';
import { showModal } from '../../lib/modal.js';
import { getStats, recordGame, resetStats, getAllStats } from '../../lib/stats.js';
import {
  playClick,
  playSlide,
  playFoundation,
  playVictory,
} from '../../lib/sound.js';
import {
  createKlondike,
  drawStock,
  wasteToFoundation,
  wasteToTableau,
  moveTableauRun,
  tableauToFoundation,
  foundationToTableau,
  getTableauRunStart,
  findAutoDestination,
  findHint,
  undo,
  autoComplete,
  isGameWon,
  formatTime,
  tickTimer,
  stopTimer,
} from './klondike.js';

let currentState = null;
let timerInterval = null;
let animating = false;

/* ─── Timer ─── */

function startTimerDisplay(state) {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    tickTimer(state);
    const timerEl = document.getElementById('timer-display');
    if (timerEl) timerEl.textContent = formatTime(state.elapsed);
  }, 1000);
}

function stopTimerDisplay() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

/* ─── Animated move helper ─── */

/**
 * Animate a card element from its current position to a target element,
 * then call rerender() to sync the DOM with the new state.
 */
function animateCard(cardEl, targetEl, callback) {
  if (animating) { callback(); return; }
  animating = true;

  const cardRect = cardEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  const dx = targetRect.left - cardRect.left;
  const dy = targetRect.top - cardRect.top;

  // Move card to a fixed position for the animation
  const clone = cardEl.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.left = `${cardRect.left}px`;
  clone.style.top = `${cardRect.top}px`;
  clone.style.width = `${cardRect.width}px`;
  clone.style.height = `${cardRect.height}px`;
  clone.style.zIndex = 9999;
  clone.style.transition = 'transform 0.2s ease-in-out';
  clone.style.pointerEvents = 'none';
  clone.style.margin = '0';
  document.body.appendChild(clone);

  // Trigger animation
  requestAnimationFrame(() => {
    clone.style.transform = `translate(${dx}px, ${dy}px) rotate(3deg)`;
  });

  // After animation, remove clone and rerender
  setTimeout(() => {
    clone.remove();
    animating = false;
    callback();
  }, 220);
}

/**
 * Animate multiple cards sequentially (for auto-complete).
 */
function animateCardsSequentially(cards, callback) {
  if (animating || cards.length === 0) { callback(); return; }
  animating = true;

  let index = 0;
  function animateNext() {
    if (index >= cards.length) {
      animating = false;
      callback();
      return;
    }
    const { cardEl, targetEl } = cards[index];
    const cardRect = cardEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const dx = targetRect.left - cardRect.left;
    const dy = targetRect.top - cardRect.top;

    const clone = cardEl.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = `${cardRect.left}px`;
    clone.style.top = `${cardRect.top}px`;
    clone.style.width = `${cardRect.width}px`;
    clone.style.height = `${cardRect.height}px`;
    clone.style.zIndex = 9999;
    clone.style.transition = 'transform 0.15s ease-in-out';
    clone.style.pointerEvents = 'none';
    clone.style.margin = '0';
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.transform = `translate(${dx}px, ${dy}px) rotate(2deg)`;
    });

    setTimeout(() => {
      clone.remove();
      index++;
      setTimeout(animateNext, 40);
    }, 180);
  }

  animateNext();
}

/* ─── Main render ─── */

export function renderKlondike(container, state, isNew = false) {
  currentState = state;
  stopTimerDisplay();
  container.innerHTML = '';
  const table = document.createElement('div');
  table.className = 'klondike-tableau';

  // Score bar
  const scoreBar = document.createElement('div');
  scoreBar.className = 'score-bar';
  const scoringLabel = state.scoringMode === 'vegas' ? 'Vegas' : 'Score';
  scoreBar.innerHTML = `
    <span>⏱ <span id="timer-display">${formatTime(state.elapsed)}</span></span>
    <span>${scoringLabel}: <span class="score-value">${state.score}</span></span>
    <span>Moves: <span class="moves-value">${state.moves}</span></span>
  `;
  table.appendChild(scoreBar);

  // Top row
  const topRow = document.createElement('div');
  topRow.className = 'klondike-top';

  const stockArea = document.createElement('div');
  stockArea.className = 'klondike-stock-area';
  stockArea.appendChild(createStockElement(state));
  stockArea.appendChild(createWasteElement(state));
  topRow.appendChild(stockArea);

  const foundationsEl = document.createElement('div');
  foundationsEl.className = 'klondike-foundations';
  state.foundations.forEach((_, i) => {
    foundationsEl.appendChild(createFoundationElement(state, i));
  });
  topRow.appendChild(foundationsEl);
  table.appendChild(topRow);

  // Tableau columns
  const columnsEl = document.createElement('div');
  columnsEl.className = 'klondike-columns';
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
  autoBtn.addEventListener('click', () => {
    clearHint();
    const moved = autoComplete(state);
    if (moved > 0) rerender(state);
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
    if (state.moves === 0) {
      const ns = createKlondike(state.drawMode, state.scoringMode);
      renderKlondike(document.getElementById('game-container'), ns, true);
      return;
    }
    const confirmed = await showModal({
      title: 'New Game',
      message: 'Start a new game? Current progress will be lost.',
      confirmText: 'New Game',
      cancelText: 'Cancel',
    });
    if (confirmed) {
      const ns = createKlondike(state.drawMode, state.scoringMode);
      renderKlondike(document.getElementById('game-container'), ns, true);
    }
  });
  bottomBar.appendChild(newGameBtn);
  container.appendChild(bottomBar);

  // Win
  if (isGameWon(state)) {
    stopTimer(state);
    stopTimerDisplay();
    const modeKey = `draw${state.drawMode}-${state.scoringMode}`;
    recordGame('klondike', modeKey, true, state.elapsed, state.score, state.moves);
    const stats = getStats('klondike', modeKey);
    const wb = document.createElement('div');
    wb.className = 'win-banner';
    wb.innerHTML = `🎉 You Win! 🎉<small>Time: ${formatTime(state.elapsed)} · Score: ${state.score} · Moves: ${state.moves}<br>Best: ${formatTime(stats.bestTime || 0)} / ${stats.bestScore || 0} pts (${stats.won}/${stats.played} won)</small>`;
    container.appendChild(wb);
    spawnConfetti();
    playVictory();
  }

  startTimerDisplay(state);
}

function rerender(state) {
  renderKlondike(document.getElementById('game-container'), state, false);
}

/* ─── Stock ─── */

function createStockElement(state) {
  const el = document.createElement('div');
  el.className = 'stock-pile';
  el.dataset.pile = 'stock';
  if (state.stock.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'stock-empty';
    empty.textContent = '↻';
    empty.addEventListener('click', () => { drawStock(state); playClick(); rerender(state); });
    el.appendChild(empty);
  } else {
    const card = state.stock[state.stock.length - 1];
    const cardEl = createCardElement(card);
    cardEl.addEventListener('click', () => { drawStock(state); playClick(); rerender(state); });
    el.appendChild(cardEl);
  }
  return el;
}

/* ─── Waste ─── */

function createWasteElement(state) {
  const el = document.createElement('div');
  el.className = 'waste-pile';
  el.dataset.pile = 'waste';
  if (state.waste.length > 0) {
    const visibleCount = Math.min(state.waste.length, 3);
    const startIdx = state.waste.length - visibleCount;
    for (let i = startIdx; i < state.waste.length; i++) {
      const card = state.waste[i];
      const cardEl = createCardElement(card);
      cardEl.style.left = `${(i - startIdx) * 12}px`;
      cardEl.style.zIndex = i;
      if (i === state.waste.length - 1) {
        cardEl.draggable = true;
        cardEl.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', 'waste-top'));
        cardEl.addEventListener('dblclick', () => {
          const dest = findAutoDestination(state, card, 'waste', null, null);
          if (dest) {
            if (dest.type === 'foundation') wasteToFoundation(state, dest.index);
            else if (dest.type === 'tableau') wasteToTableau(state, dest.index);
            rerender(state);
          }
        });
      }
      el.appendChild(cardEl);
    }
  } else {
    const empty = document.createElement('div');
    empty.className = 'pile-target';
    el.appendChild(empty);
  }
  return el;
}

/* ─── Foundation ─── */

function createFoundationElement(state, index) {
  const el = document.createElement('div');
  el.className = 'foundation';
  el.dataset.pile = 'foundation';
  el.dataset.foundationIndex = index;

  const pile = state.foundations[index];
  if (pile.length > 0) {
    const card = pile[pile.length - 1];
    const cardEl = createCardElement(card);
    cardEl.draggable = true;
    cardEl.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', `foundation-${index}`));
    el.appendChild(cardEl);
  } else {
    const target = document.createElement('div');
    target.className = 'pile-target';
    el.appendChild(target);
  }

  el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('drag-over');
    const data = e.dataTransfer.getData('text/plain');
    let moved = false;
    if (data === 'waste-top') moved = wasteToFoundation(state, index);
    else if (data.startsWith('tableau-')) {
      const colIdx = parseInt(data.split('-')[1], 10);
      moved = tableauToFoundation(state, colIdx, index);
    }
    if (moved) { playFoundation(); rerender(state); }
  });

  return el;
}

/* ─── Tableau Column ─── */

function createColumnElement(state, colIndex, isNew) {
  const el = document.createElement('div');
  el.className = 'klondike-column';
  el.dataset.pile = 'column';
  el.dataset.columnIndex = colIndex;

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
      const cardEl = createCardElement(card);
      cardEl.style.top = `${cardIndex * 24}px`;
      cardEl.style.zIndex = cardIndex;
      if (isNew) {
        cardEl.classList.add('dealing');
        cardEl.style.animationDelay = `${(colIndex * 0.08 + cardIndex * 0.04)}s`;
      }
      if (card.faceUp) {
        cardEl.draggable = true;
        cardEl.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', `tableau-${colIndex}-${cardIndex}`));
        cardEl.addEventListener('dblclick', () => {
          const runStart = getTableauRunStart(state.tableau[colIndex], cardIndex);
          if (runStart === -1) return;
          const runCard = state.tableau[colIndex][runStart];
          const dest = findAutoDestination(state, runCard, 'tableau', colIndex, cardIndex);
          if (dest) {
            if (dest.type === 'foundation' && cardIndex === column.length - 1) tableauToFoundation(state, colIndex, dest.index);
            else if (dest.type === 'tableau') moveTableauRun(state, colIndex, runStart, dest.index);
            rerender(state);
          }
        });
      }
      pileEl.appendChild(cardEl);
    });
    const lastCardOffset = (column.length - 1) * 24;
    pileEl.style.height = `${lastCardOffset + 112}px`;
  }

  pileEl.addEventListener('dragover', (e) => { e.preventDefault(); pileEl.classList.add('drag-over'); });
  pileEl.addEventListener('dragleave', () => pileEl.classList.remove('drag-over'));
  pileEl.addEventListener('drop', (e) => {
    e.preventDefault();
    pileEl.classList.remove('drag-over');
    const data = e.dataTransfer.getData('text/plain');
    let moved = false;
    if (data === 'waste-top') moved = wasteToTableau(state, colIndex);
    else if (data.startsWith('tableau-')) {
      const parts = data.split('-');
      const srcCol = parseInt(parts[1], 10);
      const cardIdx = parseInt(parts[2], 10);
      if (srcCol !== colIndex) moved = moveTableauRun(state, srcCol, cardIdx, colIndex);
    } else if (data.startsWith('foundation-')) {
      const fIdx = parseInt(data.split('-')[1], 10);
      moved = foundationToTableau(state, fIdx, colIndex);
    }
    if (moved) playSlide();
    rerender(state);
  });

  el.appendChild(pileEl);
  return el;
}

/* ─── Hint ─── */

function clearHint() {
  document.querySelectorAll('.hint-source, .hint-target').forEach(el => el.classList.remove('hint-source', 'hint-target'));
}

function showHint(hint) {
  let sourceEl = null;
  if (hint.source === 'waste') sourceEl = document.querySelector('.waste-pile .card:last-child');
  else if (hint.source === 'tableau') {
    const col = document.querySelectorAll('.klondike-column')[hint.sourceIndex];
    if (col) sourceEl = col.querySelectorAll('.card')[hint.cardIndex];
  }
  let destEl = null;
  if (hint.dest === 'foundation') destEl = document.querySelectorAll('.foundation')[hint.destIndex];
  else if (hint.dest === 'tableau') destEl = document.querySelectorAll('.klondike-column')[hint.destIndex];
  if (sourceEl) sourceEl.classList.add('hint-source');
  if (destEl) destEl.classList.add('hint-target');
  setTimeout(clearHint, 3000);
}

/* ─── Stats Panel ─── */

function showStatsPanel(state) {
  const allStats = getAllStats('klondike');
  const modeKey = `draw${state.drawMode}-${state.scoringMode}`;
  let html = '<div class="stats-content">';
  if (Object.keys(allStats).length === 0) {
    html += '<p class="stats-empty">No games played yet.</p>';
  } else {
    html += '<table class="stats-table"><tr><th>Mode</th><th>Played</th><th>Won</th><th>Best Time</th><th>Best Score</th></tr>';
    for (const [mode, s] of Object.entries(allStats)) {
      html += `<tr class="${mode === modeKey ? 'stats-current' : ''}"><td>${mode}</td><td>${s.played}</td><td>${s.won}</td><td>${s.bestTime ? formatTime(s.bestTime) : '—'}</td><td>${s.bestScore ?? '—'}</td></tr>`;
    }
    html += '</table>';
  }
  html += `<div class="stats-actions"><button class="action-btn" id="stats-reset-btn">🗑 Reset All</button><button class="action-btn" id="stats-close-btn">Close</button></div></div>`;
  showModal({ title: '📊 Statistics', message: html, confirmText: 'Close', cancelText: null });
  setTimeout(() => {
    const resetBtn = document.getElementById('stats-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      showModal({ title: 'Reset Stats', message: 'Are you sure you want to reset all statistics?', confirmText: 'Reset', cancelText: 'Cancel' }).then(confirmed => {
        if (confirmed) { resetStats('klondike'); showStatsPanel(state); }
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
