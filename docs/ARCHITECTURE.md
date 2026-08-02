# Architecture — Kanam's Solitaires

This is a browser card-game engine built on Vite and vanilla JavaScript. It uses a small game registry to route between independent solitaire implementations.

## Core modules

### `src/lib/card.js`

Card model and deck operations.

- `createCard(suit, rank)` — returns a serializable card object.
- `createDeck(jokers = false)` — returns a full 52-card deck.
- `shuffle(deck, seed?)` — Fisher-Yates shuffle with optional seed support.
- `cardId(card)` / `cardKey(card)` — stable identifiers.

### `src/lib/dom.js`

DOM helpers used by all renderers.

- `createCardElement(card, options)` — builds a `.card` div with SVG suit symbol, rank label, drag attributes, and ARIA label.
- `clearContainer(el)` — safe innerHTML clear.

### `src/lib/gameRegistry.js`

Registration and lifecycle routing.

- `registerGame(module)` — registers a game module.
- `getGame(name)` / `getGames()` — lookup.
- `startGame(name, container, options)` — calls `game.init(container, options)`.
- `resumeGame(name, container, state)` — calls `game.resume(container, state)`.

Each game module must export:

```js
export const name = 'klondike';
export const label = 'Klondike';
export function getOptions() { ... }
export function init(container, options) { ... }
export function resume(container, state) { ... }
export function destroy() { ... }
```

### `src/lib/saveState.js`

localStorage persistence. Supports one slot per game plus `lastGame` metadata.

- `saveGameState(gameName, state)` — saves a serializable state snapshot.
- `loadGameState(gameName?)` — loads the requested slot or the last active game.
- `hasGameState(gameName)` — check slot existence.
- `clearGameState(gameName?)` — remove a slot or all slots.

Renderers call `saveGameState` after every move via `rerender(state)`.

### `src/lib/stats.js`

Per-game, per-mode statistics in localStorage.

- `startGame(game, modeKey)` — begins tracking a session.
- `recordGame(game, modeKey, won, time, score, moves)` — records outcome.
- `getStats(game, modeKey)` / `getAllStats(game)` — read.

### `src/lib/sound.js`

Web Audio API sound manager. Sounds are synthesized; no external audio files.

- `playClick()`, `playSlide()`, `playFlip()`, `playFoundation()`, `playVictory()`.
- Master volume and per-type toggles persisted in localStorage.

## Game implementation pattern

Each game lives in `src/games/<name>/`:

```
index.js      → exports name/label/options, init/resume/destroy
logic.js      → pure game state and rules (moves, undo, win detection)
renderer.js   → DOM rendering, event handlers, calls logic functions
*.test.js     → vitest tests for logic
```

### `logic.js` responsibilities

- Create initial state (`create<Name>(...)`).
- Validate moves.
- Apply moves and update state.
- Maintain undo history as state snapshots.
- Detect win conditions.
- Update `state.moves`, `state.score`, `state.elapsed`.

### `renderer.js` responsibilities

- Render the board from state.
- Attach event listeners (drag, drop, click, double-click, keyboard).
- Call logic functions on user input.
- Call `rerender(state)` after state changes to persist and redraw.
- Show win banner and confetti.
- Render the bottom action bar (Hint, Auto, Stats, New Game, Help).

### State shape

Each state is a plain object with at least:

```js
{
  deck: Card[],
  tableau: Card[][],
  foundations: Card[][],
  stock: Card[],
  waste: Card[],
  moves: 0,
  score: 0,
  elapsed: 0,
  startTime: Date.now(),
  timerRunning: true,
  won: false,
  history: [/* previous state snapshots */],
  // game-specific fields...
}
```

## Rendering strategy

The current renderers rebuild the board DOM on every state change. This is simple and robust but causes Cumulative Layout Shift (CLS) on initial load because `#game-container` starts empty and the board is painted entirely by JS.

To fix CLS, future work should either:

1. Pre-render a static skeleton in `index.html` that matches the board structure, then hydrate it.
2. Refactor renderers to mutate existing DOM instead of rebuilding it.

Option 1 is the smaller, safer change.

## Build and deploy

- Vite builds to `dist/`.
- `public/` files (manifest, icons, service worker) are copied as-is.
- GitHub Actions deploys `dist/` to GitHub Pages on every push to `main`.
