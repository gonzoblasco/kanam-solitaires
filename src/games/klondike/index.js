/**
 * Klondike game entry point.
 */

import { createKlondike } from './klondike.js';
import { renderKlondike } from './renderer.js';

export function initKlondike(container, drawMode = 1, scoringMode = 'standard') {
  const state = createKlondike(drawMode, scoringMode);
  renderKlondike(container, state, true);
  return state;
}
