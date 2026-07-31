/**
 * Klondike game entry point.
 */

import { createKlondike } from './klondike.js';
import { renderKlondike } from './renderer.js';

export function initKlondike(container, drawMode = 1) {
  const state = createKlondike(drawMode);
  renderKlondike(container, state);
  return state;
}
