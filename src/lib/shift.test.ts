import { describe, it, expect } from 'vitest';
import { PALETTES, mixHex, paletteAt } from './shift';

describe('shift', () => {
  it('cross-fades only through dark palettes (daylight excluded)', () => {
    expect(PALETTES.length).toBe(5);
  });
  it('mixHex interpolates each channel and returns "r,g,b"', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('0,0,0');
    expect(mixHex('#000000', '#ffffff', 1)).toBe('255,255,255');
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('128,128,128');
  });
  it('paletteAt returns a var map and wraps around the loop', () => {
    const a = paletteAt(0);
    expect(a['--accent']).toMatch(/^rgb\(/);
    expect(a['--accent-rgb']).toMatch(/^\d+,\d+,\d+$/);
    const p0 = paletteAt(0), pLen = paletteAt(PALETTES.length); // wraps to 0
    expect(p0['--accent']).toBe(pLen['--accent']);
  });
});
