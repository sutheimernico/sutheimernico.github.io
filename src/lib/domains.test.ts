import { describe, it, expect } from 'vitest';
import { DOMAINS, DOMAIN_IDS, domainLabel, matchesFilter, topStack } from './domains';

describe('domains', () => {
  it('every domain id has metadata', () => {
    expect(DOMAINS.map((d) => d.id)).toEqual([...DOMAIN_IDS]);
    for (const id of DOMAIN_IDS) expect(domainLabel(id)).not.toBe(id);
  });

  it('matchesFilter: all / work / domain', () => {
    const p = { domain: 'ml' as const, context: 'personal' as const };
    const w = { domain: 'data' as const, context: 'work' as const };
    expect(matchesFilter(p, 'all')).toBe(true);
    expect(matchesFilter(p, 'ml')).toBe(true);
    expect(matchesFilter(p, 'data')).toBe(false);
    expect(matchesFilter(p, 'work')).toBe(false);
    expect(matchesFilter(w, 'work')).toBe(true);
    expect(matchesFilter(w, 'data')).toBe(true);
  });

  it('topStack ranks by frequency, ties alphabetically, and caps at limit', () => {
    const stacks = [['Python', 'React'], ['Python', 'dbt'], ['Astro', 'React'], ['Python']];
    expect(topStack(stacks, 3)).toEqual(['Python', 'React', 'Astro']);
    expect(topStack(stacks, 10)).toHaveLength(4);
    expect(topStack([], 5)).toEqual([]);
  });
});
