/**
 * Klondike game entry point.
 */

import { clearGameState } from '../../lib/saveState.js';
import { startGame } from '../../lib/stats.js';
import { createKlondike } from './klondike.js';
import { renderKlondike } from './renderer.js';

let currentState = null;
let currentContainer = null;

export const name = 'klondike';
export const label = 'Klondike';

export function getOptions() {
  return {
    drawMode: { type: 'select', label: 'Draw', options: [1, 3], default: 1 },
    scoringMode: { type: 'select', label: 'Score', options: ['standard', 'vegas'], default: 'standard' },
    variant: { type: 'select', label: 'Rules', options: ['standard', 'relaxed', 'strict'], default: 'standard' },
  };
}

export function resume(container, state) {
  currentState = state;
  currentContainer = container;
  renderKlondike(container, state, false);
  return currentState;
}

export function init(container, options = {}) {
  currentContainer = container;
  const drawMode = options.drawMode ?? 1;
  const scoringMode = options.scoringMode ?? 'standard';
  const variant = options.variant ?? 'standard';
  currentState = createKlondike(drawMode, scoringMode, variant);
  clearGameState(name);
  startGame('klondike', `draw${drawMode}-${scoringMode}`);
  renderKlondike(container, currentState, true);
  return currentState;
}

export function destroy() {
  currentState = null;
  currentContainer = null;
}
