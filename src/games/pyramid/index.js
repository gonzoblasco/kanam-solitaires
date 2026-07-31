/**
 * Pyramid Solitaire — entry point.
 */

import { createPyramid } from './logic.js';
import { renderPyramid } from './renderer.js';

let currentState = null;

export const name = 'pyramid';
export const label = 'Pyramid';

export function getOptions() {
  return {};
}

export function init(container, options = {}) {
  currentState = createPyramid();
  renderPyramid(container, currentState, true);
  return currentState;
}

export function destroy() {
  currentState = null;
}
