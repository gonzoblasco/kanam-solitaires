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
    variant: { type: 'select', label: 'Rules', options: ['classic', 'strict'], default: 'classic' },
  };
}

export function init(container, options = {}) {
  const difficulty = options.difficulty ?? 1;
  const variant = options.variant ?? 'classic';
  currentState = createSpider(difficulty, variant);
  renderSpider(container, currentState, true);
  return currentState;
}

export function destroy() {
  currentState = null;
}
