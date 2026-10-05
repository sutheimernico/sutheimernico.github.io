import { describe, it, expect } from 'vitest';
import { parseRuns, relativeTime, proofLine } from './liveproof';

const now = new Date('2026-09-06T12:00:00Z');

describe('parseRuns', () => {
  it('reads the newest run', () => {
    const run = parseRuns({
      workflow_runs: [
        { conclusion: 'success', updated_at: '2026-09-06T10:00:00Z', html_url: 'https://x/1' },
        { conclusion: 'failure', updated_at: '2026-09-05T10:00:00Z' },
      ],
    });
    expect(run).toEqual({ conclusion: 'success', finishedAt: '2026-09-06T10:00:00Z', url: 'https://x/1' });
  });
  it('returns null for empty or malformed payloads', () => {
    expect(parseRuns(null)).toBeNull();
    expect(parseRuns({})).toBeNull();
    expect(parseRuns({ workflow_runs: [] })).toBeNull();
    expect(parseRuns({ workflow_runs: [{ conclusion: 'success' }] })).toBeNull();
  });
  it('maps unknown conclusions to other', () => {
    expect(parseRuns({ workflow_runs: [{ conclusion: 'cancelled', updated_at: '2026-09-06T10:00:00Z' }] })?.conclusion).toBe('other');
  });
});

describe('relativeTime', () => {
  it('buckets coarsely', () => {
    expect(relativeTime('2026-09-06T11:59:40Z', now)).toBe('just now');
    expect(relativeTime('2026-09-06T11:46:00Z', now)).toBe('14 min ago');
    expect(relativeTime('2026-09-06T09:00:00Z', now)).toBe('3 h ago');
    expect(relativeTime('2026-09-04T09:00:00Z', now)).toBe('2 d ago');
    expect(relativeTime('nope', now)).toBe('unknown');
  });
});

describe('proofLine', () => {
  it('never fakes a timestamp when the run is missing', () => {
    const line = proofLine(null, now, 'runs daily via GitHub Actions');
    expect(line.tone).toBe('neutral');
    expect(line.text).toContain('live status unavailable');
    expect(line.text).not.toMatch(/ago/);
  });
  it('reports success and failure honestly', () => {
    expect(proofLine({ conclusion: 'success', finishedAt: '2026-09-06T10:00:00Z' }, now, 'f')).toEqual({
      text: 'last pipeline run 2 h ago · success', tone: 'ok',
    });
    expect(proofLine({ conclusion: 'failure', finishedAt: '2026-09-06T10:00:00Z' }, now, 'f').tone).toBe('bad');
  });
});
