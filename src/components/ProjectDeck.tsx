import { useEffect, useRef } from 'react';
import { deckGeom } from '../lib/deck';
import type { ProjectStatus } from '../lib/projectSchema';

export interface DeckProject {
  title: string;
  slug: string;
  status: ProjectStatus;
  year: string;
  stack: string[];
  summary: string;
}

interface Props {
  projects: DeckProject[];
}

// Badge label + CSS class per status
const BADGE: Record<ProjectStatus, { label: string; cls: string }> = {
  production: { label: 'Production', cls: 'live' },
  'in-progress': { label: 'In-progress', cls: 'wip' },
  research: { label: 'Research', cls: 'wip' },
  internal: { label: 'Internal', cls: '' },
};

const TILT_DEG = 7;

/**
 * Exploded project deck — cards start scattered off-screen and fan in on
 * entering the viewport. Mirrors the prototype's deck-building JS faithfully.
 * On fine pointers each card additionally tilts toward the cursor with a
 * specular glare (inner wrapper, so the fan transform on the card stays intact).
 */
export default function ProjectDeck({ projects }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const assembledRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || projects.length === 0) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      // Skip scatter animation — render assembled immediately
      const w = stage.getBoundingClientRect().width || 900;
      const { fan } = deckGeom(w, projects.length);
      stage.classList.add('in');
      assembledRef.current = true;
      cardRefs.current.forEach((card, k) => {
        if (!card) return;
        card.style.opacity = '1';
        card.style.transform = fan[k];
      });
      return;
    }

    // Set initial scatter positions (cards invisible until IO fires)
    const w = stage.getBoundingClientRect().width || 900;
    const g = deckGeom(w, projects.length);
    cardRefs.current.forEach((card, k) => {
      if (!card) return;
      card.style.transform = g.scatter[k];
      card.style.opacity = '0';
    });

    // Recompute fan transforms on resize when assembled
    const onResize = () => {
      if (!assembledRef.current) return;
      const newW = stage.getBoundingClientRect().width || 900;
      const { fan } = deckGeom(newW, projects.length);
      cardRefs.current.forEach((card, k) => {
        if (card) card.style.transform = fan[k];
      });
    };
    window.addEventListener('resize', onResize);

    // Track the scatter→fan stagger timers so cleanup can cancel pending ones.
    const staggerTimers: ReturnType<typeof setTimeout>[] = [];

    // IntersectionObserver: scatter → fan stagger on enter-view
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          stage.classList.add('in');
          assembledRef.current = true;
          const newW = stage.getBoundingClientRect().width || 900;
          const { fan } = deckGeom(newW, projects.length);
          cardRefs.current.forEach((card, k) => {
            if (!card) return;
            staggerTimers.push(
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = fan[k];
              }, k * 120),
            );
          });
          io.disconnect();
        });
      },
      { threshold: 0.35 },
    );
    io.observe(stage);

    return () => {
      io.disconnect();
      window.removeEventListener('resize', onResize);
      staggerTimers.forEach(clearTimeout);
    };
  }, [projects.length]);

  // Cursor tilt + glare: writes to the inner .pc-tilt so the fan transform on
  // the card itself is untouched. Fine pointers only; reduced motion opts out.
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    const cleanups: (() => void)[] = [];
    cardRefs.current.forEach((card) => {
      if (!card) return;
      const inner = card.querySelector<HTMLElement>('.pc-tilt');
      if (!inner) return;
      const onMove = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = `rotateY(${(px * TILT_DEG * 2).toFixed(2)}deg) rotateX(${(-py * TILT_DEG * 2).toFixed(2)}deg)`;
        inner.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`);
        inner.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`);
      };
      const onLeave = () => {
        inner.style.transform = '';
      };
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
      cleanups.push(() => {
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerleave', onLeave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, [projects.length]);

  // Stacking depends only on the count, so it is safe to compute at render time
  // (the width-dependent transforms stay in the effects above).
  const stacking = deckGeom(900, projects.length).z;

  return (
    <div className="deck-stage" ref={stageRef}>
      {projects.map((p, i) => {
        const badge = BADGE[p.status];
        // Stacking order comes from the geometry: a deck (center in front) for
        // up to four cards, a hand (left to right) beyond that — see lib/deck.ts.
        const zIndex = stacking[i];
        const meta = `${p.year} · ${p.stack.slice(0, 4).join(' · ')}`;

        return (
          <article
            key={p.slug}
            className="pcard"
            style={{ zIndex }}
            ref={(el: HTMLElement | null) => {
              cardRefs.current[i] = el;
            }}
          >
            <div className="pc-tilt">
              <div className="pc-top" />
              <div className="pc-glare" aria-hidden="true" />
              <span className={`pc-badge${badge.cls ? ` ${badge.cls}` : ''}`}>
                {badge.label}
              </span>
              {/* Stretched link: the title is the link, and .pc-link stretches over
                  the whole card via CSS so the entire card is clickable. Accessible
                  name = project title (no duplicate sr-only label). The title also
                  carries the view-transition name that morphs into the detail h1. */}
              <h4 style={{ viewTransitionName: `p-${p.slug}` }}>
                <a className="pc-link" href={`/projects/${p.slug}`}>
                  {p.title}
                </a>
              </h4>
              <div className="pc-meta">{meta}</div>
              <div className="pc-desc">
                <span>{p.summary}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
