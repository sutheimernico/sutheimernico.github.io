export interface Axes { wght: number; wdth: number; }

const BASE: Axes = { wght: 250, wdth: 80 };
const MAX: Axes  = { wght: 800, wdth: 112.5 };

/** Map cursor distance (px) to variable-font axes. t = 1 on the glyph, 0 at/after radius. */
export function proximityToAxes(distance: number, radius: number): Axes {
  const t = Math.max(0, 1 - distance / radius);
  return {
    wght: BASE.wght + t * (MAX.wght - BASE.wght),
    wdth: BASE.wdth + t * (MAX.wdth - BASE.wdth),
  };
}
