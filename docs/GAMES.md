# Games — Kanam's Solitaires

## Klondike

The classic solitaire.

**Objective:** Move all cards to the four foundations, one per suit, in ascending order (A → K).

**Setup:**
- 7 tableau columns with 1 to 7 cards; last card of each column face up.
- Remaining 24 cards form the stock.
- 4 empty foundations.

**Moves:**
- Tableau: build columns in descending order, alternating colors.
- Empty tableau column: only a King (or a run starting with a King) can occupy it.
- Foundation: build each in ascending order by suit.
- Waste/stock top card can move to tableau or foundation.
- Draw from stock to waste (1 or 3 cards depending on option).

**Variants:**
- **Draw 1 / Draw 3** — stock draw count.
- **Standard / Vegas** — scoring mode.
- **Relaxed** — any card may fill an empty tableau column.
- **Strict** — cards cannot move from foundations back to tableau.

## Spider

Two-deck patience game.

**Objective:** Build 8 complete runs from King down to Ace in the same suit and remove them from play.

**Setup:**
- 10 tableau columns: 6 columns with 6 cards and 4 columns with 5 cards; last card face up.
- Remaining cards form the stock.

**Moves:**
- Build tableau columns in descending rank regardless of suit.
- A full run K→A of the same suit is automatically removed.
- Deal 10 cards from stock (one to each column) when possible.
- In Strict mode, only complete same-suit runs can be moved as a unit.

**Variants:**
- **1 / 2 / 4 suits** — difficulty.
- **Classic / Strict** — movement rule for runs.

## FreeCell

All cards are visible from the start.

**Objective:** Move all cards to foundations in ascending order by suit.

**Setup:**
- 8 tableau columns: 4 with 7 cards and 4 with 6 cards; all face up.
- 4 free cells.
- 4 empty foundations.

**Moves:**
- Tableau: build descending, alternating colors.
- Free cell: can hold any single card.
- Foundation: build ascending by suit.
- Empty tableau column: any card or legal run.

**Variants:**
- **Classic** — alternating colors in tableau.
- **Baker's Game** — same suit in tableau (still descending).

## Pyramid

Pair-removal solitaire.

**Objective:** Remove all 28 pyramid cards by pairing cards that sum to 13.

**Setup:**
- Pyramid of 28 cards (7 rows), all face up.
- 24 cards in stock.
- Kings (value 13) can be removed alone.

**Moves:**
- Remove exposed pairs that sum to 13 (A=1, J=11, Q=12, K=13).
- Draw from stock to waste.
- In Relaxed mode, any visible card can be paired, not only fully exposed cards.

**Variants:**
- **Classic** — only fully exposed cards can be paired.
- **Relaxed** — any visible pyramid card can be paired.
