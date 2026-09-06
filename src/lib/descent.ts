/**
 * Descent — pure math for the scroll-driven camera ride (no DOM).
 *
 * The camera dollies along +Z through a column of "stations": the hero, an
 * entry gate, one panel per project (alternating left/right, angled inward),
 * an exit gate. Everything here mirrors the approved prototype
 * (prototype/descent/variant-b, 2026-07-02) with projects as the stations.
 */

export type Kind = 'hero' | 'panel' | 'gate' | 'mk';

export interface RideLayout {
  heroA: number;
  heroB: number;
  gateIn: number;
  panel0: number;
  gap: number;
  /** depth of every project panel, in ride order */
  panels: number[];
  gateOut: number;
  /** depth of the last station — the camera never travels beyond it */
  maxD: number;
  /** decorative depth markers along the void */
  markers: number[];
}

const HERO_A = 340;
const HERO_B = 540;
const GATE_IN = 1150;
const PANEL0 = 2400; // far enough that only a faint ghost shows behind the hero
const PGAP = 820;
const MARKER_STEP = 600;

export function rideLayout(n: number): RideLayout {
  const panels = Array.from({ length: n }, (_, i) => PANEL0 + i * PGAP);
  const lastPanel = n > 0 ? panels[n - 1] : PANEL0;
  const gateOut = lastPanel + 900;
  const maxD = gateOut + 380;
  const markers: number[] = [];
  for (let d = 900; d < gateOut - 200; d += MARKER_STEP) markers.push(d);
  return { heroA: HERO_A, heroB: HERO_B, gateIn: GATE_IN, panel0: PANEL0, gap: PGAP, panels, gateOut, maxD, markers };
}

/** Scroll progress → depth fraction: linear for 80 % of the track, then eases into the arrival. */
export function trackEase(p: number): number {
  const q = Math.min(1, Math.max(0, p));
  return q <= 0.8 ? 1.08 * q : 1 - 0.28 * (1 - q) - 2 * (1 - q) * (1 - q);
}

/** Inverse of the linear part of trackEase — which scroll progress reaches depth d. */
export function progressForDepth(d: number, maxD: number): number {
  if (d >= maxD) return 1;
  return Math.min(1, Math.max(0, d / maxD / 1.08));
}

/** Document scroll length the ride occupies (px), given the viewport height. */
export function rideScrollLength(maxD: number, vh: number): number {
  // ~0.72 scroll px per depth px keeps a mouse wheel at roughly six notches per panel.
  return Math.round(vh + maxD * 0.72);
}

/** Exponential camera follow: settles quickly, never feels laggy. tau in ms. */
export function lerpCam(cam: number, target: number, dtMs: number, tau: number): number {
  if (tau <= 0) return target;
  return cam + (target - cam) * (1 - Math.exp(-Math.min(50, dtMs) / tau));
}

/** Decaying forward surge ("crash zoom") fired on station entry, in depth px. */
export function impulse(elapsedMs: number, amp = 170, durMs = 240): number {
  const e = elapsedMs / durMs;
  if (e < 0 || e >= 1) return 0;
  const r = 1 - e;
  return amp * r * r;
}

export interface Placement {
  x: number;
  y: number;
  rotY: number;
}

/** Panels alternate left/right and face inward; phones keep them near the centre line. */
export function panelPlacement(i: number, vw: number): Placement {
  const mobile = vw <= 640;
  const offX = mobile ? 24 : Math.min(vw * 0.26, 380);
  const rotY = mobile ? 7 : 16;
  const left = i % 2 === 0;
  return { x: left ? -offX : offX, y: left ? -26 : 34, rotY: left ? rotY : -rotY };
}

/** Depth markers zig-zag through three heights beside the track. */
export function markerPlacement(i: number, vw: number): Placement {
  const mkX = Math.min(vw * 0.38, 500);
  return { x: i % 2 === 0 ? mkX : -mkX, y: [-150, 30, 130][i % 3], rotY: 0 };
}

interface Band {
  pg: number; // fully gone behind the camera
  ps: number; // starts to reappear (unused past the camera; symmetric fade-in)
  fs: number; // fully sharp until here
  span: number; // fade-out span beyond fs
  floor: number; // minimum far opacity (ghost)
  mul: number;
}

const BANDS: Record<Kind, Band> = {
  hero: { pg: -300, ps: -70, fs: 700, span: 2200, floor: 0, mul: 1 },
  panel: { pg: -460, ps: -170, fs: 850, span: 1500, floor: 0.07, mul: 1 },
  gate: { pg: -560, ps: -200, fs: 700, span: 1500, floor: 0, mul: 1 },
  mk: { pg: -300, ps: -120, fs: 2400, span: 2400, floor: 0, mul: 0.7 },
};

const SHARP_NEAR = -160;
const SHARP_FAR = 900;
/** panels dissolve on approach: gone by the time they reach the camera plane, so the
    fly-through never shows a huge half-transparent window over the next one */
const PANEL_NEAR = 300; // panels stay sharp closer to the camera → they read larger
/** far ghost panels are culled entirely beyond this so they stop being composited */
const PANEL_CULL = 3400;

/**
 * Opacity of an element `rel` px in front of the camera (negative = passed).
 * Compositor-only rack focus: distance dims instead of blurring.
 */
export function bandOpacity(kind: Kind, rel: number, mobile = false): number {
  const b = BANDS[kind];
  // phones have no side offset, so consecutive panels sit behind each other:
  // fade the next one out much sooner and keep no ghost floor
  const mobP = mobile && kind === 'panel';
  const floor = mobP ? 0 : b.floor;
  const fs = mobP ? 450 : b.fs;
  const span = mobP ? 450 : b.span;
  let op: number;
  if (rel < b.pg) op = 0;
  else if (rel < b.ps) op = (rel - b.pg) / (b.ps - b.pg);
  else if (rel < fs) op = 1;
  else op = Math.max(floor, 1 - (rel - fs) / span);
  op *= b.mul;

  if (kind !== 'mk') {
    const near = kind === 'panel' ? PANEL_NEAR : SHARP_NEAR;
    const dimF = kind === 'panel' ? 0.97 : 0.5;
    const dimSpan = kind === 'panel' ? 300 : 300;
    if (rel < near) op *= 1 - dimF * Math.min(1, (near - rel) / dimSpan);
    else if (rel > SHARP_FAR) op *= 1 - 0.25 * Math.min(1, (rel - SHARP_FAR) / 1100);
  }
  if (kind === 'panel' && rel > PANEL_CULL) op *= Math.max(0, 1 - (rel - PANEL_CULL) / 600);
  return Math.min(1, Math.max(0, op));
}

/** Panel states derived from its distance to the camera. */
export function panelState(rel: number) {
  return {
    active: rel < 780,
    passed: rel < SHARP_NEAR,
    reach: rel > -150 && rel < 1700,
  };
}

/**
 * Index of the current station for the HUD: 0 = surface, 1..n = panels,
 * n+1 = end of track. A station is "entered" 450 px before its plane.
 */
export function stationAt(cam: number, panels: number[], gateOut: number): number {
  let s = 0;
  for (let i = 0; i < panels.length; i++) if (cam >= panels[i] - 450) s = i + 1;
  if (cam >= gateOut - 450) s = panels.length + 1;
  return s;
}

/** "0123" — depth in metres for the gauge (10 px = 1 m). */
export function depthLabel(cam: number): string {
  return String(Math.max(0, Math.round(cam / 10))).padStart(4, '0');
}
