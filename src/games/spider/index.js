/**
 * Spider Solitaire — entry point.
 */

import { createSpider } from './logic.js';
import { renderSpider } from './renderer.js';

let currentState = null;

export const name = 'spider';
export const label = 'Spider';

export function getOptions() {
  return {
    difficulty: { type: 'select', label: 'Suits', options: [1, 2, 4], default: 1 },
  };
}

export function init(container, options = {}) {
  const difficulty = options.difficulty ?? 1;
  currentState = createSpider(difficulty);
  renderSpider(container, currentState, true);
  return currentState;
}

export function destroy() {
  currentState = null;
}
