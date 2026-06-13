export interface RectLike { top: number; height: number; }

/** Progress 0..1 of a sticky-pinned section, given its rect and viewport height. */
export function pinnedProgress(rect: RectLike, viewportH: number): number {
  const total = rect.height - viewportH;
  if (total <= 0) return 0;
  return Math.min(Math.max(-rect.top / total, 0), 1);
}

/** Horizontal track offset in px for a given progress. */
export function trackOffset(progress: number, trackScrollWidth: number, viewportW: number): number {
  return -progress * Math.max(trackScrollWidth - viewportW, 0);
}

/** 1-based index of the panel currently in view. */
export function currentPanel(progress: number, panelCount: number): number {
  return Math.min(Math.floor(progress * panelCount) + 1, panelCount);
}
