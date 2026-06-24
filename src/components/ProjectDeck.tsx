import { useEffect, useRef } from 'react';

export interface DeckProject {
  title: string;
  slug: string;
  status: 'production' | 'in-progress' | 'research' | 'internal';
  year: string;
  stack: string[];
  summary: string;
}

interface Props {
  projects: DeckProject[];
}

// Badge label + CSS class per status
const BADGE: Record<DeckProject['status'], { label: string; cls: string }> = {
  production: { label: 'Production', cls: 'live' },
  'in-progress': { label: 'In-progress', cls: 'wip' },
  research: { label: 'Research', cls: 'wip' },
  internal: { label: 'Internal', cls: '' },
};

/**
 * Compute spread geometry from stage width.
 * Mirrors the prototype's geom() exactly:
 *   outer = clamp(120, stageWidth/2 - 160, 320)
 *   inner = outer * 0.34
 * Returns fan[] and scatter[] transform strings, one per card.
 * For cards beyond index 3 the pattern wraps modulo 4 — cards still render.
 */
function geom(stageWidth: number, n: number) {
  const outer = Math.max(120, Math.min(320, stageWidth / 2 - 160));
  const inner = outer * 0.34;

  // Base transforms for up to 4 card slots (prototype pattern)
  const fanBase = [
    `rotate(-9deg) translate(${-outer}px, 12px)`,
    `rotate(-3deg) translate(${-inner}px, -6px)`,
    `rotate(3deg) translate(${inner}px, -6px)`,
    `rotate(9deg) translate(${outer}px, 12px)`,
  ];
  const scatterBase = [
    `rotate(-22deg) translate(${-outer * 0.7}px, -180px) scale(0.9)`,
    `rotate(16deg) translate(${inner * 1.4}px, -150px) scale(0.9)`,
    `rotate(-13deg) translate(${-inner * 1.4}px, 170px) scale(0.9)`,
    `rotate(20deg) translate(${outer * 0.7}px, 190px) scale(0.9)`,
  ];

  // If more than 4 projects exist, wrap the pattern
  const fan = Array.from({ length: n }, (_, i) => fanBase[i % 4]);
  const scatter = Array.from({ length: n }, (_, i) => scatterBase[i % 4]);

  return { fan, scatter };
}

/**
 * Exploded project deck — cards start scattered off-screen and fan in on
 * entering the viewport. Mirrors the prototype's deck-building JS faithfully.
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
      const { fan } = geom(w, projects.length);
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
    const g = geom(w, projects.length);
    cardRefs.current.forEach((card, k) => {
      if (!card) return;
      card.style.transform = g.scatter[k];
      card.style.opacity = '0';
    });

    // Recompute fan transforms on resize when assembled
    const onResize = () => {
      if (!assembledRef.current) return;
      const newW = stage.getBoundingClientRect().width || 900;
      const { fan } = geom(newW, projects.length);
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
          const { fan } = geom(newW, projects.length);
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

  return (
    <div className="deck-stage" ref={stageRef}>
      {projects.map((p, i) => {
        const badge = BADGE[p.status];
        // Middle two cards render above outer two (z-index matches prototype)
        const zIndex = i === 1 || i === 2 ? 3 : 2;
        const meta = `${p.year} · ${p.stack.join(' · ')}`;

        return (
          <article
            key={p.slug}
            className="pcard"
            style={{ zIndex }}
            ref={(el: HTMLElement | null) => {
              cardRefs.current[i] = el;
            }}
          >
            <div className="pc-top" />
            <span className={`pc-badge${badge.cls ? ` ${badge.cls}` : ''}`}>
              {badge.label}
            </span>
            {/* Stretched link: the title is the link, and .pc-link stretches over
                the whole card via CSS so the entire card is clickable. Accessible
                name = project title (no duplicate sr-only label). */}
            <h4>
              <a className="pc-link" href={`/projects/${p.slug}`}>
                {p.title}
              </a>
            </h4>
            <div className="pc-meta">{meta}</div>
            <div className="pc-desc">
              <span>{p.summary}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
