import { useEffect, useRef, useState } from 'react';
import { pinnedProgress } from '../lib/scroll';

export interface SpineProject {
  title: string;
  role: string;
  summary: string;
  stack: string[];
}

interface Props {
  projects: SpineProject[];
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Scroll-driven rotating 3D "vertebra column": one flat slat per project,
 * stacked via translateY + per-index rotateY twist. A side panel tracks the
 * active vertebra. Reuses the tested `pinnedProgress` for sticky scroll math.
 */
export default function DataSpine({ projects }: Props) {
  const N = projects.length;
  const sectionRef = useRef<HTMLElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  // refs to each vertebra so we can toggle .active without React re-render churn
  const vertebraRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (N === 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spine = spineRef.current;
    const section = sectionRef.current;

    if (reduce) {
      // static spine, panel locked to project 1, no scroll rotation
      if (spine) spine.style.transform = 'rotateX(-6deg) rotateY(-18deg)';
      return;
    }

    // setActive only flips React state when the index actually changes, so the
    // panel re-renders at most once per crossed vertebra, not once per frame.
    let lastIndex = -1;
    const applyActive = (i: number) => {
      if (i === lastIndex) return;
      lastIndex = i;
      setActive(i);
      vertebraRefs.current.forEach((el, k) => el?.classList.toggle('active', k === i));
    };

    let ticking = false;
    const onScroll = () => {
      if (!section || !spine) {
        ticking = false;
        return;
      }
      const rect = section.getBoundingClientRect();
      const p = pinnedProgress({ top: rect.top, height: rect.height }, window.innerHeight);
      spine.style.transform = `rotateX(-8deg) rotateY(${-18 + p * 540}deg)`;
      const i = Math.min(Math.max(Math.round(p * (N - 1)), 0), N - 1);
      applyActive(i);
      ticking = false;
    };
    const req = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    };

    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    onScroll();
    return () => {
      window.removeEventListener('scroll', req);
      window.removeEventListener('resize', req);
    };
  }, [N]);

  if (N === 0) return null;

  const current = projects[active];
  // mirror the prototype's vertical stacking: step the column evenly, twist each slat
  const step = 320 / N;

  return (
    <section className="spine-sec" id="work" ref={sectionRef}>
      <div className="spine-sticky">
        <div className="spine-intro">
          <div className="eyebrow">The Spine of the Work</div>
          <h2 className="sec-title">Every vertebra is a piece of what I build.</h2>
        </div>

        <div className="spine-stage">
          <div className="spine" ref={spineRef} aria-hidden="true">
            {projects.map((p, i) => {
              const y = -(N * step) / 2 + i * step + step / 2;
              return (
                <div
                  key={p.title}
                  ref={(el) => {
                    vertebraRefs.current[i] = el;
                  }}
                  className={`vertebra${i === 0 ? ' active' : ''}`}
                  style={{ transform: `translateY(${y}px) rotateY(${i * 18}deg)` }}
                >
                  <span className="dot" />
                  <span className="vlabel">{p.title}</span>
                  <span className="vidx">v{pad(i)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="spine-panel" aria-live="polite">
          <div className="eyebrow">Now showing</div>
          <div className="p-count">
            {pad(active + 1)} / {pad(N)}
          </div>
          <h3>{current.title}</h3>
          <div className="p-tag">{current.role}</div>
          <p className="p-desc">{current.summary}</p>
          <div className="p-stack">
            {current.stack.map((s) => (
              <span className="chip" key={s}>
                {s}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
