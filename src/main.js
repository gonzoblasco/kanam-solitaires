/**
 * Kanam's Solitaires — main entry point.
 */

import { initKlondike } from './games/klondike/index.js';

const container = document.getElementById('game-container');

// Start with Klondike
let currentGame = initKlondike(container);

// Game navigation
document.querySelectorAll('.game-btn[data-game]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.game-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const game = btn.dataset.game;
    switch (game) {
      case 'klondike':
        currentGame = initKlondike(container);
        break;
      // Future games will go here
    }
  });
});
