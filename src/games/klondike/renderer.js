/**
 * Klondike renderer — builds and updates the DOM.
 */

import { createCardElement, updateCardElement, clearElement } from '../../lib/dom.js';
import {
  drawStock,
  wasteToFoundation,
  wasteToTableau,
  moveTableauRun,
  tableauToFoundation,
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
      renderKlondike(document.getElementById('game-container'), state);
    });
    el.appendChild(empty);
  } else {
    const card = state.stock[state.stock.length - 1];
    const cardEl = createCardElement(card);
    cardEl.addEventListener('click', () => {
      drawStock(state);
      renderKlondike(document.getElementById('game-container'), state);
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
    renderKlondike(document.getElementById('game-container'), state);
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

    renderKlondike(document.getElementById('game-container'), state);
  });

  el.appendChild(pileEl);
  return el;
}
