/**
 * Kanam's Solitaires — main entry point.
 */

import * as freecell from './games/freecell/index.js';
import * as klondike from './games/klondike/index.js';
import * as pyramid from './games/pyramid/index.js';
import * as spider from './games/spider/index.js';
import { getGame, getGames, registerGame, resumeGame, startGame } from './lib/gameRegistry.js';
import { loadGameState } from './lib/saveState.js';
import {
  SOUND_TYPES,
  getVolume,
  isSoundEnabled,
  isSoundTypeEnabled,
  resetSoundSettings,
  setSoundEnabled,
  setSoundTypeEnabled,
  setVolume,
} from './lib/sound.js';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => console.log('SW registered:', reg.scope))
      .catch((err) => console.error('SW registration failed:', err));
  });
}

// Register games
registerGame(klondike);
registerGame(spider);
registerGame(freecell);
registerGame(pyramid);

const container = document.getElementById('game-container');
const gameNav = document.getElementById('game-nav');
const optionsContainer = document.getElementById('game-options');

let currentGameName = 'klondike';
let currentOptions = {};

// Restore last active game from saved state
const saved = loadGameState();
if (saved) {
  currentGameName = saved.game;
  currentOptions = saved.options;
}

// Build nav dynamically
const games = getGames();
games.forEach((game) => {
  const btn = document.createElement('button');
  btn.className = `game-btn${game.name === currentGameName ? ' active' : ''}`;
  btn.dataset.game = game.name;
  btn.textContent = game.label;
  btn.addEventListener('click', () => {
    document.querySelectorAll('.game-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentGameName = game.name;
    const slot = loadGameState(currentGameName);
    currentOptions = slot ? slot.options : {};
    buildOptions(game);
    startCurrentGame(true);
  });
  gameNav.appendChild(btn);
});

// Build options UI for a game
function buildOptions(game) {
  optionsContainer.innerHTML = '';
  const opts = game.getOptions ? game.getOptions() : {};
  const html = Object.entries(opts)
    .map(([key, opt]) => {
      const currentVal = currentOptions[key] ?? opt.default;
      const buttons = opt.options
        .map((val) => {
          const active = val === currentVal ? ' active' : '';
          return `<button class="mode-btn game-opt-btn${active}" data-opt="${key}" data-val="${val}">${val}</button>`;
        })
        .join('');
      return `<div class="mode-group"><span class="mode-label">${opt.label}</span>${buttons}</div>`;
    })
    .join('');
  optionsContainer.innerHTML = html;

  // Bind option buttons
  optionsContainer.querySelectorAll('.game-opt-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.opt;
      const val = btn.dataset.val;
      // Parse numbers
      currentOptions[key] = Number.isNaN(Number(val)) ? val : Number(val);
      // Update active state
      btn.parentElement.querySelectorAll('.game-opt-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      startCurrentGame(false);
    });
  });
}

function startCurrentGame(resumeIfSaved = true) {
  const saved = resumeIfSaved ? loadGameState(currentGameName) : null;
  const game = getGame(currentGameName);
  if (saved && game?.resume) {
    resumeGame(currentGameName, container, saved.state);
    return;
  }
  startGame(currentGameName, container, currentOptions);
}

// Sound toggle opens sound settings panel
const soundToggle = document.getElementById('sound-toggle');
if (soundToggle) {
  soundToggle.setAttribute('aria-label', 'Sound settings');
  soundToggle.setAttribute('aria-haspopup', 'dialog');
  soundToggle.setAttribute('aria-expanded', 'false');
}
function updateSoundToggle() {
  const enabled = isSoundEnabled();
  soundToggle.textContent = enabled ? '🔊' : '🔇';
  soundToggle.setAttribute('aria-pressed', String(enabled));
}
updateSoundToggle();
soundToggle.addEventListener('click', () => {
  showSoundPanel();
});

// Keyboard: activate focused cards/buttons with Enter/Space
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const active = document.activeElement;
  if (
    active &&
    (active.classList.contains('card') ||
      active.classList.contains('mode-btn') ||
      active.classList.contains('game-btn'))
  ) {
    e.preventDefault();
    active.click();
  }
});

// Start with the restored or default game
const initialGame = getGame(currentGameName) ?? klondike;
buildOptions(initialGame);
startCurrentGame(true);

/* ─── Sound Settings Panel ─── */

const SOUND_LABELS = {
  click: 'Card click',
  slide: 'Card slide',
  flip: 'Card flip',
  foundation: 'Foundation',
  victory: 'Victory',
};

function showSoundPanel() {
  const existing = document.getElementById('sound-panel-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'sound-panel-overlay';
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'sound-panel-title');

  const box = document.createElement('div');
  box.className = 'modal-box sound-panel';
  box.innerHTML = `
    <h2 id="sound-panel-title" class="modal-title">🔊 Sound Settings</h2>
    <div class="sound-panel-content">
      <label class="sound-row sound-master">
        <span class="sound-label">Master</span>
        <input type="checkbox" id="sound-master-toggle" ${isSoundEnabled() ? 'checked' : ''} />
        <span class="sound-status" id="sound-master-status">${isSoundEnabled() ? 'On' : 'Off'}</span>
      </label>

      <div class="sound-row sound-volume">
        <label for="sound-volume-slider" class="sound-label">Volume</label>
        <input type="range" id="sound-volume-slider" min="0" max="100" value="${Math.round(getVolume() * 100)}" />
        <span class="sound-value" id="sound-volume-value">${Math.round(getVolume() * 100)}%</span>
      </div>

      <fieldset class="sound-types">
        <legend class="sound-legend">Sound types</legend>
        ${SOUND_TYPES.map(
          (type) => `
          <label class="sound-row">
            <span class="sound-label">${SOUND_LABELS[type]}</span>
            <input type="checkbox" class="sound-type-toggle" data-type="${type}" ${isSoundTypeEnabled(type) ? 'checked' : ''} />
          </label>
        `,
        ).join('')}
      </fieldset>
    </div>
    <div class="modal-actions">
      <button class="modal-btn modal-confirm" id="sound-close-btn">Close</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  soundToggle.setAttribute('aria-expanded', 'true');

  requestAnimationFrame(() => {
    overlay.classList.add('visible');
    box.classList.add('visible');
  });

  const close = () => {
    overlay.classList.remove('visible');
    box.classList.remove('visible');
    setTimeout(() => {
      overlay.remove();
      soundToggle.setAttribute('aria-expanded', 'false');
    }, 200);
  };

  const masterToggle = box.querySelector('#sound-master-toggle');
  const masterStatus = box.querySelector('#sound-master-status');
  masterToggle.addEventListener('change', () => {
    const enabled = masterToggle.checked;
    setSoundEnabled(enabled);
    masterStatus.textContent = enabled ? 'On' : 'Off';
    updateSoundToggle();
  });

  const volumeSlider = box.querySelector('#sound-volume-slider');
  const volumeValue = box.querySelector('#sound-volume-value');
  volumeSlider.addEventListener('input', () => {
    const value = Number.parseInt(volumeSlider.value, 10) / 100;
    setVolume(value);
    volumeValue.textContent = `${volumeSlider.value}%`;
  });

  box.querySelectorAll('.sound-type-toggle').forEach((toggle) => {
    toggle.addEventListener('change', () => {
      setSoundTypeEnabled(toggle.dataset.type, toggle.checked);
    });
  });

  box.querySelector('#sound-close-btn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', handler);
      close();
    }
  });

  box.querySelector('#sound-close-btn').focus();
}
