/**
 * Constellation — React island.
 *
 * A canvas force-graph of skill labels: nodes drift with wall bounce,
 * a mouse attractor pulls nearby nodes, and links are drawn between close nodes.
 * Colors follow the active theme via CSS vars; re-read on 'ns-accent' events
 * so Shift mode's animated palette is tracked live.
 *
 * Lifecycle:
 * - Animates only while in view (IntersectionObserver gates the rAF loop).
 * - DPR-aware canvas sizing; recomputes on resize.
 * - reduced-motion: single static frame, no loop; still refreshes on ns-accent.
 * - Cleanup in useEffect return: cancels rAF, disconnects IO, removes listeners.
 */

import { useEffect, useRef } from 'react';

const DEFAULT_SKILLS = [
  'SQL', 'Python', 'TypeScript', 'Azure', 'Airflow',
  'dbt', 'React', 'Astro', 'RAG', 'Pandas', 'Power BI', 'Git',
];

interface Props {
  skills?: string[];
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  label: string;
}

interface Colors {
  accent: string;
  accentRgb: string;
  ink: string;
}

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

function readColors(): Colors {
  const style = getComputedStyle(document.documentElement);
  return {
    accent: style.getPropertyValue('--accent').trim() || '#45E08A',
    accentRgb: style.getPropertyValue('--accent-rgb').trim() || '69,224,138',
    ink: style.getPropertyValue('--ink-dim').trim() || '#9DA69C',
  };
}

export default function Constellation({ skills = DEFAULT_SKILLS }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let colors = readColors();
    let nodes: Node[] = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId: number | null = null;
    let running = false;

    // --- canvas sizing ---
    function size(): void {
      const rect = cv!.getBoundingClientRect();
      cv!.width = Math.max(1, rect.width * dpr);
      cv!.height = Math.max(1, rect.height * dpr);
    }

    function initNodes(): void {
      size();
      nodes = skills.map((label) => ({
        x: Math.random() * cv!.width,
        y: Math.random() * cv!.height,
        vx: (Math.random() - 0.5) * 0.3 * dpr,
        vy: (Math.random() - 0.5) * 0.3 * dpr,
        r: (3 + Math.random() * 2) * dpr,
        label,
      }));
    }

    // --- drawing ---
    function drawFrame(): void {
      const w = cv!.width;
      const h = cv!.height;
      ctx!.clearRect(0, 0, w, h);

      const link = 150 * dpr;

      // update positions
      for (const n of nodes) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 170 * dpr && d > 0.1) {
          n.vx += (dx / d) * 0.07;
          n.vy += (dy / d) * 0.07;
        }
        n.vx *= 0.96;
        n.vy *= 0.96;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < n.r || n.x > w - n.r) n.vx *= -1;
        if (n.y < n.r || n.y > h - n.r) n.vy *= -1;
        n.x = clamp(n.x, n.r, w - n.r);
        n.y = clamp(n.y, n.r, h - n.r);
      }

      // draw links
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const ddx = nodes[a].x - nodes[b].x;
          const ddy = nodes[a].y - nodes[b].y;
          const dd = Math.hypot(ddx, ddy);
          if (dd < link) {
            ctx!.strokeStyle = `rgba(${colors.accentRgb},${(0.45 * (1 - dd / link)).toFixed(3)})`;
            ctx!.lineWidth = dpr;
            ctx!.beginPath();
            ctx!.moveTo(nodes[a].x, nodes[a].y);
            ctx!.lineTo(nodes[b].x, nodes[b].y);
            ctx!.stroke();
          }
        }
      }

      // draw nodes + labels
      ctx!.font = `${11 * dpr}px ui-monospace, monospace`;
      ctx!.textBaseline = 'middle';
      for (const n of nodes) {
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fillStyle = colors.accent;
        ctx!.shadowColor = `rgba(${colors.accentRgb},0.8)`;
        ctx!.shadowBlur = 8 * dpr;
        ctx!.fill();
        ctx!.shadowBlur = 0;
        ctx!.fillStyle = colors.ink;
        ctx!.fillText(n.label, n.x + n.r + 6 * dpr, n.y);
      }
    }

    function staticDraw(): void {
      ctx!.clearRect(0, 0, cv!.width, cv!.height);
      ctx!.font = `${11 * dpr}px ui-monospace, monospace`;
      ctx!.textBaseline = 'middle';
      for (const n of nodes) {
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fillStyle = colors.accent;
        ctx!.fill();
        ctx!.fillStyle = colors.ink;
        ctx!.fillText(n.label, n.x + n.r + 6 * dpr, n.y);
      }
    }

    function frame(): void {
      drawFrame();
      rafId = requestAnimationFrame(frame);
    }

    // --- mouse ---
    function onMouseMove(e: MouseEvent): void {
      const rect = cv!.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * dpr;
      mouse.y = (e.clientY - rect.top) * dpr;
    }
    function onMouseLeave(): void {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    // --- theme recolor ---
    function onAccent(): void {
      colors = readColors();
      if (reduce || !running) staticDraw();
      // if running, next drawFrame() picks up the refreshed colors automatically
    }

    // --- resize ---
    function onResize(): void {
      initNodes();
      if (reduce || !running) staticDraw();
    }

    // --- IO for in-view gating ---
    let io: IntersectionObserver | null = null;

    initNodes();

    if (reduce) {
      staticDraw();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !running) {
              running = true;
              frame();
            } else if (!entry.isIntersecting && running) {
              running = false;
              if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
              }
            }
          }
        },
        { threshold: 0.05 },
      );
      io.observe(cv);
    }

    cv.addEventListener('mousemove', onMouseMove);
    cv.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('ns-accent', onAccent);
    window.addEventListener('resize', onResize);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      io?.disconnect();
      cv.removeEventListener('mousemove', onMouseMove);
      cv.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('ns-accent', onAccent);
      window.removeEventListener('resize', onResize);
    };
  }, [skills]);

  return (
    <div className="const-wrap">
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="const-hint">move your cursor</div>
    </div>
  );
}
