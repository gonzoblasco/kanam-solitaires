import { describe, expect, it } from 'vitest';
import { createKlondike, moveTableauRun, tableauToFoundation, undo } from './klondike.js';

function makeCard(suit, rank) {
  const isRedSuit = suit === '♥' || suit === '♦';
  return { suit, rank, color: isRedSuit ? 'red' : 'black', faceUp: true };
}

describe('Klondike Solitaire', () => {
  it('creates a valid tableau with 52 cards', () => {
    const state = createKlondike(1, 'standard');
    const tableauCount = state.tableau.reduce((sum, col) => sum + col.length, 0);
    expect(tableauCount).toBe(28);
    expect(state.stock.length).toBe(24);
    expect(state.foundations).toEqual([[], [], [], []]);
  });

  it('allows moving a valid descending alternating run onto tableau', () => {
    const state = createKlondike(1, 'standard');
    state.tableau = [[makeCard('♠', 'K')], [makeCard('♥', '6'), makeCard('♣', '5')]];
    state.stock = [];
    state.waste = [];

    // Move 5→6 run (cards 1..end of col 1) onto col 0 (King) — invalid because K is not 6+1
    // Instead, target col 0 empty would allow K only; let's test moving 5 onto a 6 column
    state.tableau = [[makeCard('♣', '6')], [makeCard('♠', '6'), makeCard('♦', '5')]];
    expect(moveTableauRun(state, 1, 1, 0)).toBe(true);
    expect(state.tableau[0].length).toBe(2);
    expect(state.tableau[0][1].rank).toBe('5');
  });

  it('allows moving Ace to foundation', () => {
    const state = createKlondike(1, 'standard');
    state.tableau = [[makeCard('♠', 'A')]];
    state.stock = [];
    state.waste = [];

    expect(tableauToFoundation(state, 0, 0)).toBe(true);
    expect(state.foundations[0].length).toBe(1);
    expect(state.foundations[0][0].rank).toBe('A');
  });

  it('allows undo to restore a move to foundation', () => {
    const state = createKlondike(1, 'standard');
    state.tableau = [[makeCard('♠', 'A')]];
    state.stock = [];
    state.waste = [];

    tableauToFoundation(state, 0, 0);
    expect(state.foundations[0].length).toBe(1);

    expect(undo(state)).toBe(true);
    expect(state.foundations[0].length).toBe(0);
    expect(state.tableau[0].length).toBe(1);
    expect(state.tableau[0][0].rank).toBe('A');
  });
});
