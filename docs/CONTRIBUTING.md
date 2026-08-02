:# Contributing — Kanam's Solitaires

This is a personal project, but contributions and future-me notes are welcome.

## Setup

```bash
cd projects/kanam-solitaires
npm install
npm run dev
```

Open http://localhost:5173.

## Conventions

- **Vanilla JavaScript only.** No frameworks or runtime dependencies.
- **ES modules.** All source files are `.js` with `import`/`export`.
- **Biome** handles formatting and linting. Run `npx biome check .` before committing.
- **Tests required for game logic.** Each game should have `logic.test.js` or equivalent.
- **Commit messages in English** with format `type(scope): description`.
  - `feat(klondike): add strict mode`
  - `fix(spider): correct undo after column move`
  - `docs(readme): update install steps`
- **Do not skip the pre-commit hook.** It runs Biome, tests, and build.

## Adding a new game

1. Create `src/games/<name>/` with:
   - `index.js` — entry point
   - `logic.js` — pure rules
   - `renderer.js` — DOM
   - `logic.test.js` — tests
2. Export from `index.js`:
   ```js
   export const name = 'yukon';
   export const label = 'Yukon';
   export function getOptions() { ... }
   export function init(container, options) { ... }
   export function resume(container, state) { ... }
   export function destroy() { ... }
   ```
3. Import and register it in `src/main.js`.
4. Add game rules to `docs/GAMES.md`.
5. Add tests.
6. Run `npm test && npm run build` and commit.

## Debugging

- Use `npm run preview` to test the production build locally.
- Use browser DevTools Lighthouse for audit scores.
- Check the service worker registration in Application → Service Workers.

## Quality gates

```bash
npx biome check .
npx vitest run
npm run build
```

All three must pass before a push.
