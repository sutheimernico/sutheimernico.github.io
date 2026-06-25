/**
 * Project-deck fan/scatter geometry.
 *
 * The approved prototype (`prototype/variant-shift.html`) hand-placed exactly
 * four cards across an arc: rotations of -9/-3/+3/+9 degrees, x-offsets spanning
 * [-outer, +outer] (with the inner pair at outer*0.34), and a shallow y-arc
 * (outer cards sit +12px, inner cards -6px). The deck now binds to a content
 * collection of arbitrary length, so this generalizes that same arc envelope to
 * N cards by interpolation: N === 4 reproduces the prototype's look, and any N
 * spreads evenly across the identical span instead of stacking cards on top of
 * each other (the old modulo-4 wrap did the latter).
 */

export interface DeckGeom {
  fan: string[];
  scatter: string[];
}

/** Prototype arc envelope — the values the four hand-placed cards spanned. */
const MAX_ROT = 9; // outermost fan rotation, degrees
const OUTER_DY = 12; // outer cards dip down
const INNER_DY = -6; // inner cards lift up
const INNER_RATIO = 0.34; // inner x-offset = outer * this (prototype constant)

/** Linear interpolation. */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Compute fan + scatter transforms for `n` cards given the stage width.
 * `outer` mirrors the prototype: clamp(120, stageWidth/2 - 160, 320).
 */
export function deckGeom(stageWidth: number, n: number): DeckGeom {
  const outer = Math.max(120, Math.min(320, stageWidth / 2 - 160));

  if (n <= 0) return { fan: [], scatter: [] };

  const fan: string[] = [];
  const scatter: string[] = [];

  for (let i = 0; i < n; i++) {
    // t in [-1, 1] across the arc; single card sits centered (t = 0).
    const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    const at = Math.abs(t);

    // Fan: rotation lerps linearly across the arc; x spans [-outer, +outer]
    // but compresses toward the prototype's inner pair near the center so the
    // middle cards stay close together as they did with four cards.
    const rot = t * MAX_ROT;
    const x = t * lerp(outer * INNER_RATIO, outer, at);
    const dy = lerp(INNER_DY, OUTER_DY, at);
    fan.push(`rotate(${rot.toFixed(2)}deg) translate(${x.toFixed(1)}px, ${dy}px)`);

    // Scatter: cards start thrown off-screen, alternating up/down so the
    // assemble animation reads as a deck pulling together (mirrors the
    // prototype's alternating ±180px throw and 0.9 scale).
    const up = i % 2 === 0;
    const sRot = (up ? -1 : 1) * lerp(13, 22, at);
    const sx = t * outer * 0.85;
    const sy = up ? -lerp(150, 190, at) : lerp(150, 190, at);
    scatter.push(
      `rotate(${sRot.toFixed(2)}deg) translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) scale(0.9)`,
    );
  }

  return { fan, scatter };
}
