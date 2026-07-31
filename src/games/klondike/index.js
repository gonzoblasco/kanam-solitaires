/**
 * Klondike game entry point.
 */

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
  };
}

export function init(container, options = {}) {
  currentContainer = container;
  const drawMode = options.drawMode ?? 1;
  const scoringMode = options.scoringMode ?? 'standard';
  currentState = createKlondike(drawMode, scoringMode);
  renderKlondike(container, currentState, true);
  return currentState;
}

export function destroy() {
  // Cleanup if needed
  currentState = null;
  currentContainer = null;
}
