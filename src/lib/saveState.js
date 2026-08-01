/**
 * Save/resume game state via localStorage.
 */

const STORAGE_KEY = 'kanam-solitaires-state';

/**
 * Persist a serializable game state snapshot.
 * @param {string} gameName
 * @param {object} state
 */
export function saveGameState(gameName, state) {
  const snapshot = {
    game: gameName,
    timestamp: Date.now(),
    state,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

/**
 * Load a saved game state snapshot if present and valid.
 * @returns {{ game: string, state: object } | null}
 */
export function loadGameState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.game || !parsed.state) return null;
    return { game: parsed.game, state: parsed.state };
  } catch {
    return null;
  }
}

/**
 * Clear any saved game state.
 */
export function clearGameState() {
  localStorage.removeItem(STORAGE_KEY);
}
