/**
 * Klondike game entry point.
 */

import { createKlondike } from './klondike.js';
import { renderKlondike } from './renderer.js';

export function initKlondike(container) {
  const state = createKlondike();
  renderKlondike(container, state);
  return state;
}
