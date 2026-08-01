/**
 * Stats — persistent game statistics via localStorage.
 *
 * Structure per game+mode:
 *   kanam-stats.<game>.<mode> = {
 *     played: number,
 *     won: number,
 *     bestTime: number (ms) | null,
 *     bestScore: number | null,
 *     totalMoves: number,
 *   }
 */

const STORAGE_PREFIX = 'kanam-stats';

function key(game, mode) {
  return `${STORAGE_PREFIX}.${game}.${mode}`;
}

function load(game, mode) {
  try {
    const raw = localStorage.getItem(key(game, mode));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(game, mode, data) {
  localStorage.setItem(key(game, mode), JSON.stringify(data));
}

/**
 * Get stats for a game+mode.
 */
export function getStats(game, mode) {
  return load(game, mode) || { played: 0, won: 0, bestTime: null, bestScore: null, totalMoves: 0 };
}

/**
 * Record a completed game.
 */
export function recordGame(game, mode, won, time, score, moves) {
  const stats = getStats(game, mode);
  stats.played++;
  if (won) {
    stats.won++;
    if (stats.bestTime === null || time < stats.bestTime) stats.bestTime = time;
    if (stats.bestScore === null || score > stats.bestScore) stats.bestScore = score;
  }
  stats.totalMoves += moves;
  save(game, mode, stats);
}

/**
 * Reset stats for a game+mode (or all if mode is omitted).
 */
export function resetStats(game, mode) {
  if (mode) {
    localStorage.removeItem(key(game, mode));
  } else {
    // Remove all keys for this game
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(`${STORAGE_PREFIX}.${game}.`));
    keys.forEach((k) => localStorage.removeItem(k));
  }
}

/**
 * Get all stats for a game (all modes).
 */
export function getAllStats(game) {
  const results = {};
  const prefix = `${STORAGE_PREFIX}.${game}.`;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(prefix)) {
      const mode = k.slice(prefix.length);
      try {
        results[mode] = JSON.parse(localStorage.getItem(k));
      } catch {
        /* skip */
      }
    }
  }
  return results;
}
