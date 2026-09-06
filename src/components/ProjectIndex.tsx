import { useMemo, useState } from 'react';
import { DOMAINS, domainLabel, matchesFilter, type DomainId, type FilterId } from '../lib/domains';
import type { ProjectStatus } from '../lib/projectSchema';

export interface IndexProject {
  slug: string;
  title: string;
  status: ProjectStatus;
  year: string;
  stack: string[];
  summary: string;
  domain: DomainId;
  context: 'personal' | 'work';
  featured: boolean;
}

interface Props {
  projects: IndexProject[];
}

// Status → terminal-style label + LED class. Kept distinct from the deck's
// badges on purpose: the index reads like a process table, not a card grid.
const STATUS: Record<ProjectStatus, { label: string; cls: string }> = {
  production: { label: 'live', cls: 'live' },
  'in-progress': { label: 'building', cls: 'wip' },
  research: { label: 'research', cls: 'wip' },
  internal: { label: 'internal', cls: 'int' },
};

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * ProjectIndex — the complete list of projects as a filterable process table.
 * Rows re-mount on filter change (keyed by slug) so the CSS stagger replays.
 */
export default function ProjectIndex({ projects }: Props) {
  const [filter, setFilter] = useState<FilterId>('all');

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length, work: 0 };
    for (const d of DOMAINS) c[d.id] = 0;
    for (const p of projects) {
      c[p.domain] += 1;
      if (p.context === 'work') c.work += 1;
    }
    return c;
  }, [projects]);

  const rows = projects.filter((p) => matchesFilter(p, filter));

  const chips: { id: FilterId; label: string }[] = [
    { id: 'all', label: 'All' },
    ...DOMAINS.map((d) => ({ id: d.id, label: d.label })),
    { id: 'work', label: '@ bekumoo' },
  ];

  return (
    <div className="idx">
      <div className="idx-bar" role="group" aria-label="Filter projects">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            className="idx-chip"
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
            <span className="idx-n">{counts[c.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="idx-head" aria-hidden="true">
        <span>id</span>
        <span>status</span>
        <span>project</span>
        <span className="idx-c-domain">domain</span>
        <span className="idx-c-stack">stack</span>
        <span className="idx-c-year">year</span>
        <span />
      </div>

      <ol className="idx-list" aria-live="polite">
        {rows.map((p, k) => {
          const s = STATUS[p.status];
          return (
            <li
              key={p.slug}
              className="idx-row"
              style={{ '--i': k } as React.CSSProperties}
            >
              <a className="idx-link" href={`/projects/${p.slug}`}>
                <span className="idx-id">{pad(projects.indexOf(p) + 1)}</span>
                <span className={`idx-status ${s.cls}`}>
                  <i className="led" aria-hidden="true" />
                  {s.label}
                </span>
                <span className="idx-title">
                  {/* Flagships already carry this transition name on the deck. */}
                  <span
                    className="idx-name"
                    style={p.featured ? undefined : { viewTransitionName: `p-${p.slug}` }}
                  >
                    {p.title}
                  </span>
                  <span className="idx-sum">{p.summary}</span>
                </span>
                <span className="idx-domain idx-c-domain">
                  {p.context === 'work' ? '@ bekumoo' : domainLabel(p.domain)}
                </span>
                <span className="idx-stack idx-c-stack">{p.stack.slice(0, 4).join(' · ')}</span>
                <span className="idx-year idx-c-year">{p.year}</span>
                <span className="idx-arrow" aria-hidden="true">→</span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
