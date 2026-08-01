/**
 * Game rules — short guides shown in the help modal.
 */

export const GAME_RULES = {
  klondike: {
    title: 'Klondike Solitaire',
    goal: 'Move all 52 cards to the four foundations, built up by suit from Ace to King.',
    rules: [
      'Tableau: build down in alternating colors (red on black, black on red).',
      'Empty tableau columns can only be filled with a King (Relaxed mode can allow any card).',
      'Foundations: build up by suit from Ace to King.',
      'Stock: draw 1 or 3 cards at a time.',
      'Waste top card can be moved to tableau or foundation.',
      'Foundation-to-tableau moves are allowed (can be disabled in Strict mode).',
      'Undo any time.',
    ],
    scoring: [
      '<strong>Standard:</strong> +5 for flipping a tableau card, +10 for moving to foundation.',
      '<strong>Vegas:</strong> -$52 buy-in, +$5 per foundation card.',
    ],
  },
  spider: {
    title: 'Spider Solitaire',
    goal: 'Build eight complete King-to-Ace runs of the same suit and remove them from the board.',
    rules: [
      'Two decks (104 cards). 10 columns, deal 6/6/6/6/6/6/5/5/5/5.',
      'Build runs in descending rank on the tableau.',
      'In 1-suit mode, any cards can stack by rank.',
      'In 2-suit and 4-suit modes, runs must be the same suit to be removed.',
      'A complete same-suit run from King to Ace is automatically removed.',
      'Click the stock to deal 10 cards (1 per column).',
      'Undo any time.',
    ],
    scoring: [
      '+100 for each completed run removed.',
      '+5 for flipping a face-down card.',
      'Fewer moves and faster time give better stats.',
    ],
  },
  freecell: {
    title: 'FreeCell Solitaire',
    goal: 'Move all 52 cards to the four foundations, built up by suit from Ace to King.',
    rules: [
      'All 52 cards are dealt face-up: 8 columns (4 with 7 cards, 4 with 6).',
      'Tableau: build down in alternating colors.',
      'Four free cells hold one card each temporarily.',
      'Foundations: build up by suit from Ace to King.',
      'You can move a run of cards based on free cells available.',
      'Most deals are solvable.',
      'Undo any time.',
    ],
    variants: [
      '<strong>Classic:</strong> alternate colors in tableau.',
      "<strong>Baker's Game:</strong> build tableau by suit instead of alternate color.",
    ],
  },
  pyramid: {
    title: 'Pyramid Solitaire',
    goal: 'Remove all 28 cards from the pyramid by pairing cards that sum to 13.',
    rules: [
      'A pyramid of 28 cards (7 rows). Only exposed cards (no card above them) can be selected.',
      'Pair two exposed cards whose ranks add to 13 to remove them.',
      'Kings (value 13) can be removed alone.',
      'A=1, J=11, Q=12, K=13.',
      'Stock holds 24 cards; click to draw to the waste pile.',
      'The waste top card can pair with any exposed pyramid card.',
      'Undo any time.',
    ],
    variants: [
      '<strong>Classic:</strong> only exposed cards can be selected.',
      '<strong>Relaxed:</strong> any visible pyramid card can be selected.',
    ],
  },
};

export function getRules(gameName) {
  return GAME_RULES[gameName] || null;
}
