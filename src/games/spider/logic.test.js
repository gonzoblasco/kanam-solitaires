import { describe, expect, it } from 'vitest';
import { canMoveToColumn, checkCompleteRun, createSpider, moveRun } from './logic.js';

function makeCard(suit, rank, faceUp = true) {
  return { suit, rank, value: rankValue(rank), color: suit === '♥' || suit === '♦' ? 'red' : 'black', faceUp };
}

function rankValue(rank) {
  if (rank === 'A') return 1;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  return Number(rank);
}

describe('Spider Solitaire', () => {
  it('creates 104 cards with correct tableau deal', () => {
    const state = createSpider(1);
    const tableauCount = state.tableau.reduce((sum, col) => sum + col.length, 0);
    expect(tableauCount).toBe(56); // 6*6 + 4*5
    expect(state.stock.length).toBe(48);
  });

  it('classic variant allows moving any suit onto descending rank', () => {
    const state = createSpider(1, 'classic');
    state.tableau = [[makeCard('♠', '8')], [makeCard('♥', '7')]];
    expect(canMoveToColumn(makeCard('♥', '7'), state.tableau[0], 'classic')).toBe(true);
  });

  it('strict variant requires same suit to move', () => {
    const state = createSpider(1, 'strict');
    state.tableau = [[makeCard('♠', '8')], [makeCard('♥', '7')]];
    expect(canMoveToColumn(makeCard('♥', '7'), state.tableau[0], 'strict')).toBe(false);
    expect(canMoveToColumn(makeCard('♠', '7'), state.tableau[0], 'strict')).toBe(true);
  });

  it('removes a completed run and increments counter', () => {
    const state = createSpider(1, 'classic');
    state.tableau = [
      [
        makeCard('♠', 'K'),
        makeCard('♠', 'Q'),
        makeCard('♠', 'J'),
        makeCard('♠', '10'),
        makeCard('♠', '9'),
        makeCard('♠', '8'),
        makeCard('♠', '7'),
        makeCard('♠', '6'),
        makeCard('♠', '5'),
        makeCard('♠', '4'),
        makeCard('♠', '3'),
        makeCard('♠', '2'),
        makeCard('♠', 'A'),
      ],
    ];
    expect(checkCompleteRun(state, 0)).toBe(true);
    expect(state.tableau[0].length).toBe(0);
    expect(state.completedRuns).toBe(1);
    expect(state.score).toBe(100);
  });
});
