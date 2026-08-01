/**
 * Game registry — central registry for all games.
 *
 * Each game exports:
 *   { name, label, init(container, options), destroy(), getOptions() }
 *
 * Options is an object with { drawMode, scoringMode, difficulty, ... }
 * depending on the game.
 */

const games = new Map();
let currentGame = null;
let currentContainer = null;

/**
 * Register a game.
 */
export function registerGame(game) {
  games.set(game.name, game);
}

/**
 * Get all registered games.
 */
export function getGames() {
  return Array.from(games.values());
}

/**
 * Get a game by name.
 */
export function getGame(name) {
  return games.get(name);
}

/**
 * Start a game in a container with options.
 * Destroys the previous game if any.
 */
export function startGame(name, container, options = {}) {
  if (currentGame?.destroy) {
    currentGame.destroy();
  }
  currentContainer = container;
  const game = games.get(name);
  if (!game) {
    console.error(`Game "${name}" not found`);
    return null;
  }
  currentGame = game;
  return game.init(container, options);
}

/**
 * Get current game instance state (if needed).
 */
export function getCurrentGame() {
  return currentGame;
}
