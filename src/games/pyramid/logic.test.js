import { describe, expect, it } from 'vitest';
import { createPyramid, drawStock, selectWaste, toggleSelect, undo } from './logic.js';

describe('Pyramid Solitaire', () => {
  it('creates a valid pyramid with 28 cards and 24 stock cards', () => {
    const state = createPyramid();
    const pyramidCount = state.pyramid.reduce((sum, row) => sum + row.length, 0);
    expect(pyramidCount).toBe(28);
    expect(state.stock.length).toBe(24);
    expect(state.waste.length).toBe(0);
    expect(state.selected).toEqual([]);
  });

  it('allows pairing a pyramid card with the waste card in either order', () => {
    const state = createPyramid();
    // Force an exposed 6 in the pyramid and a 7 in the waste
    state.pyramid = [
      [{ suit: '♠', rank: '6', value: 6, color: 'black', faceUp: true, removed: false }],
      [
        { suit: '♥', rank: 'K', value: 13, color: 'red', faceUp: true, removed: true },
        { suit: '♣', rank: 'K', value: 13, color: 'black', faceUp: true, removed: true },
      ],
    ];
    state.waste = [{ suit: '♦', rank: '7', value: 7, color: 'red', faceUp: true }];
    state.stock = [];

    // Select pyramid then waste
    expect(toggleSelect(state, 0, 0)).toBe(true);
    expect(selectWaste(state)).toBe(true);
    expect(state.pyramid[0][0].removed).toBe(true);
    expect(state.waste.length).toBe(0);
    expect(state.score).toBe(20);
  });

  it('allows pairing when waste is selected first', () => {
    const state = createPyramid();
    state.pyramid = [
      [{ suit: '♠', rank: '5', value: 5, color: 'black', faceUp: true, removed: false }],
      [
        { suit: '♥', rank: 'K', value: 13, color: 'red', faceUp: true, removed: true },
        { suit: '♣', rank: 'K', value: 13, color: 'black', faceUp: true, removed: true },
      ],
    ];
    state.waste = [{ suit: '♦', rank: '8', value: 8, color: 'red', faceUp: true }];
    state.stock = [];

    expect(selectWaste(state)).toBe(true);
    expect(state.selected).toEqual([{ source: 'waste' }]);
    expect(toggleSelect(state, 0, 0)).toBe(true);
    expect(state.pyramid[0][0].removed).toBe(true);
    expect(state.waste.length).toBe(0);
  });

  it('allows undo to restore paired cards', () => {
    const state = createPyramid();
    state.pyramid = [
      [{ suit: '♠', rank: '6', value: 6, color: 'black', faceUp: true, removed: false }],
      [
        { suit: '♥', rank: 'K', value: 13, color: 'red', faceUp: true, removed: true },
        { suit: '♣', rank: 'K', value: 13, color: 'black', faceUp: true, removed: true },
      ],
    ];
    state.waste = [{ suit: '♦', rank: '7', value: 7, color: 'red', faceUp: true }];
    state.stock = [];

    toggleSelect(state, 0, 0);
    selectWaste(state);
    expect(state.pyramid[0][0].removed).toBe(true);
    expect(state.waste.length).toBe(0);

    expect(undo(state)).toBe(true);
    expect(state.pyramid[0][0].removed).toBe(false);
    expect(state.waste.length).toBe(1);
    expect(state.selected).toEqual([{ row: 0, col: 0 }]);
  });
});
