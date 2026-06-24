import { useEffect, useRef } from 'react';

/**
 * HeroMercury — inline NS monogram with cursor-reactive 3-D tilt and specular
 * highlight. Styles live in global.css under "=== hero mercury ===".
 *
 * Guards:
 *   - prefers-reduced-motion → no tilt / no specular
 *   - pointer:coarse (touch)  → no tilt / no specular
 */
export default function HeroMercury() {
  const areaRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduce || coarse) return;

    const area = areaRef.current;
    const tilt = tiltRef.current;
    const spec = specRef.current;
    if (!area || !tilt) return;

    function onMove(e: MouseEvent) {
      const r = area!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tilt!.style.transform = `rotateY(${px * 26}deg) rotateX(${-py * 26}deg)`;
      if (spec) {
        spec.style.opacity = '1';
        spec.style.transform = `translate(${px * r.width * 0.7}px, ${py * r.height * 0.7}px)`;
      }
    }

    function onLeave() {
      tilt!.style.transform = 'rotateY(0deg) rotateX(0deg)';
      if (spec) spec.style.opacity = '0';
    }

    area.addEventListener('mousemove', onMove);
    area.addEventListener('mouseleave', onLeave);
    return () => {
      area.removeEventListener('mousemove', onMove);
      area.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div className="mercury" ref={areaRef} id="mercury">
      <div className="mercury-spec" ref={specRef} />
      <div className="mercury-tilt" ref={tiltRef}>
        {/* SVG inlined — cannot import NsMonogram.astro from a React island */}
        <svg viewBox="0 0 100 100" aria-hidden="true" overflow="visible">
          <defs>
            <linearGradient id="chrome" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0"    stopColor="#7c8884" />
              <stop offset="0.22" stopColor="#eef2ee" />
              <stop offset="0.55" stopColor="var(--chrome-mid)" />
              <stop offset="0.78" stopColor="#cfd6d1" />
              <stop offset="1"    stopColor="#566059" />
            </linearGradient>
          </defs>

          {/* decorative ring */}
          <circle
            className="ring"
            cx="50" cy="50" r="47"
          />

          {/* N — metallic chrome gradient */}
          <path
            className="ns-n"
            d="M20 72 V26 L52 72 V26"
          />

          {/* S — accent colour with glow, slightly forward */}
          <path
            className="ns-s"
            d="M82 44 C82 34 48 34 48 48 C48 62 82 58 82 74 C82 88 46 88 44 76"
          />
        </svg>
      </div>
    </div>
  );
}
