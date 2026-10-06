/**
 * Descent — DOM driver for the camera ride (markup: components/Descent.astro,
 * math: lib/descent.ts). One rAF loop that only runs while the camera is
 * still moving; one scroll read per frame; transform/opacity writes only.
 *
 * Lifecycle: `initDescent()` on astro:page-load (no-op when the page has no
 * ride), `destroyDescent()` on astro:before-swap.
 */
import {
  bandOpacity, depthLabel, impulse, lerpCam, markerPlacement, panelPlacement, panelState,
  progressForDepth, rideLayout, rideScrollLength, stationAt, trackEase, type Kind,
} from '../lib/descent';
import { pinnedProgress } from '../lib/scroll';

interface Item {
  el: HTMLElement;
  d: number;
  k: Kind;
  op: number;
  gone: boolean;
  active: boolean;
  typing: boolean;
  passed: boolean;
  reach: boolean;
}

const TAU = 95;
const ROLES = ['Fullstack Developer', 'AI Engineer', 'ML Engineer', 'Data Platform Engineer'];

let teardown: (() => void) | null = null;

export function initDescent(): void {
  destroyDescent();
  const sec = document.querySelector<HTMLElement>('[data-ride]');
  if (!sec) return;
  teardown = mount(sec);
}

export function destroyDescent(): void {
  teardown?.();
  teardown = null;
}

function mount(sec: HTMLElement): () => void {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const no3d = !(window.CSS && CSS.supports('transform-style', 'preserve-3d'));
  const world = sec.querySelector<HTMLElement>('[data-world]');
  const floor = sec.querySelector<HTMLElement>('[data-floor]');
  const depthEl = sec.querySelector<HTMLElement>('[data-depth]');
  const stnEl = sec.querySelector<HTMLElement>('[data-stn]');
  const needle = sec.querySelector<HTMLElement>('[data-needle]');
  const rail = sec.querySelector<HTMLElement>('[data-rail]');
  const cue = sec.querySelector<HTMLElement>('[data-cue]');
  const dots = Array.from(sec.querySelectorAll<HTMLElement>('[data-dot]'));
  const stnLabels: string[] = JSON.parse(sec.dataset.stations ?? '[]');
  if (!world) return () => {};

  if (reduce || no3d) {
    // Flat mode: the sticky viewport shows the hero once, the index below has everything.
    root.classList.add('no-ride');
    return () => root.classList.remove('no-ride');
  }
  root.classList.remove('no-ride');
  root.classList.add('ride-live');

  /* ---------- build ---------- */
  const items: Item[] = Array.from(world.querySelectorAll<HTMLElement>('.zp')).map((el) => ({
    el,
    d: parseFloat(el.dataset.d ?? '0'),
    k: (el.dataset.k as Kind) ?? 'hero',
    op: -1, gone: false, active: false, typing: false, passed: false, reach: false,
  }));
  const panels = items.filter((it) => it.k === 'panel');
  const layout = rideLayout(panels.length);
  const stationDepths = [0, ...layout.panels, layout.gateOut];

  let vw = 0, vh = 0, mobile = false, railW = 0;
  // Section geometry is cached here and the scroll position is read in the
  // scroll event, so the per-frame loop never reads layout: a rect read inside
  // rAF lands after CSS animations dirtied style and forces a sync recalc.
  let secTop = 0, secH = 0, pageY = window.scrollY;
  const place = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    mobile = vw <= 640;
    railW = rail?.offsetWidth ?? 0;
    secH = rideScrollLength(layout.maxD, vh);
    sec.style.height = `${secH}px`;
    pageY = window.scrollY;
    secTop = sec.getBoundingClientRect().top + pageY;
    let pi = 0, mi = 0;
    for (const it of items) {
      let t: string;
      if (it.k === 'panel') {
        const p = panelPlacement(pi++, vw);
        t = `translate(-50%,-50%) translate3d(${p.x}px,${p.y}px,${-it.d}px) rotateY(${p.rotY}deg)`;
      } else if (it.k === 'mk') {
        const p = markerPlacement(mi++, vw);
        t = `translate(-50%,-50%) translate3d(${p.x}px,${p.y}px,${-it.d}px)`;
      } else {
        t = `translate(-50%,-50%) translateZ(${-it.d}px)`;
      }
      it.el.style.transform = t;
    }
  };
  place();

  /* ---------- hero: letter boot + role cycler ---------- */
  const roleEl = sec.querySelector<HTMLElement>('[data-role]');
  let roleTimer: ReturnType<typeof setTimeout> | null = null;
  if (roleEl) {
    let ri = 0, ci = ROLES[0].length, del = true;
    const step = () => {
      const full = ROLES[ri];
      if (del) {
        ci -= 1;
        roleEl.textContent = full.slice(0, ci);
        if (ci <= 0) { del = false; ri = (ri + 1) % ROLES.length; roleTimer = setTimeout(step, 420); }
        else roleTimer = setTimeout(step, 28);
      } else {
        ci += 1;
        roleEl.textContent = ROLES[ri].slice(0, ci);
        if (ci >= ROLES[ri].length) { del = true; roleTimer = setTimeout(step, 2400); }
        else roleTimer = setTimeout(step, 52 + Math.random() * 34);
      }
    };
    roleTimer = setTimeout(step, 3000);
  }

  /* ---------- camera loop ---------- */
  let cam = 0;
  let target = 0;
  let running = false;
  let raf: number | null = null;
  let lastT = performance.now();
  const bootT0 = performance.now();
  let impT0 = -1e9;
  let lastKick = 0;
  let station = -1;
  let lastDepth = '';
  let cueHidden = false;
  let inView = true;
  let lastScrollT = -1e9;
  // perf probe: first ~90 frames of real scrolling decide whether to trim effects
  const probe: number[] = [];
  let probed = false;

  const readTarget = () => {
    const p = pinnedProgress({ top: secTop - pageY, height: secH }, vh);
    target = trackEase(p) * layout.maxD;
    return p;
  };

  const frame = (t: number) => {
    raf = null;
    const rawDt = t - lastT;
    const dt = Math.min(50, rawDt);
    lastT = t;
    const p = readTarget();

    cam = lerpCam(cam, target, dt, TAU);
    const bt = Math.min(1, (t - bootT0) / 1100);
    const bootOff = -140 * Math.pow(1 - bt, 3);
    const imp = impulse(t - impT0);
    const c = cam + bootOff + imp;

    world.style.transform = `translateZ(${c.toFixed(2)}px)`;
    if (floor) floor.style.transform = `translateY(${((c % 120) - 120).toFixed(2)}px)`;

    for (const it of items) {
      const rel = it.d - c;
      const op = bandOpacity(it.k, rel, mobile);
      if (Math.abs(op - it.op) > 0.004) {
        it.op = op;
        it.el.style.opacity = op.toFixed(3);
        const gone = op <= 0.02; // a 2 % ghost is invisible but still costs a layer
        if (gone !== it.gone) {
          it.gone = gone;
          it.el.classList.toggle('gone', gone);
          // culled mid-typing counts as typed, so it doesn't retype on the way back
          if (gone && it.typing) it.el.classList.add('typed-done');
        }
      }
      if (it.k === 'panel') {
        const s = panelState(rel);
        if (s.active && !it.active) { it.active = true; it.el.classList.add('on'); }
        else if (it.active && !it.typing) {
          it.typing = true;
          it.el.classList.add('typing');
          const el = it.el;
          el.querySelector('.typed')?.addEventListener('animationend', () => el.classList.add('typed-done'), { once: true });
        }
        if (s.passed !== it.passed) { it.passed = s.passed; it.el.classList.toggle('passed', s.passed); }
        const reach = s.reach && !it.gone;
        if (reach !== it.reach) {
          it.reach = reach;
          it.el.classList.toggle('reach', reach);
          it.el.tabIndex = reach ? 0 : -1;
        }
      }
    }

    // HUD
    const txt = depthLabel(cam);
    if (txt !== lastDepth && depthEl) { lastDepth = txt; depthEl.textContent = txt; }
    if (needle) needle.style.transform = `translateX(${((cam / layout.maxD) * railW).toFixed(1)}px)`;
    const s = stationAt(cam, layout.panels, layout.gateOut);
    if (s !== station) {
      station = s;
      if (stnEl) {
        // a fresh <b> restarts its flash animation on its own — no class re-trigger and
        // no forced reflow inside the frame; labels are project titles, so text, not HTML
        const b = document.createElement('b');
        b.textContent = `STN ${String(s).padStart(2, '0')}`;
        stnEl.replaceChildren(b, ` · ${stnLabels[s] ?? ''}`);
        stnEl.classList.add('flash');
      }
      dots.forEach((e, j) => e.classList.toggle('here', j === s));
      if (t - lastKick > 260 && t - bootT0 > 1400) { lastKick = t; impT0 = t; }
    }
    const hideCue = p > 0.015;
    if (hideCue !== cueHidden && cue) { cueHidden = hideCue; cue.style.opacity = hideCue ? '0' : ''; }

    if (!probed && p > 0.01) {
      probe.push(rawDt);
      if (probe.length >= 90) {
        probed = true;
        const sorted = [...probe].sort((a, b) => a - b);
        if (sorted[Math.floor(0.95 * (sorted.length - 1))] > 34) root.classList.add('perf-lite');
      }
    }

    // keep animating while anything is still settling; otherwise sleep until the next scroll
    const settling = Math.abs(target - cam) > 0.05 || bt < 1 || imp > 0;
    // hit-testing comes back as soon as the wheel stops, not when the camera has settled,
    // so a click during the settle tail still lands on the panel
    if (t - lastScrollT > 120) sec.classList.remove('moving');
    if (settling && inView) raf = requestAnimationFrame(frame);
    else { running = false; sec.classList.remove('moving'); }
  };

  const wake = () => {
    if (running || !inView) return;
    running = true;
    lastT = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const onResize = () => { place(); wake(); };
  const onScroll = () => {
    pageY = window.scrollY;
    lastScrollT = performance.now();
    if (inView) sec.classList.add('moving'); // off-screen there is no frame loop to clear it
    wake();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        inView = en.isIntersecting;
        if (inView) wake();
      }
    },
    { threshold: 0 },
  );
  io.observe(sec);

  // HUD rail dots + nav "Work" land on the matching depth
  const goto = (d: number) => {
    const top = sec.offsetTop + progressForDepth(d, layout.maxD) * (sec.offsetHeight - vh);
    window.scrollTo({ top, behavior: 'smooth' });
  };
  const onDot = (e: Event) => {
    const el = (e.currentTarget as HTMLElement);
    goto(stationDepths[Number(el.dataset.dot)] ?? 0);
  };
  dots.forEach((e) => e.addEventListener('click', onDot));

  wake();

  return () => {
    if (raf !== null) cancelAnimationFrame(raf);
    if (roleTimer) clearTimeout(roleTimer);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    dots.forEach((e) => e.removeEventListener('click', onDot));
    io.disconnect();
    sec.classList.remove('moving');
    root.classList.remove('ride-live');
  };
}
