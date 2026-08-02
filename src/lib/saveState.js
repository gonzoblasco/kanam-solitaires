/**
 * Save/resume game state via localStorage.
 *
 * Supports one slot per game plus the last active game metadata.
 */

const STORAGE_KEY = 'kanam-solitaires-state-v2';
const LEGACY_KEY = 'kanam-solitaires-state';

/**
 * @typedef {object} SavedSlot
 * @property {object} state
 * @property {object} options
 * @property {number} timestamp
 */

/**
 * @typedef {object} SavedStore
 * @property {string|null} lastGame
 * @property {Record<string, SavedSlot>} games
 */

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { lastGame: parsed.lastGame ?? null, games: parsed.games ?? {} };
      }
    }
    // Try legacy single-slot storage once.
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed?.game && parsed?.state) {
        const migrated = {
          lastGame: parsed.game,
          games: { [parsed.game]: { state: parsed.state, options: {}, timestamp: parsed.timestamp ?? Date.now() } },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        localStorage.removeItem(LEGACY_KEY);
        return migrated;
      }
    }
  } catch {
    // ignore
  }
  return { lastGame: null, games: {} };
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore (e.g. storage full)
  }
}

/**
 * Persist a serializable game state snapshot for a specific game.
 * @param {string} gameName
 * @param {object} state
 * @param {object} options
 */
export function saveGameState(gameName, state, options) {
  const store = readStore();
  store.lastGame = gameName;
  const existing = store.games[gameName];
  store.games[gameName] = {
    state,
    options: options ?? existing?.options ?? {},
    timestamp: Date.now(),
  };
  writeStore(store);
}

/**
 * Load a saved game slot.
 * @param {string} [gameName] - If omitted, returns the last active game slot.
 * @returns {{ game: string, state: object, options: object, timestamp: number } | null}
 */
export function loadGameState(gameName) {
  const store = readStore();
  const target = gameName ?? store.lastGame;
  if (!target) return null;
  const slot = store.games[target];
  if (!slot || !slot.state) return null;
  return { game: target, state: slot.state, options: slot.options, timestamp: slot.timestamp };
}

/**
 * Check whether a saved slot exists for a game.
 * @param {string} gameName
 * @returns {boolean}
 */
export function hasGameState(gameName) {
  const store = readStore();
  return !!store.games[gameName]?.state;
}

/**
 * Clear the saved slot for a game, or all saved state.
 * @param {string} [gameName]
 */
export function clearGameState(gameName) {
  const store = readStore();
  if (gameName) {
    delete store.games[gameName];
    if (store.lastGame === gameName) {
      const remaining = Object.keys(store.games);
      store.lastGame = remaining.length > 0 ? remaining[0] : null;
    }
  } else {
    store.lastGame = null;
    store.games = {};
  }
  writeStore(store);
}
