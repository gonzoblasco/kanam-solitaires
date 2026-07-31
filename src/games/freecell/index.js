/**
 * FreeCell Solitaire — entry point.
 */

import { createFreeCell } from './logic.js';
import { renderFreeCell } from './renderer.js';

let currentState = null;

export const name = 'freecell';
export const label = 'FreeCell';

export function getOptions() {
  return {};
}

export function init(container, options = {}) {
  currentState = createFreeCell();
  renderFreeCell(container, currentState, true);
  return currentState;
}

export function destroy() {
  currentState = null;
}
