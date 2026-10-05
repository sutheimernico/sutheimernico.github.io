import { describe, it, expect } from 'vitest';
import { pinnedProgress, currentPanel, scrollProgress } from './scroll';

describe('pinnedProgress', () => {
  it('is 0 before the section is pinned (top >= 0)', () => {
    expect(pinnedProgress({ top: 0, height: 4000 }, 1000)).toBe(0);
  });
  it('is 1 at the end of the pinned range', () => {
    expect(pinnedProgress({ top: -3000, height: 4000 }, 1000)).toBe(1);
  });
  it('clamps and interpolates in between', () => {
    expect(pinnedProgress({ top: -1500, height: 4000 }, 1000)).toBeCloseTo(0.5, 5);
    expect(pinnedProgress({ top: -9999, height: 4000 }, 1000)).toBe(1);
  });
});

describe('currentPanel', () => {
  it('maps progress to a 1-based panel index, capped', () => {
    expect(currentPanel(0, 4)).toBe(1);
    expect(currentPanel(0.5, 4)).toBe(3);
    expect(currentPanel(1, 4)).toBe(4);
  });
});

describe('scrollProgress', () => {
  it('is the scrolled fraction of the scrollable height', () => {
    expect(scrollProgress(0, 1000)).toBe(0);
    expect(scrollProgress(250, 1000)).toBe(0.25);
    expect(scrollProgress(1000, 1000)).toBe(1);
  });
  it('clamps overscroll (rubber-banding) to 0..1', () => {
    expect(scrollProgress(-40, 1000)).toBe(0);
    expect(scrollProgress(1040, 1000)).toBe(1);
  });
  it('is 0 when the page cannot scroll', () => {
    expect(scrollProgress(0, 0)).toBe(0);
    expect(scrollProgress(10, -5)).toBe(0);
  });
});
