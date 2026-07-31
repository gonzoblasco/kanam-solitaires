/**
 * Klondike renderer — builds and updates the DOM.
 */

import { createCardElement } from '../../lib/dom.js';
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

function startTimerDisplay(state) {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    tickTimer(state);
    const timerEl = document.getElementById('timer-display');
    if (timerEl) {
      timerEl.textContent = formatTime(state.elapsed);
    }
  }, 1000);
}

function stopTimerDisplay() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function renderKlondike(container, state) {
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

  startTimerDisplay(state);

  // Top row: stock, waste, foundations
  const topRow = document.createElement('div');
  topRow.className = 'klondike-top';

  // Stock + Waste
  const stockArea = document.createElement('div');
  stockArea.className = 'klondike-stock-area';

  const stockEl = createStockElement(state);
  stockArea.appendChild(stockEl);

  const wasteEl = createWasteElement(state);
  stockArea.appendChild(wasteEl);

  topRow.appendChild(stockArea);

  // Foundations
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
    columnsEl.appendChild(createColumnElement(state, i));
  });
  table.appendChild(columnsEl);

  container.appendChild(table);

  // Bottom bar: undo, hint, auto-complete, new game
  const bottomBar = document.createElement('div');
  bottomBar.className = 'bottom-bar';

  const undoBtn = document.createElement('button');
  undoBtn.className = 'action-btn';
  undoBtn.textContent = '↩ Undo';
  undoBtn.disabled = state.history.length === 0;
  undoBtn.addEventListener('click', () => {
    clearHint();
    undo(state);
    rerender(state);
  });
  bottomBar.appendChild(undoBtn);

  const hintBtn = document.createElement('button');
  hintBtn.className = 'action-btn';
  hintBtn.textContent = '💡 Hint';
  hintBtn.addEventListener('click', () => {
    clearHint();
    const hint = findHint(state);
    if (hint) {
      showHint(hint);
    }
  });
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

  const newGameBtn = document.createElement('button');
  newGameBtn.className = 'action-btn new-game-btn';
  newGameBtn.textContent = '♠ New Game';
  newGameBtn.addEventListener('click', () => {
    clearHint();
    if (state.moves === 0 || confirm('Start a new game? Current progress will be lost.')) {
      const newState = createKlondike(state.drawMode);
      renderKlondike(document.getElementById('game-container'), newState);
    }
  });
  bottomBar.appendChild(newGameBtn);

  container.appendChild(bottomBar);

  // Win banner
  if (isGameWon(state)) {
    stopTimer(state);
    stopTimerDisplay();
    const winBanner = document.createElement('div');
    winBanner.className = 'win-banner';
    winBanner.innerHTML = '🎉 You Win! 🎉<br><small>Time: ' + formatTime(state.elapsed) + ' · Score: ' + state.score + ' · Moves: ' + state.moves + '</small>';
    container.appendChild(winBanner);
  }
}

function rerender(state) {
  renderKlondike(document.getElementById('game-container'), state);
}

function createStockElement(state) {
  const el = document.createElement('div');
  el.className = 'stock-pile';
  el.dataset.pile = 'stock';

  if (state.stock.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'stock-empty';
    empty.textContent = '↻';
    empty.addEventListener('click', () => {
      drawStock(state);
      rerender(state);
    });
    el.appendChild(empty);
  } else {
    const card = state.stock[state.stock.length - 1];
    const cardEl = createCardElement(card);
    cardEl.addEventListener('click', () => {
      drawStock(state);
      rerender(state);
    });
    el.appendChild(cardEl);
  }

  return el;
}

function createWasteElement(state) {
  const el = document.createElement('div');
  el.className = 'waste-pile';
  el.dataset.pile = 'waste';

  if (state.waste.length > 0) {
    // Show up to 3 cards overlapping for visual context
    const visibleCount = Math.min(state.waste.length, 3);
    const startIdx = state.waste.length - visibleCount;

    for (let i = startIdx; i < state.waste.length; i++) {
      const card = state.waste[i];
      const cardEl = createCardElement(card);
      cardEl.style.left = `${(i - startIdx) * 12}px`;
      cardEl.style.zIndex = i;

      // Only the top card is interactive
      if (i === state.waste.length - 1) {
        cardEl.draggable = true;
        cardEl.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', 'waste-top');
        });
        cardEl.addEventListener('dblclick', () => {
          const dest = findAutoDestination(state, card, 'waste', null, null);
          if (dest) {
            if (dest.type === 'foundation') {
              wasteToFoundation(state, dest.index);
            } else if (dest.type === 'tableau') {
              wasteToTableau(state, dest.index);
            }
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
    cardEl.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', `foundation-${index}`);
    });
    el.appendChild(cardEl);
  } else {
    const target = document.createElement('div');
    target.className = 'pile-target';
    el.appendChild(target);
  }

  // Drop target
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.classList.add('drag-over');
  });
  el.addEventListener('dragleave', () => {
    el.classList.remove('drag-over');
  });
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('drag-over');
    const data = e.dataTransfer.getData('text/plain');
    if (data === 'waste-top') {
      wasteToFoundation(state, index);
    } else if (data.startsWith('tableau-')) {
      const colIdx = parseInt(data.split('-')[1], 10);
      tableauToFoundation(state, colIdx, index);
    }
    rerender(state);
  });

  return el;
}

function createColumnElement(state, colIndex) {
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

      if (card.faceUp) {
        cardEl.draggable = true;
        cardEl.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', `tableau-${colIndex}-${cardIndex}`);
        });

        cardEl.addEventListener('dblclick', () => {
          const runStart = getTableauRunStart(state.tableau[colIndex], cardIndex);
          if (runStart === -1) return;

          const runCard = state.tableau[colIndex][runStart];
          const dest = findAutoDestination(state, runCard, 'tableau', colIndex, cardIndex);
          if (dest) {
            if (dest.type === 'foundation') {
              if (cardIndex === column.length - 1) {
                tableauToFoundation(state, colIndex, dest.index);
              }
            } else if (dest.type === 'tableau') {
              moveTableauRun(state, colIndex, runStart, dest.index);
            }
            rerender(state);
          }
        });
      }

      pileEl.appendChild(cardEl);
    });

    const lastCardOffset = (column.length - 1) * 24;
    pileEl.style.height = `${lastCardOffset + 112}px`;
  }

  // Drop target
  pileEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    pileEl.classList.add('drag-over');
  });
  pileEl.addEventListener('dragleave', () => {
    pileEl.classList.remove('drag-over');
  });
  pileEl.addEventListener('drop', (e) => {
    e.preventDefault();
    pileEl.classList.remove('drag-over');
    const data = e.dataTransfer.getData('text/plain');

    if (data === 'waste-top') {
      wasteToTableau(state, colIndex);
    } else if (data.startsWith('tableau-')) {
      const parts = data.split('-');
      const srcCol = parseInt(parts[1], 10);
      const cardIdx = parseInt(parts[2], 10);
      if (srcCol !== colIndex) {
        moveTableauRun(state, srcCol, cardIdx, colIndex);
      }
    } else if (data.startsWith('foundation-')) {
      const fIdx = parseInt(data.split('-')[1], 10);
      foundationToTableau(state, fIdx, colIndex);
    }

    rerender(state);
  });

  el.appendChild(pileEl);
  return el;
}

/* ─── Hint Highlight ─── */

function clearHint() {
  document.querySelectorAll('.hint-source, .hint-target').forEach((el) => {
    el.classList.remove('hint-source', 'hint-target');
  });
}

function showHint(hint) {
  // Find source element
  let sourceEl = null;
  if (hint.source === 'waste') {
    sourceEl = document.querySelector('.waste-pile .card:last-child');
  } else if (hint.source === 'tableau') {
    const col = document.querySelectorAll('.klondike-column')[hint.sourceIndex];
    if (col) {
      const cards = col.querySelectorAll('.card');
      sourceEl = cards[hint.cardIndex];
    }
  }

  // Find dest element
  let destEl = null;
  if (hint.dest === 'foundation') {
    destEl = document.querySelectorAll('.foundation')[hint.destIndex];
  } else if (hint.dest === 'tableau') {
    destEl = document.querySelectorAll('.klondike-column')[hint.destIndex];
  }

  if (sourceEl) sourceEl.classList.add('hint-source');
  if (destEl) destEl.classList.add('hint-target');

  // Auto-clear hint after 3 seconds
  setTimeout(clearHint, 3000);
}
