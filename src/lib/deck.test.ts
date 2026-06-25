import { describe, it, expect } from 'vitest';
import { deckGeom } from './deck';

describe('deckGeom', () => {
  it('returns empty arrays for zero cards', () => {
    expect(deckGeom(900, 0)).toEqual({ fan: [], scatter: [] });
  });

  it('returns one transform per card', () => {
    const g = deckGeom(900, 7);
    expect(g.fan).toHaveLength(7);
    expect(g.scatter).toHaveLength(7);
  });

  it('centers a single card with no rotation and no x-offset', () => {
    const g = deckGeom(900, 1);
    expect(g.fan[0]).toContain('rotate(0.00deg)');
    expect(g.fan[0]).toContain('translate(0.0px,');
  });

  it('spreads rotations symmetrically across the arc (first negative, last positive)', () => {
    const g = deckGeom(900, 7);
    const first = parseFloat(g.fan[0].match(/rotate\((-?\d+\.\d+)deg\)/)![1]);
    const last = parseFloat(g.fan[6].match(/rotate\((-?\d+\.\d+)deg\)/)![1]);
    expect(first).toBeCloseTo(-9, 5);
    expect(last).toBeCloseTo(9, 5);
    expect(first).toBeCloseTo(-last, 5);
  });

  it('gives every card a distinct fan transform (no coincident cards)', () => {
    const g = deckGeom(900, 7);
    expect(new Set(g.fan).size).toBe(7);
  });

  it('reproduces the prototype outer rotations for four cards', () => {
    const g = deckGeom(900, 4);
    const rots = g.fan.map((f) => parseFloat(f.match(/rotate\((-?\d+\.\d+)deg\)/)![1]));
    expect(rots[0]).toBeCloseTo(-9, 5);
    expect(rots[3]).toBeCloseTo(9, 5);
    // inner pair lands at -3 / +3 like the hand-placed prototype
    expect(rots[1]).toBeCloseTo(-3, 5);
    expect(rots[2]).toBeCloseTo(3, 5);
  });

  it('clamps the outer span to the prototype bounds', () => {
    // tiny stage → outer clamps to 120; widest fan x stays within ±120
    const g = deckGeom(200, 5);
    const xs = g.fan.map((f) => parseFloat(f.match(/translate\((-?\d+\.\d+)px,/)![1]));
    expect(Math.max(...xs.map(Math.abs))).toBeLessThanOrEqual(120);
  });
});
