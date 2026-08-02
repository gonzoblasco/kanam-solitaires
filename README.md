# ♠ Kanam's Solitaires ♥

A collection of solitaire card games for the web. Built with Vite and vanilla JavaScript — no frameworks, no runtime dependencies.

**Play now → [https://gonzoblasco.github.io/kanam-solitaires/](https://gonzoblasco.github.io/kanam-solitaires/)**

## Games

| Game | Variants | Status |
|------|----------|--------|
| **Klondike** | Draw 1/3, Standard/Vegas, Relaxed/Strict | ✅ v1.0.0 |
| **Spider** | 1/2/4 suits, Classic/Strict rules | ✅ v1.0.0 |
| **FreeCell** | Classic, Baker's Game | ✅ v1.0.0 |
| **Pyramid** | Classic, Relaxed | ✅ v1.0.0 |

## Features

- Drag & drop and double-click (or tap) auto-move
- Undo / redo history
- Hints and auto-complete
- Timer, score, and move counter
- Per-game statistics stored locally
- Sound effects with per-type toggles and master volume
- Save and resume game state per game
- PWA support — installable on mobile and desktop
- Keyboard accessible (Tab, Enter, Space)
- Responsive layout for phones, tablets, and desktop

## Development

```bash
npm install
npm run dev      # local dev server with HMR
npm run build    # production build → dist/
npm run preview  # preview production build
npm test         # run tests once
npm run test:watch  # run tests in watch mode
```

Pre-commit hook runs Biome + tests + build.

## Project Structure

```
public/              # Static assets, PWA manifest, service worker
scripts/             # Build helpers (icon generation)
src/
├── games/
│   └── <game>/
│       ├── index.js       # Entry point (init/resume/destroy/getOptions)
│       ├── logic.js       # Game rules, state, move logic, undo
│       ├── logic.test.js  # Vitest tests
│       └── renderer.js    # DOM rendering and input handling
├── lib/
│   ├── card.js        # Card model, deck, shuffle
│   ├── dom.js         # DOM helpers and card element creation
│   ├── gameRegistry.js# Game registration and routing
│   ├── modal.js       # Reusable modal component
│   ├── saveState.js   # localStorage persistence per game
│   ├── sound.js       # Web Audio API sound manager
│   ├── stats.js       # Statistics tracking
│   └── suits.js       # SVG suit symbols
├── styles/base.css    # Global styles and responsive layout
├── main.js            # App entry point and shell UI
└── index.html         # HTML shell
```

## Stack

- [Vite](https://vitejs.dev/) — build tool and dev server
- Vanilla JavaScript (ES modules)
- CSS Custom Properties for theming
- [Biome](https://biomejs.dev/) — linting and formatting
- [Vitest](https://vitest.dev/) + happy-dom — testing
- GitHub Pages + GitHub Actions — deployment

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the engine works
- [`docs/GAMES.md`](docs/GAMES.md) — rules and variants for each game
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — setup and conventions
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — release and deploy flow
- [`docs/KNOWN-ISSUES.md`](docs/KNOWN-ISSUES.md) — current limitations
- [`.knowledge/ROADMAP.md`](.knowledge/ROADMAP.md) — planned features

## License

MIT © Gonzalo Blasco
