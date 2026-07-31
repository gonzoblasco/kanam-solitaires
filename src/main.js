/**
 * Kanam's Solitaires — main entry point.
 */

import { registerGame, getGames, startGame } from './lib/gameRegistry.js';
import { isSoundEnabled, setSoundEnabled } from './lib/sound.js';
import * as klondike from './games/klondike/index.js';
import * as spider from './games/spider/index.js';
import * as freecell from './games/freecell/index.js';
import * as pyramid from './games/pyramid/index.js';

// Register games
registerGame(klondike);
registerGame(spider);
registerGame(freecell);
registerGame(pyramid);

const container = document.getElementById('game-container');
const gameNav = document.getElementById('game-nav');
const optionsContainer = document.getElementById('game-options');

let currentGameName = 'klondike';
let currentOptions = { drawMode: 1, scoringMode: 'standard' };

// Build nav dynamically
const games = getGames();
games.forEach((game) => {
  const btn = document.createElement('button');
  btn.className = `game-btn${game.name === currentGameName ? ' active' : ''}`;
  btn.dataset.game = game.name;
  btn.textContent = game.label;
  btn.addEventListener('click', () => {
    document.querySelectorAll('.game-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGameName = game.name;
    buildOptions(game);
    startCurrentGame();
  });
  gameNav.appendChild(btn);
});

// Build options UI for a game
function buildOptions(game) {
  optionsContainer.innerHTML = '';
  const opts = game.getOptions ? game.getOptions() : {};
  const html = Object.entries(opts).map(([key, opt]) => {
    const currentVal = currentOptions[key] ?? opt.default;
    const buttons = opt.options.map(val => {
      const active = val === currentVal ? ' active' : '';
      return `<button class="mode-btn game-opt-btn${active}" data-opt="${key}" data-val="${val}">${val}</button>`;
    }).join('');
    return `<div class="mode-group"><span class="mode-label">${opt.label}</span>${buttons}</div>`;
  }).join('');
  optionsContainer.innerHTML = html;

  // Bind option buttons
  optionsContainer.querySelectorAll('.game-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.opt;
      const val = btn.dataset.val;
      // Parse numbers
      currentOptions[key] = isNaN(val) ? val : Number(val);
      // Update active state
      btn.parentElement.querySelectorAll('.game-opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      startCurrentGame();
    });
  });
}

function startCurrentGame() {
  startGame(currentGameName, container, currentOptions);
}

// Sound toggle
const soundToggle = document.getElementById('sound-toggle');
function updateSoundToggle() {
  soundToggle.textContent = isSoundEnabled() ? '🔊' : '🔇';
}
updateSoundToggle();
soundToggle.addEventListener('click', () => {
  setSoundEnabled(!isSoundEnabled());
  updateSoundToggle();
});

// Start
buildOptions(klondike);
startCurrentGame();
