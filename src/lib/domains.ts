/**
 * Project domains — the facets the project index filters on. `context: 'work'`
 * is a second, orthogonal facet (day-job entries) rendered as its own chip.
 */
export const DOMAIN_IDS = ['agents', 'ml', 'data', 'product'] as const;
export type DomainId = (typeof DOMAIN_IDS)[number];

export interface Domain {
  id: DomainId;
  label: string;
  blurb: string;
}

export const DOMAINS: Domain[] = [
  { id: 'agents', label: 'AI & Agents', blurb: 'LLM systems that act — orchestration, tools, retrieval, guardrails.' },
  { id: 'ml', label: 'ML & Evaluation', blurb: 'Models that have to prove it — honest validation, negative results kept.' },
  { id: 'data', label: 'Data Platforms', blurb: 'Warehouses, pipelines and the APIs that serve them.' },
  { id: 'product', label: 'Apps & Interfaces', blurb: 'Things you can touch — frontends, games, a phone app.' },
];

export function domainLabel(id: DomainId): string {
  return DOMAINS.find((d) => d.id === id)?.label ?? id;
}

/** Filter id used by the index: a domain id, 'work', or 'all'. */
export type FilterId = DomainId | 'work' | 'all';

export interface Filterable {
  domain: DomainId;
  context: 'personal' | 'work';
}

export function matchesFilter(p: Filterable, filter: FilterId): boolean {
  if (filter === 'all') return true;
  if (filter === 'work') return p.context === 'work';
  return p.domain === filter;
}

/**
 * Most frequent stack entries across all projects — feeds the skill
 * constellation and the hero ticker so both stay data-driven.
 */
export function topStack(stacks: string[][], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const stack of stacks) {
    for (const s of stack) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([s]) => s);
}
