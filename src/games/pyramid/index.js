/**
 * Pyramid Solitaire — entry point.
 */

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

export function init(container, options = {}) {
  const variant = options.variant ?? 'classic';
  currentState = createPyramid(variant);
  renderPyramid(container, currentState, true);
  return currentState;
}

export function destroy() {
  currentState = null;
}
