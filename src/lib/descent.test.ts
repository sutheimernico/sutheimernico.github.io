import { describe, it, expect } from 'vitest';
import {
  bandOpacity, depthLabel, impulse, lerpCam, markerPlacement, panelPlacement, panelState,
  progressForDepth, rideLayout, rideScrollLength, stationAt, trackEase,
} from './descent';

describe('rideLayout', () => {
  it('spaces panels evenly after the entry gate and ends beyond the last panel', () => {
    const L = rideLayout(3);
    expect(L.panels).toEqual([2400, 3220, 4040]);
    expect(L.gateIn).toBeLessThan(L.panels[0]);
    expect(L.gateOut).toBeGreaterThan(L.panels[2]);
    expect(L.maxD).toBeGreaterThan(L.gateOut);
    expect(L.markers.every((m) => m > L.heroB && m < L.gateOut)).toBe(true);
  });
  it('handles an empty collection without NaN', () => {
    const L = rideLayout(0);
    expect(L.panels).toEqual([]);
    expect(Number.isFinite(L.maxD)).toBe(true);
  });
});

describe('trackEase / progressForDepth', () => {
  it('is linear-ish for most of the track and arrives exactly at 1', () => {
    expect(trackEase(0)).toBe(0);
    expect(trackEase(0.5)).toBeCloseTo(0.54, 5);
    expect(trackEase(1)).toBeCloseTo(1, 5);
    expect(trackEase(1.7)).toBeCloseTo(1, 5);
  });
  it('is monotonic', () => {
    let last = -1;
    for (let p = 0; p <= 1; p += 0.01) {
      const v = trackEase(p);
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
  });
  it('inverts the linear part and clamps at the end', () => {
    const maxD = 10000;
    expect(trackEase(progressForDepth(5400, maxD)) * maxD).toBeCloseTo(5400, 3);
    expect(progressForDepth(maxD, maxD)).toBe(1);
  });
});

describe('camera', () => {
  it('lerps toward the target and snaps when tau is 0', () => {
    expect(lerpCam(0, 100, 16, 95)).toBeGreaterThan(10);
    expect(lerpCam(0, 100, 16, 95)).toBeLessThan(100);
    expect(lerpCam(0, 100, 16, 0)).toBe(100);
  });
  it('impulse starts at full amplitude and decays to zero', () => {
    expect(impulse(0)).toBe(170);
    expect(impulse(120)).toBeGreaterThan(0);
    expect(impulse(240)).toBe(0);
    expect(impulse(-5)).toBe(0);
  });
  it('scroll length grows with depth and viewport', () => {
    expect(rideScrollLength(10000, 900)).toBe(8100);
  });
});

describe('placement', () => {
  it('alternates panels left/right facing inward, tighter on phones', () => {
    const a = panelPlacement(0, 1440);
    const b = panelPlacement(1, 1440);
    expect(a.x).toBeLessThan(0);
    expect(b.x).toBeGreaterThan(0);
    expect(a.rotY).toBeGreaterThan(0);
    expect(b.rotY).toBeLessThan(0);
    expect(Math.abs(panelPlacement(0, 390).x)).toBe(24);
  });
  it('zig-zags markers', () => {
    expect(markerPlacement(0, 1440).x).toBeGreaterThan(0);
    expect(markerPlacement(1, 1440).x).toBeLessThan(0);
  });
});

describe('bandOpacity', () => {
  it('is sharp in front, dims through the pass, and vanishes behind', () => {
    expect(bandOpacity('panel', 500)).toBeCloseTo(1, 5);
    expect(bandOpacity('panel', 0)).toBeLessThan(0.1); // dissolved before the pass
    expect(bandOpacity('panel', -500)).toBe(0);
  });
  it('keeps a faint ghost far ahead but culls very far panels', () => {
    expect(bandOpacity('panel', 3000)).toBeGreaterThan(0);
    expect(bandOpacity('panel', 3000)).toBeLessThan(0.2);
    expect(bandOpacity('panel', 4200)).toBe(0);
  });
  it('drops the ghost floor on phones and fades the next panel early', () => {
    expect(bandOpacity('panel', 3000, true)).toBe(0);
    expect(bandOpacity('panel', 820, true)).toBeLessThan(0.25);
    expect(bandOpacity('panel', 820, false)).toBeCloseTo(1, 5);
  });
  it('stays within [0, 1] for every kind across the track', () => {
    for (const k of ['hero', 'panel', 'gate', 'mk'] as const) {
      for (let rel = -1000; rel < 6000; rel += 50) {
        const v = bandOpacity(k, rel);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('panelState / stationAt / depthLabel', () => {
  it('activates on approach, marks the pass, and limits reach', () => {
    expect(panelState(1000)).toEqual({ active: false, passed: false, reach: true });
    expect(panelState(500).active).toBe(true);
    expect(panelState(-200)).toEqual({ active: true, passed: true, reach: false });
  });
  it('reports surface, each panel, then the end of track', () => {
    const L = rideLayout(2);
    expect(stationAt(0, L.panels, L.gateOut)).toBe(0);
    expect(stationAt(L.panels[0] - 400, L.panels, L.gateOut)).toBe(1);
    expect(stationAt(L.panels[1], L.panels, L.gateOut)).toBe(2);
    expect(stationAt(L.maxD, L.panels, L.gateOut)).toBe(3);
  });
  it('formats the gauge', () => {
    expect(depthLabel(0)).toBe('0000');
    expect(depthLabel(12345)).toBe('1235');
    expect(depthLabel(-40)).toBe('0000');
  });
});
