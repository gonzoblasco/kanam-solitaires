/**
 * FreeCell Solitaire — entry point.
 */

import { clearGameState } from '../../lib/saveState.js';
import { startGame } from '../../lib/stats.js';
import { createFreeCell } from './logic.js';
import { renderFreeCell } from './renderer.js';

let currentState = null;

export const name = 'freecell';
export const label = 'FreeCell';

export function getOptions() {
  return {
    variant: { type: 'select', label: 'Rules', options: ['classic', 'bakers-game'], default: 'classic' },
  };
}

export function resume(container, state) {
  currentState = state;
  renderFreeCell(container, state, false);
  return currentState;
}

export function init(container, options = {}) {
  const variant = options.variant ?? 'classic';
  currentState = createFreeCell(variant);
  clearGameState();
  startGame('freecell', variant);
  renderFreeCell(container, currentState, true);
  return currentState;
}

export function destroy() {
  currentState = null;
}
