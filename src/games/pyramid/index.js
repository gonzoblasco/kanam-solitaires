/**
 * Pyramid Solitaire — entry point.
 */

import { clearGameState } from '../../lib/saveState.js';
import { startGame } from '../../lib/stats.js';
import { createPyramid } from './logic.js';
import { renderPyramid } from './renderer.js';

let currentState = null;

export const name = 'pyramid';
export const label = 'Pyramid';

export function getOptions() {
  return {
    variant: { type: 'select', label: 'Rules', options: ['classic', 'relaxed'], default: 'classic' },
  };
}

export function resume(container, state) {
  currentState = state;
  renderPyramid(container, state, false);
  return currentState;
}

export function init(container, options = {}) {
  const variant = options.variant ?? 'classic';
  currentState = createPyramid(variant);
  clearGameState();
  startGame('pyramid', variant);
  renderPyramid(container, currentState, true);
  return currentState;
}

export function destroy() {
  currentState = null;
}
