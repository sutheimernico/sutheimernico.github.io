/**
 * Page chrome + motion primitives, shared by every route.
 *
 * Runs on `astro:page-load` (initial load AND every view-transition
 * navigation), so everything here is idempotent per page: observers are
 * rebuilt, window listeners are bound exactly once, and elements are
 * re-queried instead of cached across navigations.
 *
 * Primitives (opt-in via data attributes, all reduced-motion aware):
 *   .reveal              fade/rise once when scrolled into view
 *   [data-stagger]       children get --i for CSS stagger delays
 *   [data-decode]        heading glyphs resolve left→right from noise on reveal
 *   [data-count]         integer counts up from 0 on reveal
 *   [data-typed]         rotating typed statement (JSON array of lines)
 *   [data-magnetic]      element leans toward a fine pointer, springs back
 */

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&$/\\<>';

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let revealIo: IntersectionObserver | null = null;
let navIo: IntersectionObserver | null = null;
let typedTimer: ReturnType<typeof setTimeout> | null = null;
let windowBound = false;

export function initChrome(): void {
  bindWindowOnce();
  initStagger();
  initReveal();
  initNav();
  initTyped();
  initMagnetic();
  onScroll();
}

/* ---------- window-level (bound once, elements re-queried) ---------- */

function bindWindowOnce(): void {
  if (windowBound) return;
  windowBound = true;

  let ticking = false;
  const req = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);

  initCursorGlow();
}

function onScroll(): void {
  const y = window.scrollY;
  const progress = document.getElementById('progress');
  if (progress) {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  document.getElementById('nav')?.classList.toggle('solid', y > 60);
}

function initCursorGlow(): void {
  if (reduce() || !finePointer()) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, shown = false;
  let raf: number | null = null;

  const loop = () => {
    const glow = document.getElementById('cursorGlow');
    cx += (tx - cx) * 0.14;
    cy += (ty - cy) * 0.14;
    if (glow) glow.style.transform = `translate(${cx}px,${cy}px)`;
    raf = requestAnimationFrame(loop);
  };
  window.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!shown) {
      shown = true;
      const glow = document.getElementById('cursorGlow');
      if (glow) glow.style.opacity = '1';
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else if (!raf) {
      loop();
    }
  });
  loop();
}

/* ---------- reveal / stagger / decode / count ---------- */

function initStagger(): void {
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      (child as HTMLElement).style.setProperty('--i', String(i));
    });
  });
}

function activate(el: HTMLElement): void {
  el.classList.add('in');
  const noMotion = reduce();
  if (el.matches('[data-decode]')) decode(el, noMotion);
  el.querySelectorAll<HTMLElement>('[data-decode]').forEach((h) => decode(h, noMotion));
  el.querySelectorAll<HTMLElement>('[data-count]').forEach((n) => countUp(n, noMotion));
}

function initReveal(): void {
  revealIo?.disconnect();
  revealIo = null;
  const els = document.querySelectorAll<HTMLElement>('.reveal:not(.in)');
  if (reduce()) {
    els.forEach(activate);
    return;
  }
  revealIo = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        activate(en.target as HTMLElement);
        revealIo?.unobserve(en.target);
      }
    },
    // Fire once the element's leading edge is ~10% of the viewport above the
    // fold. A ratio threshold would never trigger for blocks taller than a few
    // viewports (the project index on a phone), so this is edge-based instead.
    { threshold: 0, rootMargin: '0px 0px -10% 0px' },
  );
  els.forEach((el) => revealIo!.observe(el));
}

/** Resolve a heading's glyphs left→right from terminal noise. Text-only nodes. */
function decode(el: HTMLElement, instant: boolean): void {
  if (el.dataset.decoded) return;
  el.dataset.decoded = '1';
  const final = el.textContent ?? '';
  if (instant || !final.trim()) return;

  const n = final.length;
  const dur = Math.min(900, 420 + n * 9);
  const start = performance.now();
  // Screen readers get the final text throughout; sighted users see the noise.
  el.setAttribute('aria-label', final);

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    const settled = Math.floor(t * n);
    let out = '';
    for (let i = 0; i < n; i++) {
      const c = final[i];
      out += i < settled || c === ' ' || c === '\n' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = final;
      el.removeAttribute('aria-label');
    }
  };
  requestAnimationFrame(tick);
}

function countUp(el: HTMLElement, instant: boolean): void {
  const target = parseInt(el.dataset.count ?? '', 10);
  if (Number.isNaN(target)) return;
  if (instant) {
    el.textContent = String(target);
    return;
  }
  const dur = 900;
  const start = performance.now();
  const tick = (now: number) => {
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

/* ---------- typed statement ---------- */

function initTyped(): void {
  if (typedTimer) {
    clearTimeout(typedTimer);
    typedTimer = null;
  }
  const el = document.querySelector<HTMLElement>('[data-typed]');
  if (!el) return;
  let lines: string[] = [];
  try {
    lines = JSON.parse(el.dataset.typed ?? '[]');
  } catch {
    return;
  }
  const text = el.querySelector<HTMLElement>('.typed-text') ?? el;
  if (lines.length < 2 || reduce()) {
    text.textContent = lines[0] ?? text.textContent;
    return;
  }
  // The full first line is server-rendered; the loop starts by erasing it.
  let li = 0;
  let ci = lines[0].length;
  let deleting = true;
  const step = () => {
    const line = lines[li];
    if (deleting) {
      ci -= 1;
      text.textContent = line.slice(0, ci);
      if (ci <= 0) {
        deleting = false;
        li = (li + 1) % lines.length;
        typedTimer = setTimeout(step, 380);
      } else {
        typedTimer = setTimeout(step, 18);
      }
      return;
    }
    ci += 1;
    text.textContent = lines[li].slice(0, ci);
    if (ci >= lines[li].length) {
      deleting = true;
      typedTimer = setTimeout(step, 3400);
    } else {
      typedTimer = setTimeout(step, 34 + Math.random() * 36);
    }
  };
  typedTimer = setTimeout(step, 3600);
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
