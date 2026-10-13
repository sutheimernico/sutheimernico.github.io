import { describe, it, expect } from 'vitest';
import { SKILL_AREAS, evidenceFor, type EvidenceProject } from './skills';

const p = (slug: string, order: number, stack: string[], context: 'personal' | 'work' = 'personal'): EvidenceProject => ({
  slug,
  title: slug,
  order,
  stack,
  context,
});

describe('skills', () => {
  it('area ids are unique and every area has tools and evidence labels', () => {
    expect(new Set(SKILL_AREAS.map((a) => a.id)).size).toBe(SKILL_AREAS.length);
    for (const a of SKILL_AREAS) {
      expect(a.tools.length).toBeGreaterThan(0);
      expect(a.match.length).toBeGreaterThan(0);
    }
  });

  it('evidenceFor puts work first, then display order, and caps the list', () => {
    const projects = [
      p('b', 2, ['React']),
      p('a', 1, ['FastAPI', 'React']),
      p('w', 9, ['React'], 'work'),
      p('x', 3, ['Python']),
    ];
    const { count, shown } = evidenceFor({ match: ['React'] }, projects, 2);
    expect(count).toBe(3);
    expect(shown.map((s) => s.slug)).toEqual(['w', 'a']);
  });

  it('evidenceFor matches labels exactly, not by substring', () => {
    const { count } = evidenceFor({ match: ['React'] }, [p('rn', 1, ['React Native'])], 4);
    expect(count).toBe(0);
  });
});
