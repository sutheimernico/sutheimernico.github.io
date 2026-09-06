/**
 * Live-operation proof: turns the latest GitHub Actions run of a public repo
 * into one honest status line. Pure functions — the island does the fetch.
 */

export interface RunInfo {
  conclusion: 'success' | 'failure' | 'other';
  finishedAt: string; // ISO timestamp
  url?: string;
}

/** Extract the newest completed run from `GET /repos/{repo}/actions/runs`. */
export function parseRuns(json: unknown): RunInfo | null {
  if (!json || typeof json !== 'object') return null;
  const runs = (json as { workflow_runs?: unknown }).workflow_runs;
  if (!Array.isArray(runs) || runs.length === 0) return null;
  const r = runs[0] as Record<string, unknown>;
  const finishedAt = typeof r.updated_at === 'string' ? r.updated_at : null;
  if (!finishedAt) return null;
  const c = r.conclusion;
  return {
    conclusion: c === 'success' ? 'success' : c === 'failure' ? 'failure' : 'other',
    finishedAt,
    url: typeof r.html_url === 'string' ? r.html_url : undefined,
  };
}

/** Coarse relative time, terminal style: "just now", "14 min ago", "3 h ago", "2 d ago". */
export function relativeTime(iso: string, now: Date): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'unknown';
  const s = Math.max(0, Math.round((now.getTime() - then) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

export interface ProofLine {
  text: string;
  tone: 'ok' | 'bad' | 'neutral';
}

/**
 * The line shown on the page. A missing run never becomes a fake timestamp:
 * the fallback states the standing fact and admits the live check failed.
 */
export function proofLine(run: RunInfo | null, now: Date, fallback: string): ProofLine {
  if (!run) return { text: `${fallback} · live status unavailable`, tone: 'neutral' };
  const when = relativeTime(run.finishedAt, now);
  if (run.conclusion === 'success') return { text: `last pipeline run ${when} · success`, tone: 'ok' };
  if (run.conclusion === 'failure') return { text: `last pipeline run ${when} · failed`, tone: 'bad' };
  return { text: `last pipeline run ${when}`, tone: 'neutral' };
}
