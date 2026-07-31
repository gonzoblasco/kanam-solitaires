# ♠ Kanam's Solitaires ♥

A collection of solitaire card games for the web. No frameworks, no dependencies — just vanilla HTML, CSS, and JavaScript.

## Games

### Klondike ✅

The classic solitaire. Draw from stock, build tableau columns in alternating colors, and clear all four foundations to win.

**Features:**
- Drag & drop or double-click to auto-move
- Permissive variant: cards can be moved back from foundations to tableau
- Undo support (up to 50 moves)
- Score and move tracking
- Win celebration

More games coming soon: Spider, FreeCell, Pyramid...

## Play

👉 **[https://gonzoblasco.github.io/kanam-solitaires/](https://gonzoblasco.github.io/kanam-solitaires/)**

## Development

```bash
npm install
npm run dev     # dev server with HMR
npm run build   # production build → dist/
npm run preview # preview production build
```

## Stack

- [Vite](https://vitejs.dev/) — build tool
- Vanilla JS — no framework
- CSS Custom Properties — theming
- GitHub Pages — automated deployment via GitHub Actions

## Project Structure

```
src/
├── lib/              # Shared card library
│   ├── card.js       # Deck, suits, ranks, shuffle
│   └── dom.js        # DOM helpers
├── games/
│   └── klondike/     # Klondike implementation
│       ├── klondike.js   # Game logic
│       ├── renderer.js   # DOM rendering
│       └── index.js      # Entry point
├── styles/
│   └── base.css      # Global styles
└── main.js           # App entry point
```

## License

MIT
