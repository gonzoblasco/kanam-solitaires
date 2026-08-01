import { describe, expect, it, beforeEach } from 'vitest';
import { getStats, startGame, recordGame, resetStats } from './stats.js';

describe('Stats', () => {
  beforeEach(() => {
    resetStats('test-game');
  });

  it('counts started games as played', () => {
    startGame('test-game', 'mode-a');
    const stats = getStats('test-game', 'mode-a');
    expect(stats.played).toBe(1);
    expect(stats.won).toBe(0);
  });

  it('does not double-count played when recording a win', () => {
    startGame('test-game', 'mode-a');
    recordGame('test-game', 'mode-a', true, 60000, 100, 30);
    const stats = getStats('test-game', 'mode-a');
    expect(stats.played).toBe(1);
    expect(stats.won).toBe(1);
  });

  it('tracks losses without incrementing wins', () => {
    startGame('test-game', 'mode-a');
    recordGame('test-game', 'mode-a', false, 120000, 10, 50);
    const stats = getStats('test-game', 'mode-a');
    expect(stats.played).toBe(1);
    expect(stats.won).toBe(0);
  });
});
