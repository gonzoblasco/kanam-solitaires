import { describe, expect, it } from 'vitest';
import { canMoveToColumn, createFreeCell, getMaxMovable } from './logic.js';

function makeCard(suit, rank) {
  const isRedSuit = suit === '♥' || suit === '♦';
  return { suit, rank, color: isRedSuit ? 'red' : 'black', faceUp: true };
}

describe('FreeCell Solitaire', () => {
  it('creates a valid tableau with 52 cards', () => {
    const state = createFreeCell();
    const tableauCount = state.tableau.reduce((sum, col) => sum + col.length, 0);
    expect(tableauCount).toBe(52);
    expect(state.freeCells).toEqual([null, null, null, null]);
    expect(state.foundations).toEqual([[], [], [], []]);
  });

  it('classic variant requires alternating colors', () => {
    expect(canMoveToColumn(makeCard('♠', '5'), [makeCard('♥', '6')], 'classic')).toBe(true);
    expect(canMoveToColumn(makeCard('♥', '5'), [makeCard('♥', '6')], 'classic')).toBe(false);
  });

  it('bakers-game variant requires same suit', () => {
    expect(canMoveToColumn(makeCard('♥', '5'), [makeCard('♥', '6')], 'bakers-game')).toBe(true);
    expect(canMoveToColumn(makeCard('♠', '5'), [makeCard('♥', '6')], 'bakers-game')).toBe(false);
  });

  it('supermove formula uses free cells and empty columns', () => {
    const state = createFreeCell();
    state.freeCells = [null, null, null, null]; // 4 free
    state.tableau = [[], [], [], [], [], [], [], []]; // 8 empty columns
    // (4 + 1) * 2^8 = 5 * 256 = 1280
    expect(getMaxMovable(state)).toBe(1280);

    state.freeCells = [null, null, null, null]; // 4 free
    state.tableau = [[makeCard('♠', 'K')], [], [], [], [], [], [], []]; // 7 empty
    // (4 + 1) * 2^7 = 5 * 128 = 640
    expect(getMaxMovable(state)).toBe(640);

    state.freeCells = [null, null, null, null]; // 4 free
    state.tableau = [[makeCard('♠', 'K')], [makeCard('♥', 'Q')], [], [], [], [], [], []]; // 6 empty
    // (4 + 1) * 2^6 = 5 * 64 = 320
    expect(getMaxMovable(state)).toBe(320);
  });
});
