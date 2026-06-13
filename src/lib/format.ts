export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Eased intermediate value of a counter, formatted to `decimals`. */
export function countAt(target: number, t: number, decimals: number): string {
  return (target * easeOutCubic(Math.min(Math.max(t, 0), 1))).toFixed(decimals);
}
