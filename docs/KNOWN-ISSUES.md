# Known Issues — Kanam's Solitaires

## Active

### Lighthouse Performance score is 80 due to CLS

- **Symptom:** Cumulative Layout Shift ~0.42 on mobile/desktop.
- **Cause:** `#game-container` is empty in the initial HTML and the entire board is rendered by JavaScript after paint.
- **Impact:** Lighthouse Performance stays at 80 instead of ≥ 90.
- **Workaround:** Critical CSS reserves header and main dimensions, but the board content still shifts.
- **Fix options:**
  1. Pre-render a static board skeleton in `index.html` and hydrate it.
  2. Refactor renderers to mutate DOM instead of full rebuild.
  3. Use `content-visibility` or fixed aspect-ratio placeholders.

### FreeCell supermove formula is simplified

- **Symptom:** In some positions, the number of cards that can be moved as a unit differs from canonical FreeCell.
- **Cause:** Current formula is `2^(freeCells + 1)` instead of `(freeCells + 1) * 2^emptyColumns`.
- **Impact:** Minor; few users notice.
- **Fix:** Update `canMoveRun` in `src/games/freecell/logic.js` to use the canonical formula.

## Resolved

- Undo losing cards in Spider/FreeCell/Pyramid.
- Timer not starting until first move.
- Timer display flickering.
- Service worker registration path on GitHub Pages.
- Sidebar clipping on narrow/tablet viewports.

## Not bugs

- No cloud sync — by design; data is local only.
- No animations between piles — not in v1.0.0 scope.
