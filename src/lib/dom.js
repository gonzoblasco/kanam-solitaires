/**
 * DOM helpers for rendering cards and piles.
 */

import { getSuitSVG } from './suits.js';

export function createCardElement(card, options = {}) {
  const el = document.createElement('div');
  el.className = `card ${card.color}${card.faceUp ? '' : ' face-down'}`;
  el.dataset.cardId = card.id;
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');

  if (card.faceUp) {
    const label = options.label || `${card.rank} of ${card.suit}`;
    el.setAttribute('aria-label', label);
    const svg = getSuitSVG(card.suit);
    el.innerHTML = `
      <div class="card-rank" aria-hidden="true">${card.rank}</div>
      <div class="card-suit" aria-hidden="true">${svg}</div>
      <div class="card-center" aria-hidden="true">${svg}</div>
    `;
  } else {
    el.setAttribute('aria-label', 'Face-down card');
  }

  return el;
}

export function updateCardElement(el, card, options = {}) {
  el.className = `card ${card.color}${card.faceUp ? '' : ' face-down'}`;

  if (card.faceUp) {
    const label = options.label || `${card.rank} of ${card.suit}`;
    el.setAttribute('aria-label', label);
    const svg = getSuitSVG(card.suit);
    el.innerHTML = `
      <div class="card-rank" aria-hidden="true">${card.rank}</div>
      <div class="card-suit" aria-hidden="true">${svg}</div>
      <div class="card-center" aria-hidden="true">${svg}</div>
    `;
  } else {
    el.setAttribute('aria-label', 'Face-down card');
    el.innerHTML = '';
  }
}

export function createPileElement(className = '') {
  const el = document.createElement('div');
  el.className = `pile ${className}`;
  return el;
}

export function clearElement(el) {
  el.innerHTML = '';
}
