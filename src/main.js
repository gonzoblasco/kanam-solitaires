/**
 * Kanam's Solitaires — main entry point.
 */

import { initKlondike } from './games/klondike/index.js';

const container = document.getElementById('game-container');
let currentDrawMode = 1;
let currentScoringMode = 'standard';
let currentGame = initKlondike(container, currentDrawMode, currentScoringMode);

// Draw mode selector
document.querySelectorAll('.draw-mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.draw-mode-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentDrawMode = parseInt(btn.dataset.draw, 10);
    currentGame = initKlondike(container, currentDrawMode, currentScoringMode);
  });
});

// Scoring mode selector
document.querySelectorAll('.scoring-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.scoring-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentScoringMode = btn.dataset.scoring;
    currentGame = initKlondike(container, currentDrawMode, currentScoringMode);
  });
});

// Game navigation
document.querySelectorAll('.game-btn[data-game]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.game-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const game = btn.dataset.game;
    switch (game) {
      case 'klondike':
        currentGame = initKlondike(container, currentDrawMode, currentScoringMode);
        break;
      // Future games will go here
    }
  });
});
