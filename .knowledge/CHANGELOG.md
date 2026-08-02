# Changelog — Kanam's Solitaires

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-08-01

### Added
- Four playable solitaire games: Klondike, Spider, FreeCell, Pyramid.
- Rule variants per game:
  - Klondike: Draw 1 / Draw 3, Standard / Vegas scoring, Relaxed / Strict.
  - Spider: 1 / 2 / 4 suits, Classic / Strict rules.
  - FreeCell: Classic, Baker's Game.
  - Pyramid: Classic, Relaxed.
- Drag & drop and double-click/tap auto-move.
- Undo history (state snapshots).
- Hints and auto-complete.
- Timer, score, and move counter.
- Per-game statistics stored in localStorage.
- Sound effects via Web Audio API with master volume and per-type toggles.
- Save and resume one game slot per game in localStorage.
- PWA support with manifest, 192x192/512x512 icons, and service worker.
- Keyboard accessibility (Tab navigation, Enter/Space activation).
- Responsive layout for mobile, tablet, and desktop.
- Pre-commit hook running Biome, tests, and build.
- Vitest tests for logic of each game.

### Changed
- Layout switched from bottom action bar to vertical right-side bar to avoid board clipping.

### Fixed
- Timer starts on game creation instead of first move.
- Timer display no longer flickers or jumps between renders.
- Abandoned games are counted as played/lost when clicking New Game with moves > 0.
- Undo no longer loses cards in Spider, FreeCell, or Pyramid.
- Service worker registration uses relative path so it works on GitHub Pages subpaths.

### Known issues
- Lighthouse Performance score is 80 because of Cumulative Layout Shift (0.42) caused by JS-rendered board content.
