/**
 * Page chrome + motion enhancements, shared by every route.
 *
 * Runs on `astro:page-load` (initial load AND every view-transition
 * navigation), so everything here is idempotent per page: observers are
 * rebuilt, window listeners are bound exactly once, elements re-queried.
 *
 * Nothing here gates visibility. Scroll-entrance reveals are pure CSS
 * (scroll-driven animations, see global.css); this script only adds the
 * enhancements that need JS and degrade to plain content without it:
 *   [data-stagger]   children get --i for CSS stagger offsets
 *   [data-decode]    heading glyphs resolve left→right from noise when in view
 *   [data-count]     integer counts up from 0 when in view
 *   [data-magnetic]  element leans toward a fine pointer, springs back
 *   nav: .solid past 60 px, aria-current on the section in view; progress bar
 */

import { scrollProgress } from '../lib/scroll';

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&$/\\<>';

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let fxIo: IntersectionObserver | null = null;
let navIo: IntersectionObserver | null = null;
let windowBound = false;

export function initChrome(): void {
  bindWindowOnce();
  initStagger();
  initEffects();
  initNav();
  initMagnetic();
  onScroll();
}

/* ---------- window-level (bound once, elements re-queried) ---------- */

function bindWindowOnce(): void {
  if (windowBound) return;
  windowBound = true;
  let ticking = false;
  const req = () => {
    // Read in the event, write in the frame. The scroll event fires before
    // rAF callbacks, while layout is still clean; reading scrollY/scrollHeight
    // inside the frame instead would land after the Descent loop's style
    // writes and force a synchronous style + layout pass on every frame.
    readScroll();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      writeScroll();
      ticking = false;
    });
  };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
}

let lastY = 0;
let lastMax = 0;

function readScroll(): void {
  lastY = window.scrollY;
  lastMax = document.documentElement.scrollHeight - window.innerHeight;
}

function writeScroll(): void {
  const progress = document.getElementById('progress');
  // scaleX, not width: a transform stays on the compositor, width re-lays out.
  if (progress) progress.style.transform = `scaleX(${scrollProgress(lastY, lastMax)})`;
  document.getElementById('nav')?.classList.toggle('solid', lastY > 60);
}

function onScroll(): void {
  readScroll();
  writeScroll();
}

/* ---------- stagger / decode / count ---------- */

function initStagger(): void {
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      (child as HTMLElement).style.setProperty('--i', String(i));
    });
  });
}

function initEffects(): void {
  fxIo?.disconnect();
  fxIo = null;
  const els = document.querySelectorAll<HTMLElement>('[data-decode]:not([data-done]), [data-count]:not([data-done])');
  if (els.length === 0) return;
  const run = (el: HTMLElement) => {
    el.dataset.done = '1';
    if (el.hasAttribute('data-decode')) decode(el);
    if (el.hasAttribute('data-count')) countUp(el);
  };
  if (reduce()) {
    els.forEach((el) => (el.dataset.done = '1'));
    return;
  }
  fxIo = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        run(en.target as HTMLElement);
        fxIo?.unobserve(en.target);
      }
    },
    { threshold: 0, rootMargin: '0px 0px -10% 0px' },
  );
  els.forEach((el) => fxIo!.observe(el));
}

/** Resolve a heading's glyphs left→right from terminal noise. Text-only nodes. */
function decode(el: HTMLElement): void {
  const final = el.textContent ?? '';
  if (!final.trim()) return;
  const n = final.length;
  const dur = Math.min(900, 420 + n * 9);
  const start = performance.now();
  // Screen readers get the final text throughout; sighted users see the noise.
  el.setAttribute('aria-label', final);
  const tick = (now: number) => {
    if (!el.isConnected) return;
    const t = Math.min(1, (now - start) / dur);
    const settled = Math.floor(t * n);
    let out = '';
    for (let i = 0; i < n; i++) {
      const c = final[i];
      out += i < settled || c === ' ' || c === '\n' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (t < 1) requestAnimationFrame(tick);
    else {
      el.textContent = final;
      el.removeAttribute('aria-label');
    }
  };
  requestAnimationFrame(tick);
}

function countUp(el: HTMLElement): void {
  const target = parseInt(el.dataset.count ?? '', 10);
  if (Number.isNaN(target)) return;
  const dur = 900;
  const start = performance.now();
  const tick = (now: number) => {
    if (!el.isConnected) return;
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- nav: active section ---------- */

function initNav(): void {
  navIo?.disconnect();
  navIo = null;
  const nav = document.getElementById('nav');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('.nav-links a'));
  links.forEach((a) => a.removeAttribute('aria-current'));
  const byId = new Map(links.map((a) => [a.hash.slice(1), a] as const));
  const targets = Array.from(byId.keys())
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  if (targets.length === 0) return; // detail pages: no in-page sections

  navIo = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute('aria-current'));
        byId.get(en.target.id)?.setAttribute('aria-current', 'true');
      }
    },
    // A thin band just above the viewport's centre decides the current section.
    { rootMargin: '-42% 0px -54% 0px', threshold: 0 },
  );
  targets.forEach((t) => navIo!.observe(t));
}

/* ---------- magnetic buttons ---------- */

function initMagnetic(): void {
  if (reduce() || !finePointer()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    if (el.dataset.magneticBound) return;
    el.dataset.magneticBound = '1';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(x * 0.22).toFixed(1)}px, ${(y * 0.3).toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}
