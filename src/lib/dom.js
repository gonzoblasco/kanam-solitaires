/**
 * DOM helpers for rendering cards and piles.
 */

export function createCardElement(card) {
  const el = document.createElement('div');
  el.className = `card ${card.color}${card.faceUp ? '' : ' face-down'}`;
  el.dataset.cardId = card.id;

  if (card.faceUp) {
    el.innerHTML = `
      <div class="card-rank">${card.rank}</div>
      <div class="card-suit">${card.suit}</div>
      <div class="card-center">${card.suit}</div>
    `;
  }

  return el;
}

export function updateCardElement(el, card) {
  el.className = `card ${card.color}${card.faceUp ? '' : ' face-down'}`;

  if (card.faceUp) {
    el.innerHTML = `
      <div class="card-rank">${card.rank}</div>
      <div class="card-suit">${card.suit}</div>
      <div class="card-center">${card.suit}</div>
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
