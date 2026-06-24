/**
 * Pure palette cross-fade logic for the "Shift" animated theme mode.
 * No DOM, no rAF, no globals — safe to import in any context.
 *
 * The five dark palettes are ported verbatim from prototype/variant-shift.html
 * and match the hex values in src/styles/global.css (phosphor → molten).
 * Daylight is deliberately excluded: it would cause a jarring brightness flash.
 */

export interface Palette {
  bg: string;
  bgWarm: string;
  surface: string;
  surface2: string;
  line: string;
  lineSoft: string;
  canvasBg: string;
  ink: string;
  inkDim: string;
  inkFaint: string;
  accent: string;
  accentSoft: string;
  accent2: string;
  accent3: string;
}

export const PALETTES: Palette[] = [
  // phosphor
  { bg: '#0E0F0D', bgWarm: '#131210', surface: '#181B17', surface2: '#1E221D', line: '#2A2F29', lineSoft: '#21251F', canvasBg: '#0B0C0A', ink: '#E9E7DE', inkDim: '#9DA69C', inkFaint: '#5E655D', accent: '#45E08A', accentSoft: '#2C925B', accent2: '#2BB3A3', accent3: '#7B5CFF' },
  // petrol
  { bg: '#070D0E', bgWarm: '#0B1113', surface: '#101A1A', surface2: '#16201F', line: '#25302F', lineSoft: '#1A2322', canvasBg: '#06100F', ink: '#E2EAE7', inkDim: '#93A6A1', inkFaint: '#56635F', accent: '#2BD4C0', accentSoft: '#1C887C', accent2: '#1E7A6E', accent3: '#54E0A0' },
  // amethyst
  { bg: '#0A0A0E', bgWarm: '#0E0D14', surface: '#15131C', surface2: '#1B1825', line: '#2C2738', lineSoft: '#201C2C', canvasBg: '#08070C', ink: '#E8E5F0', inkDim: '#A39CB6', inkFaint: '#6A6478', accent: '#A98BE6', accentSoft: '#6E5AB8', accent2: '#7E73C8', accent3: '#5FA8C9' },
  // solar
  { bg: '#100B07', bgWarm: '#15100A', surface: '#1B140D', surface2: '#221A11', line: '#352A1E', lineSoft: '#271E15', canvasBg: '#0E0905', ink: '#F2E9DE', inkDim: '#BCA792', inkFaint: '#74634F', accent: '#FF8A3D', accentSoft: '#BE5F29', accent2: '#FFC745', accent3: '#FF5E7A' },
  // molten
  { bg: '#0C0D0E', bgWarm: '#101214', surface: '#171A1C', surface2: '#1D2124', line: '#2D3338', lineSoft: '#22272B', canvasBg: '#090A0B', ink: '#E8ECEF', inkDim: '#99A4AC', inkFaint: '#5C656B', accent: '#BFD0D8', accentSoft: '#7E8C95', accent2: '#8A9690', accent3: '#6BA8FF' },
];

/** Maps CSS custom property name → Palette key. --chrome-mid intentionally maps to accent. */
const PAL_MAP: [string, keyof Palette][] = [
  ['--bg', 'bg'],
  ['--bg-warm', 'bgWarm'],
  ['--surface', 'surface'],
  ['--surface-2', 'surface2'],
  ['--line', 'line'],
  ['--line-soft', 'lineSoft'],
  ['--canvas-bg', 'canvasBg'],
  ['--ink', 'ink'],
  ['--ink-dim', 'inkDim'],
  ['--ink-faint', 'inkFaint'],
  ['--accent', 'accent'],
  ['--accent-soft', 'accentSoft'],
  ['--accent-2', 'accent2'],
  ['--accent-3', 'accent3'],
  ['--chrome-mid', 'accent'],
];

/** Parse a 6-digit hex colour into [r, g, b] channels (0–255). */
function hx(color: string): [number, number, number] {
  return [
    parseInt(color.slice(1, 3), 16),
    parseInt(color.slice(3, 5), 16),
    parseInt(color.slice(5, 7), 16),
  ];
}

/**
 * Linearly interpolate two 6-digit hex colours.
 * @returns "r,g,b" string (no `rgb()` wrapper, no spaces)
 */
export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hx(a);
  const [br, bg, bb] = hx(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `${r},${g},${bl}`;
}

/**
 * Compute a full CSS-variable map for an arbitrary position in the palette loop.
 *
 * @param t  Float position in [0, PALETTES.length). Values outside that range
 *           wrap: `paletteAt(N) === paletteAt(0)`.
 * @returns  Record mapping CSS custom property names to their interpolated values.
 *           All PAL_MAP vars get `rgb(r,g,b)`; accent RGB triplets get raw `r,g,b`.
 */
export function paletteAt(t: number): Record<string, string> {
  const N = PALETTES.length;
  // Wrap t into [0, N) — handles exact integers (t % N === 0 → fraction 0)
  const wrapped = ((t % N) + N) % N;
  const i = Math.floor(wrapped);
  const j = (i + 1) % N;
  const f = wrapped - i;
  // Smoothstep easing: te = f² * (3 - 2f)
  const te = f * f * (3 - 2 * f);

  const pa = PALETTES[i];
  const pb = PALETTES[j];

  const out: Record<string, string> = {};

  for (const [varName, key] of PAL_MAP) {
    out[varName] = `rgb(${mixHex(pa[key], pb[key], te)})`;
  }

  // Raw RGB triplets (no wrapper) consumed by rgba() references in CSS
  out['--accent-rgb'] = mixHex(pa.accent, pb.accent, te);
  out['--accent-2-rgb'] = mixHex(pa.accent2, pb.accent2, te);
  out['--accent-3-rgb'] = mixHex(pa.accent3, pb.accent3, te);

  return out;
}
