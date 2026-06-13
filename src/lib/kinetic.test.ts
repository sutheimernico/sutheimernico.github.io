import { describe, it, expect } from 'vitest';
import { proximityToAxes } from './kinetic';

describe('proximityToAxes', () => {
  it('returns base axes when the cursor is outside the radius', () => {
    expect(proximityToAxes(500, 200)).toEqual({ wght: 250, wdth: 80 });
  });
  it('returns max axes when the cursor is on the glyph', () => {
    expect(proximityToAxes(0, 200)).toEqual({ wght: 800, wdth: 112.5 });
  });
  it('interpolates linearly with proximity', () => {
    const mid = proximityToAxes(100, 200); // t = 0.5
    expect(mid.wght).toBeCloseTo(525, 5);
    expect(mid.wdth).toBeCloseTo(96.25, 5);
  });
});
