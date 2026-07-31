/**
 * DOM helpers for rendering cards and piles.
 */

import { getSuitSVG } from './suits.js';

export function createCardElement(card) {
  const el = document.createElement('div');
  el.className = `card ${card.color}${card.faceUp ? '' : ' face-down'}`;
  el.dataset.cardId = card.id;

  if (card.faceUp) {
    const svg = getSuitSVG(card.suit);
    el.innerHTML = `
      <div class="card-rank">${card.rank}</div>
      <div class="card-suit">${svg}</div>
      <div class="card-center">${svg}</div>
    `;
  }

  return el;
}

export function updateCardElement(el, card) {
  el.className = `card ${card.color}${card.faceUp ? '' : ' face-down'}`;

  if (card.faceUp) {
    const svg = getSuitSVG(card.suit);
    el.innerHTML = `
      <div class="card-rank">${card.rank}</div>
      <div class="card-suit">${svg}</div>
      <div class="card-center">${svg}</div>
    `;
  } else {
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
