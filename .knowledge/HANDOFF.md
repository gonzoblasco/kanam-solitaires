# HANDOFF — Kanam's Solitaires v1.0.0

## Context

This is a Vite + vanilla JS solitaire collection. We just shipped v1.0.0 with 4 games, PWA, persistence, sound, stats, and accessibility.

## Where we left off

- `feat(6.8)` pushed to `main` and deployed to GitHub Pages.
- Documentation package in progress: README, ROADMAP, DEFINITION, STATUS, CHANGELOG, and `docs/` folder are being written in this session.
- Build, tests, and Biome are passing.

## How to resume

1. Open the project at `projects/kanam-solitaires/`.
2. Run `npm install` if needed, then `npm test && npm run build`.
3. Read `.knowledge/STATUS.md` for current blockers.
4. Pick the next item from `.knowledge/ROADMAP.md`.

## Important conventions

- No runtime frameworks; vanilla JS only.
- Each game lives in `src/games/<name>/` with `index.js`, `logic.js`, `renderer.js`.
- `gameRegistry.js` registers all games and routes `startGame`/`resumeGame`.
- `saveState.js` manages one localStorage slot per game.
- `stats.js` tracks per-game, per-mode statistics.
- Pre-commit hook: `npx biome check . && npx vitest run && npm run build`.
- Commits must be in English with format `type(scope): description`.

## Current blockers

- Lighthouse Performance ≥ 90 blocked by CLS 0.42 from `#game-container` JS rendering.
  Options: pre-render board skeleton, or refactor renderers to hydrate static structure.

## Notes for next session

- Finish docs and push before tackling CLS.
- If adding new games, follow the existing 4-file pattern and add logic tests.
