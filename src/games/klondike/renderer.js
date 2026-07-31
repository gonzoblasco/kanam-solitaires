/**
 * Klondike renderer — builds and updates the DOM.
 */

import { createCardElement } from '../../lib/dom.js';
import {
  drawStock,
  wasteToFoundation,
  wasteToTableau,
  moveTableauRun,
  tableauToFoundation,
  getTableauRunStart,
  findAutoDestination,
  isGameWon,
} from './klondike.js';

export function renderKlondike(container, state) {
  container.innerHTML = '';
  const table = document.createElement('div');
  table.className = 'klondike-tableau';

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

  // Check win condition
  if (isGameWon(state)) {
    const winBanner = document.createElement('div');
    winBanner.className = 'win-banner';
    winBanner.textContent = '🎉 You Win! 🎉';
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
    const card = state.waste[state.waste.length - 1];
    const cardEl = createCardElement(card);
    cardEl.draggable = true;
    cardEl.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', 'waste-top');
    });
    // Double-click: auto-move waste top card
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
    el.appendChild(cardEl);
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
    el.appendChild(createCardElement(card));
  } else {
    const target = document.createElement('div');
    target.className = 'pile-target';
    el.appendChild(target);
  }

  // Drop target
  el.addEventListener('dragover', (e) => e.preventDefault());
  el.addEventListener('drop', (e) => {
    e.preventDefault();
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

        // Double-click: auto-move the run starting at this card
        cardEl.addEventListener('dblclick', () => {
          const runStart = getTableauRunStart(state.tableau[colIndex], cardIndex);
          if (runStart === -1) return;

          const runCard = state.tableau[colIndex][runStart];
          const dest = findAutoDestination(state, runCard, 'tableau', colIndex, cardIndex);
          if (dest) {
            if (dest.type === 'foundation') {
              // Only the last card can go to foundation
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

    // Set pile height
    const lastCardOffset = (column.length - 1) * 24;
    pileEl.style.height = `${lastCardOffset + 112}px`;
  }

  // Drop target for the column
  pileEl.addEventListener('dragover', (e) => e.preventDefault());
  pileEl.addEventListener('drop', (e) => {
    e.preventDefault();
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
    }

    rerender(state);
  });

  el.appendChild(pileEl);
  return el;
}
