# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **STATUS (2026-06-24):** The foundation tasks (scaffold, theme token system, `src/lib` logic, base
> layout, font wiring) are DONE and reused. The **section/UI tasks below are SUPERSEDED** — the design
> direction moved from variant-K to the approved `prototype/variant-shift.html`. The site as actually
> built (sections, islands, themes+shift, content collection, detail pages) lives in
> `2026-06-24-portfolio-prototype-integration.md`; see its `## Implementation Notes`. Keep this doc as
> foundation history; build new work against the 2026-06-24 plan.

**Goal:** Turn winning prototype K ("Kinetic Terminal") into a real, maintainable, content-driven Astro site and deploy it free from the private GitHub repo.

**Architecture:** Astro (static output) with React islands only for the interactive pieces (theme switcher, kinetic name, scroll-pinned job queue, counters, typed boot line). All pure logic (kinetic-font math, theme resolution, scroll progress, counter formatting) lives in `src/lib/*.ts`, is framework-agnostic, and is unit-tested with Vitest. Visual fidelity is ported section-by-section from `prototype/variant-k.html` (the complete reference implementation) and verified in the browser, not unit-tested. Projects are an Astro **content collection** so new ML/RAG projects are added as Markdown files, never code edits.

**Tech Stack:** Astro 4, React 18 (islands), Tailwind v4 (`@tailwindcss/vite`), TypeScript, Vitest, self-hosted variable fonts via `@fontsource-variable/martian-mono` + `@fontsource/ibm-plex-mono`. Deploy: Cloudflare Pages (free tier, supports private repos) via Git integration.

**Source of truth for visuals:** `prototype/variant-k.html` on branch `feat/design-prototypes`. Each visual task names the prototype section to port. Behavior must stay identical unless a step says otherwise.

**Reference doc for content:** none yet — Task 11 drafts it; Nico corrects.

---

## New dependencies (flagged per CLAUDE.md — confirm at Go)

- `@tailwindcss/vite` + `tailwindcss@4` — styling. Matches bekumoo `app-frontend` (Tailwind 4).
- `@astrojs/react` + `react` + `react-dom` — islands.
- `vitest` + `@testing-library/dom` (light) — unit tests for `src/lib`.
- `@fontsource-variable/martian-mono`, `@fontsource/ibm-plex-mono` — self-host fonts (drop the prototype's Google Fonts CDN: faster, no third-party request, no FOUT). Martian Mono is the variable display face (axes `wght` 100–800, `wdth` 75–112.5) used for the cursor-swell name.

## Design tokens to finalize in Task 2 (not a blocker — default chosen)

The prototype's pure-neon `#33FF66` is the most generic terminal green. Default the **phosphor** accent to a refined `#45E08A` (mint-leaning phosphor, less "stock neon"); keep `#33FF66` as an alternative the design-reviewer/Nico can flip back to. Background stays warm near-black `#0B0A08`. All six prototype themes are ported.

## File structure

```
portfolio/
├── astro.config.mjs              # Astro + React + Tailwind(vite) + site/base config
├── tsconfig.json
├── vitest.config.ts
├── package.json
├── src/
│   ├── styles/global.css         # @import tailwind; CSS-var tokens; html[data-theme] themes; base + reduced-motion
│   ├── lib/
│   │   ├── themes.ts             # THEMES array + types + resolveTheme()       (tested)
│   │   ├── kinetic.ts            # proximityToAxes(distance,radius) -> {wght,wdth} (tested)
│   │   ├── scroll.ts             # pinnedProgress(rect,viewportH) + trackOffset() (tested)
│   │   └── format.ts             # easeOutCubic(t), countAt(target,t,decimals)   (tested)
│   ├── content/
│   │   ├── config.ts             # projects collection schema (zod)            (tested via sample)
│   │   └── projects/*.md         # one file per project (Task 7 + Task 11)
│   ├── components/
│   │   ├── Hud.astro             # top bar shell (ports HUD)
│   │   ├── ThemeSwitcher.tsx     # island: swatches + keys 1-6 + sessionStorage
│   │   ├── KineticName.tsx       # island: per-letter cursor swell (uses kinetic.ts)
│   │   ├── BootLine.tsx          # island: types the boot command, then reveals
│   │   ├── SqlHero.astro         # static SQL block
│   │   ├── StatsMarquee.astro    # CSS marquee
│   │   ├── JobQueue.tsx          # island: scroll-pinned horizontal queue (uses scroll.ts), reads projects
│   │   ├── Figures.tsx           # island: IntersectionObserver counters (uses format.ts)
│   │   ├── StackAbout.astro      # static stack + about
│   │   ├── Contact.astro         # contact + kinetic mail (reuses KineticName behavior, optional)
│   │   └── SiteFooter.astro
│   ├── layouts/Base.astro        # <html lang> + head/meta + theme bootstrap script + fonts
│   └── pages/
│       ├── index.astro           # assembles the landing page
│       └── projects/[slug].astro # project detail pages from the collection
├── public/                       # favicon, og image
└── docs/                         # plan + sessions (already present)
```

---

### Task 1: Scaffold Astro + Tailwind + React + Vitest

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/styles/global.css`, `src/pages/index.astro`
- Branch: work on `feat/build-site` (branch off `main`, NOT `feat/design-prototypes`)

- [ ] **Step 1: Create the build branch**

```bash
cd ~/private/portfolio
git checkout main
git checkout -b feat/build-site
```

- [ ] **Step 2: Scaffold a minimal Astro project in place**

The repo already has files (`CLAUDE.md`, `docs/`, `prototype/`). Init Astro non-destructively:

```bash
npm create astro@latest -- --template minimal --no-install --no-git --yes .
```

If it refuses due to non-empty dir, create in a temp subdir and move `src/`, `astro.config.mjs`, `tsconfig.json`, `package.json` up — leave `prototype/`, `docs/`, `CLAUDE.md`, `.claude/` untouched.

- [ ] **Step 3: Add integrations and deps**

```bash
npm install
npx astro add react --yes
npm install -D tailwindcss @tailwindcss/vite vitest
npm install @fontsource-variable/martian-mono @fontsource/ibm-plex-mono
```

- [ ] **Step 4: Configure Astro (site/base, Tailwind vite plugin, React already added)**

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Cloudflare Pages serves at the root, so no base path needed.
export default defineConfig({
  site: 'https://portfolio.pages.dev', // updated to the real domain after Task 13
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 5: Tailwind v4 entry + reset in global.css**

`src/styles/global.css` (tokens come in Task 2; for now just wire Tailwind):

```css
@import "tailwindcss";
```

- [ ] **Step 6: vitest config**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
```

- [ ] **Step 7: Smoke index page**

`src/pages/index.astro`:

```astro
---
import '../styles/global.css';
---
<html lang="en"><body class="bg-black text-white p-8">scaffold ok</body></html>
```

- [ ] **Step 8: Verify dev server boots**

Run: `npm run dev` then `curl -s -o /dev/null -w '%{http_code}' http://localhost:4321/`
Expected: `200`. Kill the server.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold astro + react + tailwind v4 + vitest"
```

---

### Task 2: Design tokens + theme system (TDD the resolution)

**Files:**
- Create: `src/lib/themes.ts`, `src/lib/themes.test.ts`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Write the failing test**

`src/lib/themes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { THEMES, resolveTheme, DEFAULT_THEME } from './themes';

describe('themes', () => {
  it('exposes the six ported themes with unique names', () => {
    const names = THEMES.map(t => t.name);
    expect(names).toEqual(['phosphor', 'amber', 'violet', 'cyan', 'red', 'mono']);
    expect(new Set(names).size).toBe(names.length);
  });
  it('defaults to phosphor (Nico picked the green)', () => {
    expect(DEFAULT_THEME).toBe('phosphor');
  });
  it('resolveTheme falls back to default for unknown/empty input', () => {
    expect(resolveTheme(null)).toBe('phosphor');
    expect(resolveTheme('nope')).toBe('phosphor');
    expect(resolveTheme('violet')).toBe('violet');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/themes.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement themes.ts**

`src/lib/themes.ts`:

```ts
export type ThemeName = 'phosphor' | 'amber' | 'violet' | 'cyan' | 'red' | 'mono';

export interface Theme {
  name: ThemeName;
  label: string;
  swatch: string; // accent hex, used for the switcher dot
}

// Order = display order in the switcher; keys 1..6 map to this order.
export const THEMES: Theme[] = [
  { name: 'phosphor', label: 'Phosphor', swatch: '#45E08A' },
  { name: 'amber',    label: 'Amber',    swatch: '#FFB000' },
  { name: 'violet',   label: 'Violet',   swatch: '#BD93F9' },
  { name: 'cyan',     label: 'Cyan',     swatch: '#4FD8FF' },
  { name: 'red',      label: 'Red',      swatch: '#FF4538' },
  { name: 'mono',     label: 'Mono',     swatch: '#F5F2EA' },
];

export const DEFAULT_THEME: ThemeName = 'phosphor';

export function resolveTheme(input: string | null | undefined): ThemeName {
  return THEMES.some(t => t.name === input) ? (input as ThemeName) : DEFAULT_THEME;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/themes.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Port the CSS-var token system + themes into global.css**

Append to `src/styles/global.css` — port the `:root` and `html[data-theme=…]` blocks from `prototype/variant-k.html`, but set the phosphor default. Keep the warm-black surfaces, rule, text, muted exactly as the prototype:

```css
:root {
  --bg: #0B0A08; --surface: #14120E; --rule: #2A2722;
  --text: #EDEAE2; --muted: #97917F;
  /* default = phosphor (refined), not the prototype's amber */
  --accent: #45E08A; --accent-rgb: 69, 224, 138; --accent-2: #B6FFC9;
  --amber: var(--accent); --green: var(--accent-2);
  --ease-hard: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}
html[data-theme="amber"]  { --accent:#FFB000; --accent-rgb:255,176,0;   --accent-2:#33FF66; }
html[data-theme="violet"] { --accent:#BD93F9; --accent-rgb:189,147,249; --accent-2:#50FA7B; }
html[data-theme="cyan"]   { --accent:#4FD8FF; --accent-rgb:79,216,255;  --accent-2:#B8F1FF; }
html[data-theme="red"]    { --accent:#FF4538; --accent-rgb:255,69,56;   --accent-2:#FFB000; }
html[data-theme="mono"]   { --accent:#F5F2EA; --accent-rgb:245,242,234; --accent-2:#97917F; }

* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
```

> Note: `phosphor` is the default in `:root` itself (no `html[data-theme="phosphor"]` block needed). The original prototype amber is now reachable only via `data-theme="amber"`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/themes.ts src/lib/themes.test.ts src/styles/global.css
git commit -m "feat: add theme token system with tested resolution"
```

---

### Task 3: Pure motion/scroll/format logic (TDD)

**Files:**
- Create: `src/lib/kinetic.ts`, `src/lib/kinetic.test.ts`, `src/lib/scroll.ts`, `src/lib/scroll.test.ts`, `src/lib/format.ts`, `src/lib/format.test.ts`

- [ ] **Step 1: Write failing tests for kinetic math**

`src/lib/kinetic.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { proximityToAxes } from './kinetic';

describe('proximityToAxes', () => {
  it('returns base axes when the cursor is outside the radius', () => {
    expect(proximityToAxes(500, 200)).toEqual({ wght: 250, wdth: 80 });
  });
  it('returns max axes when the cursor is on the glyph', () => {
    expect(proximityToAxes(0, 200)).toEqual({ wght: 800, wdth: 112.5 });
  });
  it('interpolates linearly with proximity', () => {
    const mid = proximityToAxes(100, 200); // t = 0.5
    expect(mid.wght).toBeCloseTo(525, 5);
    expect(mid.wdth).toBeCloseTo(96.25, 5);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

Run: `npx vitest run src/lib/kinetic.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement kinetic.ts** (extracted from the prototype's rAF loop math)

```ts
export interface Axes { wght: number; wdth: number; }

const BASE: Axes = { wght: 250, wdth: 80 };
const MAX: Axes  = { wght: 800, wdth: 112.5 };

/** Map cursor distance (px) to variable-font axes. t = 1 on the glyph, 0 at/after radius. */
export function proximityToAxes(distance: number, radius: number): Axes {
  const t = Math.max(0, 1 - distance / radius);
  return {
    wght: BASE.wght + t * (MAX.wght - BASE.wght),
    wdth: BASE.wdth + t * (MAX.wdth - BASE.wdth),
  };
}
```

- [ ] **Step 4: Run, expect PASS** — `npx vitest run src/lib/kinetic.test.ts`

- [ ] **Step 5: Write failing tests for scroll math**

`src/lib/scroll.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { pinnedProgress, currentPanel } from './scroll';

describe('pinnedProgress', () => {
  it('is 0 before the section is pinned (top >= 0)', () => {
    expect(pinnedProgress({ top: 0, height: 4000 }, 1000)).toBe(0);
  });
  it('is 1 at the end of the pinned range', () => {
    // total scrollable = height - viewportH = 3000; top = -3000 => p = 1
    expect(pinnedProgress({ top: -3000, height: 4000 }, 1000)).toBe(1);
  });
  it('clamps and interpolates in between', () => {
    expect(pinnedProgress({ top: -1500, height: 4000 }, 1000)).toBeCloseTo(0.5, 5);
    expect(pinnedProgress({ top: -9999, height: 4000 }, 1000)).toBe(1);
  });
});

describe('currentPanel', () => {
  it('maps progress to a 1-based panel index, capped', () => {
    expect(currentPanel(0, 4)).toBe(1);
    expect(currentPanel(0.5, 4)).toBe(3);
    expect(currentPanel(1, 4)).toBe(4);
  });
});
```

- [ ] **Step 6: Run, expect FAIL** — `npx vitest run src/lib/scroll.test.ts`

- [ ] **Step 7: Implement scroll.ts**

```ts
export interface RectLike { top: number; height: number; }

/** Progress 0..1 of a sticky-pinned section, given its rect and viewport height. */
export function pinnedProgress(rect: RectLike, viewportH: number): number {
  const total = rect.height - viewportH;
  if (total <= 0) return 0;
  return Math.min(Math.max(-rect.top / total, 0), 1);
}

/** Horizontal track offset in px for a given progress. */
export function trackOffset(progress: number, trackScrollWidth: number, viewportW: number): number {
  return -progress * Math.max(trackScrollWidth - viewportW, 0);
}

/** 1-based index of the panel currently in view. */
export function currentPanel(progress: number, panelCount: number): number {
  return Math.min(Math.floor(progress * panelCount) + 1, panelCount);
}
```

- [ ] **Step 8: Run, expect PASS** — `npx vitest run src/lib/scroll.test.ts`

- [ ] **Step 9: Write failing tests for format/counters**

`src/lib/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { easeOutCubic, countAt } from './format';

describe('counter formatting', () => {
  it('easeOutCubic hits endpoints', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });
  it('countAt formats with decimals and eases', () => {
    expect(countAt(17, 1, 0)).toBe('17');
    expect(countAt(4.2, 1, 1)).toBe('4.2');
    expect(countAt(17, 0, 0)).toBe('0');
  });
});
```

- [ ] **Step 10: Run, expect FAIL** — `npx vitest run src/lib/format.test.ts`

- [ ] **Step 11: Implement format.ts**

```ts
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Eased intermediate value of a counter, formatted to `decimals`. */
export function countAt(target: number, t: number, decimals: number): string {
  return (target * easeOutCubic(Math.min(Math.max(t, 0), 1))).toFixed(decimals);
}
```

- [ ] **Step 12: Run, expect PASS** — `npx vitest run src/lib/format.test.ts`

- [ ] **Step 13: Commit**

```bash
git add src/lib/kinetic.* src/lib/scroll.* src/lib/format.*
git commit -m "feat: add tested kinetic/scroll/format logic for islands"
```

---

### Task 4: Base layout, fonts, theme bootstrap

**Files:**
- Create: `src/layouts/Base.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Implement Base.astro**

Imports fonts once, sets lang, head/meta, and a tiny inline script that applies the saved theme BEFORE paint (prevents a theme flash). Uses `resolveTheme` via an inline copy of the name list to stay dependency-free in the head.

```astro
---
import '@fontsource-variable/martian-mono';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '../styles/global.css';
import { DEFAULT_THEME } from '../lib/themes';
const { title = 'Nico Sutheimer — Fullstack Engineer, Data & BI', description = 'Fullstack engineer building data platforms end to end — pipeline to pixel.' } = Astro.props;
---
<!doctype html>
<html lang="en" data-theme={DEFAULT_THEME}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <script is:inline>
    // apply saved accent theme before first paint
    try {
      const valid = ['phosphor','amber','violet','cyan','red','mono'];
      const t = sessionStorage.getItem('k-theme');
      if (valid.includes(t)) document.documentElement.dataset.theme = t;
    } catch (_) {}
  </script>
</head>
<body><slot /></body>
</html>
```

- [ ] **Step 2: Point index.astro at the layout**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base><main class="font-mono p-8">layout ok</main></Base>
```

- [ ] **Step 3: Define the font-family utilities in global.css**

Append:

```css
:root {
  --disp: "Martian Mono Variable", ui-monospace, monospace;
  --mono: "IBM Plex Mono", ui-monospace, monospace;
}
body { font-family: var(--mono); font-variant-numeric: tabular-nums; }
```

- [ ] **Step 4: Verify build + fonts resolve**

Run: `npm run build` Expected: build succeeds, `dist/` produced, no missing-font warnings.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Base.astro src/pages/index.astro src/styles/global.css
git commit -m "feat: base layout with self-hosted fonts and pre-paint theme"
```

---

### Task 5: HUD + ThemeSwitcher island

**Files:**
- Create: `src/components/Hud.astro`, `src/components/ThemeSwitcher.tsx`

Port the HUD bar markup/styles from the `prototype/variant-k.html` `<header class="hud top">` + `.hud`/`.themes` CSS. Move per-component CSS into a scoped `<style>` in `Hud.astro`.

- [ ] **Step 1: ThemeSwitcher.tsx** (island — swatches + keys 1–6 + sessionStorage, ported from the prototype `setTheme`/`THEMES` script, now using `src/lib/themes.ts`)

```tsx
import { useEffect, useState } from 'react';
import { THEMES, resolveTheme, type ThemeName } from '../lib/themes';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeName>('phosphor');

  useEffect(() => {
    const initial = resolveTheme(sessionStorage.getItem('k-theme'));
    apply(initial);
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, [contenteditable]')) return;
      const n = parseInt(e.key, 10) - 1;
      if (n >= 0 && n < THEMES.length) apply(THEMES[n].name);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function apply(name: ThemeName) {
    document.documentElement.dataset.theme = name;
    try { sessionStorage.setItem('k-theme', name); } catch (_) {}
    setTheme(name);
  }

  return (
    <span className="themes" aria-label="Accent color themes (keys 1–6)">
      {THEMES.map((t, i) => (
        <button
          key={t.name}
          className={t.name === theme ? 'on' : ''}
          style={{ background: t.swatch }}
          title={`${t.label} (${i + 1})`}
          onClick={() => apply(t.name)}
        />
      ))}
    </span>
  );
}
```

- [ ] **Step 2: Hud.astro** (mounts the island with `client:load`; ports the `.hud` markup + scoped CSS from the prototype, including the pulsing status dot and live clock — keep the clock as a tiny inline script)

```astro
---
import ThemeSwitcher from './ThemeSwitcher.tsx';
---
<header class="hud top">
  <span>NS/OS 2.6 — portfolio.service</span>
  <ThemeSwitcher client:load />
  <span class="hide-sm" id="clock">--:--:--</span>
  <span class="dot">All pipelines green</span>
</header>
<script is:inline>
  (function tick(){ const c=document.getElementById('clock');
    if(c) c.textContent=new Date().toLocaleTimeString('de-DE'); setTimeout(tick,1000); })();
</script>
<style>
  /* PORT from prototype/variant-k.html: .hud, .hud.top, .hud .amber, .dot::before,
     .themes, .themes button, .themes button.on — verbatim, vars already global. */
</style>
```

- [ ] **Step 3: Mount HUD in index, verify themes switch in browser**

Add `<Hud />` to `index.astro`. Run `npm run dev`; in the browser confirm: clicking swatches and pressing keys 1–6 recolors the accent, choice persists on reload (sessionStorage), default is phosphor green.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hud.astro src/components/ThemeSwitcher.tsx src/pages/index.astro
git commit -m "feat: HUD bar with theme switcher island"
```

---

### Task 6: KineticName + BootLine islands

**Files:**
- Create: `src/components/KineticName.tsx`, `src/components/BootLine.tsx`

- [ ] **Step 1: KineticName.tsx** — splits the name into per-letter spans, runs the rAF loop using `proximityToAxes` from `src/lib/kinetic.ts`, lerps toward the target (factor 0.13), skips offscreen glyphs, gates on `(hover:hover) and (pointer:fine)` + `prefers-reduced-motion`. Ports the `.kname`/`.ch` behavior and the clip-reveal load animation from the prototype hero.

```tsx
import { useEffect, useRef } from 'react';
import { proximityToAxes } from '../lib/kinetic';

interface Props { lines: string[]; }

export default function KineticName({ lines }: Props) {
  const root = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduced || !fine) return;

    const chars = Array.from(el.querySelectorAll<HTMLElement>('.ch'));
    const state = chars.map(() => ({ w: 250, d: 80 }));
    let mx = -9999, my = -9999, raf = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove);

    const RADIUS = 200;
    const frame = () => {
      chars.forEach((ch, i) => {
        const r = ch.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const dist = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        const target = proximityToAxes(dist, RADIUS);
        state[i].w += (target.wght - state[i].w) * 0.13;
        state[i].d += (target.wdth - state[i].d) * 0.13;
        ch.style.fontVariationSettings = `"wght" ${state[i].w.toFixed(0)}, "wdth" ${state[i].d.toFixed(1)}`;
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); };
  }, []);

  return (
    <h1 className="kname" ref={root} aria-label={lines.join(' ')}>
      {lines.map((line, li) => (
        <span className="row" key={li}>
          <span className="rin">
            {line.split('').map((c, ci) =>
              c === ' ' ? ' ' : <span className="ch" key={ci} aria-hidden="true">{c}</span>)}
          </span>
        </span>
      ))}
    </h1>
  );
}
```

- [ ] **Step 2: BootLine.tsx** — types the boot command then signals the page is "booted" (adds a class to `document.body`), gated on reduced-motion (instant). Ports the prototype boot sequence.

```tsx
import { useEffect, useRef } from 'react';

export default function BootLine({ command = 'run portfolio --env=prod' }: { command?: string }) {
  const out = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = out.current; if (!el) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const done = () => document.body.classList.add('booted');
    if (reduced) { el.textContent = command; done(); return; }
    let i = 0, timer = 0;
    const type = () => {
      el.textContent = command.slice(0, ++i);
      if (i < command.length) timer = window.setTimeout(type, 24 + (i % 7 === 0 ? 55 : 0));
      else setTimeout(done, 150);
    };
    type();
    return () => clearTimeout(timer);
  }, [command]);
  return (
    <div className="bootline">
      <span className="u">nico@sutheimer:~$</span> <span className="cmd" ref={out}></span>
      <span className="caret" aria-hidden="true"></span>
    </div>
  );
}
```

- [ ] **Step 3: Port hero CSS** into a scoped style (in the hero section component or `index.astro`): `.hero`, `.bootline`, `.caret`, `.kname`, `.kname .row/.rin/.ch`, `.kname .amber`, the `.booted` reveal transitions — verbatim from the prototype, vars are global.

- [ ] **Step 4: Verify in browser** — boot types on load, name reveals, letters swell toward the cursor, reduced-motion shows everything static.

- [ ] **Step 5: Commit**

```bash
git add src/components/KineticName.tsx src/components/BootLine.tsx
git commit -m "feat: kinetic name + boot line islands"
```

---

### Task 7: Projects content collection (TDD the schema)

**Files:**
- Create: `src/content/config.ts`, `src/content/config.test.ts`, `src/content/projects/after-sales-bi.md`, `src/content/projects/scouting-rag.md`

- [ ] **Step 1: Write a failing schema test** (validates a representative front-matter object against the zod schema)

`src/content/config.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { projectSchema } from './config';

describe('project schema', () => {
  it('accepts a complete project', () => {
    const ok = projectSchema.safeParse({
      title: 'After-Sales BI Platform', slug: 'after-sales-bi', order: 1,
      status: 'running', year: '2024–26', stack: ['Airflow', 'dbt', 'React'],
      summary: 'Multi-tenant analytics, end to end.',
    });
    expect(ok.success).toBe(true);
  });
  it('rejects an invalid status', () => {
    const bad = projectSchema.safeParse({
      title: 'x', slug: 'x', order: 1, status: 'wat', year: '2025', stack: [], summary: 's',
    });
    expect(bad.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect FAIL** — `npx vitest run src/content/config.test.ts`

- [ ] **Step 3: Implement config.ts** (export the raw zod schema separately so it is unit-testable)

```ts
import { defineCollection, z } from 'astro:content';

export const projectSchema = z.object({
  title: z.string(),
  slug: z.string(),
  order: z.number(),                 // queue order
  status: z.enum(['running', 'research', 'in-progress']),
  year: z.string(),
  stack: z.array(z.string()),
  summary: z.string(),               // shown on the queue card
  jobId: z.string().optional(),      // e.g. "bi-platform"
});

const projects = defineCollection({ type: 'content', schema: projectSchema });
export const collections = { projects };
```

> Note: `astro:content` is unavailable in plain Vitest. Add to `vitest.config.ts` an alias mapping `astro:content` to a tiny stub that re-exports `z` from `zod` and a no-op `defineCollection`, so only `projectSchema` (pure zod) is exercised. Stub: `src/test/astro-content-stub.ts` → `export { z } from 'zod'; export const defineCollection = (c:any)=>c;`. Add `resolve.alias` in vitest config.

- [ ] **Step 4: Run, expect PASS** — `npx vitest run src/content/config.test.ts`

- [ ] **Step 5: Seed two real project files** (skeleton front-matter; prose filled in Task 11)

`src/content/projects/after-sales-bi.md`:

```md
---
title: After-Sales BI Platform
slug: after-sales-bi
order: 1
status: running
year: "2024–26"
stack: ["Airflow", "Snowflake", "dbt", "FastAPI", "React"]
summary: "Multi-tenant analytics for automotive after-sales: orchestrated ingestion, layered warehouse, row-level-secured APIs, React dashboards."
jobId: bi-platform
---
Prose body filled in Task 11.
```

`src/content/projects/scouting-rag.md`:

```md
---
title: Scouting RAG Study
slug: scouting-rag
order: 2
status: research
year: "2026"
stack: ["Python", "Embeddings", "Eval harness"]
summary: "Controlled retrieval-technique comparison under a strict eval harness — one variable per cycle."
jobId: scouting-rag
---
Prose body filled in Task 11.
```

- [ ] **Step 6: Commit**

```bash
git add src/content vitest.config.ts src/test
git commit -m "feat: projects content collection with tested schema + seed entries"
```

---

### Task 8: JobQueue island (scroll-pinned, reads the collection)

**Files:**
- Create: `src/components/JobQueue.tsx`
- Data: passed in from `index.astro` via `getCollection('projects')`

- [ ] **Step 1: JobQueue.tsx** — receives sorted projects as props, renders the pinned horizontal track, drives `translateX` from `pinnedProgress`/`trackOffset` and the progress label from `currentPanel` (all from `src/lib/scroll.ts`); reduced-motion falls back to a vertical stack (port the prototype's `@media (prefers-reduced-motion)` queue rules).

```tsx
import { useEffect, useRef } from 'react';
import { pinnedProgress, trackOffset, currentPanel } from '../lib/scroll';

export interface QueueItem {
  title: string; slug: string; status: string; year: string;
  stack: string[]; summary: string; jobId?: string; n: number;
}

const BADGE: Record<string, string> = {
  running: 'RUNNING', research: 'RESEARCH', 'in-progress': 'IN PROGRESS',
};

export default function JobQueue({ items }: { items: QueueItem[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const prog = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onScroll = () => {
      const sec = section.current, tr = track.current; if (!sec || !tr) return;
      const r = sec.getBoundingClientRect();
      const p = pinnedProgress({ top: r.top, height: r.height }, innerHeight);
      tr.style.transform = `translateX(${trackOffset(p, tr.scrollWidth, innerWidth)}px)`;
      if (prog.current)
        prog.current.textContent =
          String(currentPanel(p, items.length)).padStart(2, '0') + ' / 0' + items.length;
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); };
  }, [items.length]);

  return (
    <section className="queue" id="work" ref={section} aria-label="Selected work">
      <div className="pin">
        <div className="qhead"><span>./jobs — selected work</span>
          <span><span className="amber" ref={prog}>01 / 0{items.length}</span></span></div>
        <div className="qtrack" ref={track}>
          {items.map((it) => (
            <article className="job" key={it.slug}>
              <div className="jid"><span>job_id: {it.jobId ?? it.slug}</span>
                <span className={'badge' + (it.status !== 'running' ? ' res' : '')}>{BADGE[it.status]}</span></div>
              <div className="no">{String(it.n).padStart(2, '0')}</div>
              <h3>{it.title}</h3>
              <p>{it.summary}</p>
              <div className="jfoot"><span>{it.stack.join(' · ')}</span><span className="yr">{it.year}</span></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Port the `.queue/.pin/.qhead/.qtrack/.job/...` CSS** verbatim from the prototype into a scoped style block used on the page.

- [ ] **Step 3: Wire data in index.astro**

```astro
---
import { getCollection } from 'astro:content';
import JobQueue from '../components/JobQueue.tsx';
const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
const items = projects.map((p, i) => ({ ...p.data, n: i + 1 }));
---
<JobQueue items={items} client:visible />
```

- [ ] **Step 4: Verify** — scroll pins the section and scrolls cards horizontally; progress label updates; reduced-motion stacks vertically.

- [ ] **Step 5: Commit**

```bash
git add src/components/JobQueue.tsx src/pages/index.astro
git commit -m "feat: scroll-pinned job queue reading the projects collection"
```

---

### Task 9: Marquee, Figures, Stack/About, Contact, Footer + assemble landing

**Files:**
- Create: `src/components/StatsMarquee.astro`, `src/components/Figures.tsx`, `src/components/SqlHero.astro`, `src/components/StackAbout.astro`, `src/components/Contact.astro`, `src/components/SiteFooter.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: StatsMarquee.astro** — port the `.marquee` markup + CSS; duplicate the track content at build time (static) for the seamless `-50%` loop instead of the prototype's runtime `innerHTML += innerHTML`.

- [ ] **Step 2: SqlHero.astro** — port the static `.sqlbox` SQL block verbatim (no JS needed beyond the `.booted` reveal already triggered by BootLine).

- [ ] **Step 3: Figures.tsx** — island; IntersectionObserver triggers counters using `countAt` from `src/lib/format.ts`; reduced-motion sets final values immediately. Port `.figures/.fig` CSS. Props: `figures: {target:number; decimals:number; suffix?:string; label:string}[]`.

```tsx
import { useEffect, useRef } from 'react';
import { countAt } from '../lib/format';

interface Fig { target: number; decimals: number; suffix?: string; label: string; }

export default function Figures({ figures }: { figures: Fig[] }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = root.current!.querySelectorAll<HTMLElement>('.count');
    const io = new IntersectionObserver((es, obs) => es.forEach(e => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      const el = e.target as HTMLElement;
      const target = parseFloat(el.dataset.t!), dec = parseInt(el.dataset.d || '0', 10);
      if (reduced) { el.textContent = countAt(target, 1, dec); return; }
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - t0) / 900, 1);
        el.textContent = countAt(target, t, dec);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: 0.5 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div className="figures" ref={root}>
      {figures.map((f, i) => (
        <div className="fig" key={i}>
          <div className="num"><span className="count" data-t={f.target} data-d={f.decimals}>0</span>{f.suffix}</div>
          <div className="lbl">{f.label}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: StackAbout.astro + Contact.astro + SiteFooter.astro** — port the `.duo` stack/about, `.contact` (kinetic mail link reuses the `.bigmail` hover, pure CSS), and footer markup + CSS verbatim. Contact mail/links use real values (`hello@nicosutheimer.dev` placeholder until confirmed; GitHub `sutheimernico`).

- [ ] **Step 5: Assemble index.astro** in prototype order: `Hud → hero(BootLine + KineticName + SqlHero + scrollcue) → StatsMarquee → JobQueue → Figures → StackAbout → Contact → SiteFooter`. Move all ported section CSS into the relevant component `<style>` blocks (no global leakage; watch selector specificity per frontend-design skill note).

- [ ] **Step 6: Verify the full page** end to end in the browser at 1440px, 768px, 360px; confirm reduced-motion path.

- [ ] **Step 7: Commit**

```bash
git add src/components src/pages/index.astro
git commit -m "feat: assemble full landing page from ported sections"
```

---

### Task 10: Project detail pages

**Files:**
- Create: `src/pages/projects/[slug].astro`

- [ ] **Step 1: Generate a page per project from the collection**

```astro
---
import { getCollection, getEntry } from 'astro:content';
import Base from '../../layouts/Base.astro';
export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map(p => ({ params: { slug: p.data.slug }, props: { slug: p.data.slug } }));
}
const { slug } = Astro.props;
const entry = await getEntry('projects', slug);
const { Content } = await entry.render();
---
<Base title={`${entry.data.title} — Nico Sutheimer`} description={entry.data.summary}>
  <main class="detail">
    <a href="/#work" class="back">← back to jobs</a>
    <header>
      <span class="badge">{entry.data.status}</span>
      <h1>{entry.data.title}</h1>
      <p class="meta">{entry.data.stack.join(' · ')} — {entry.data.year}</p>
    </header>
    <article class="prose"><Content /></article>
  </main>
</Base>
<style>/* terminal-styled detail layout, tokens from global.css */</style>
```

- [ ] **Step 2: Make queue cards link to detail pages** — in `JobQueue.tsx`, wrap each `.job` in `<a href={'/projects/' + it.slug}>`.

- [ ] **Step 3: Verify** — each project links to a working `/projects/<slug>` page; `npm run build` emits one HTML file per project.

- [ ] **Step 4: Commit**

```bash
git add src/pages/projects/[slug].astro src/components/JobQueue.tsx
git commit -m "feat: project detail pages from the content collection"
```

---

### Task 11: Draft content (research subagent → Markdown), Nico corrects

**Files:**
- Create: `src/content/projects/{dms-ingestion,serving-layer,<ml-project>,<rag-project>}.md`
- Modify: the two seed project files + a new `src/content/about.md` (or inline about copy)

- [ ] **Step 1: Dispatch a research subagent** (read-only) to gather concrete patterns: how award-level data/ML engineer portfolios frame project case studies (problem → approach → result → stack) and write a credible, non-generic bio for a data→fullstack profile. Return a copy brief, not prose to paste blindly.

- [ ] **Step 2: Draft each project's prose body** grounded in known facts: After-Sales BI platform and Scouting RAG are real (from bekumoo + `~/private/scouting-rag`); DMS ingestion + serving layer are real bekumoo subsystems; add 1–2 **aspirational ML/RAG projects** with `status: in-progress` and copy that says plainly they're being built (no fake results). Each body: 3–5 short paragraphs, problem/approach/outcome, honest.

- [ ] **Step 3: Draft the bio/about copy** — first person, grounded in the data→fullstack story; no "passionate crafting digital experiences" clichés (frontend-design skill bans these).

- [ ] **Step 4: Mark every drafted claim Nico must verify** with an inline `<!-- VERIFY: … -->` comment so he can scan and correct.

- [ ] **Step 5: Build + browser check** that all project cards and detail pages render with real content.

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "feat: draft project case studies and bio (pending Nico's review)"
```

- [ ] **Step 7: HANDOFF** — list every `VERIFY` marker for Nico in the task report; do not claim content is final.

---

### Task 12: Quality pass — a11y, responsive, reduced-motion, SEO, favicon

**Files:**
- Create: `public/favicon.svg`, `public/og.png` (or generated), `src/components/*` (tweaks)

- [ ] **Step 1:** Run the project `design-reviewer` (visual/motion/spec) and global `frontend-reviewer` (React/TS/a11y) subagents on the diff; fix findings.
- [ ] **Step 2:** Keyboard: focus-visible on every interactive element (switcher buttons, links); the theme keys (1–6) and the prototype's arrow handling don't trap inputs.
- [ ] **Step 3:** `prefers-reduced-motion`: confirm boot is instant, name static, queue vertical, counters jump to final, marquee paused.
- [ ] **Step 4:** Responsive: 360 / 768 / 1280 — HUD wraps, hero scales, queue usable, no horizontal overflow.
- [ ] **Step 5:** Meta: title/description/OG done in Base; add `favicon.svg` (terminal/phosphor mark) and an OG image; `lang="en"`.
- [ ] **Step 6:** `npm run build` clean; check `dist/` has index + project pages + assets.
- [ ] **Step 7: Commit** — `git commit -am "polish: a11y, responsive, reduced-motion, seo, favicon"`

---

### Task 13: Deploy to Cloudflare Pages (private repo, free)

**Files:**
- Create: `package.json` build script confirmation, `.node-version` (pin Node 20), optional `public/_headers`

- [ ] **Step 1:** Confirm build locally: `npm run build` → `dist/`. Set `"build": "astro build"` exists.
- [ ] **Step 2:** Pin Node for Pages — create `.node-version` containing `20`.
- [ ] **Step 3: HANDOFF (browser, Nico does this once)** — Cloudflare needs an OAuth grant Claude can't perform:
  1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
  2. Authorize the **Cloudflare GitHub app** on the **private** `sutheimernico/Portfolio` repo only.
  3. Pick the repo, production branch `main`, framework preset **Astro**, build command `npm run build`, output dir `dist`.
  4. Deploy. Note the `*.pages.dev` URL.
- [ ] **Step 4:** Update `astro.config.mjs` `site:` to the real `*.pages.dev` (or custom domain) URL; commit.
- [ ] **Step 5:** Merge `feat/build-site` → `main` via PR so the production branch builds. Confirm the live URL renders and themes/animations work.
- [ ] **Step 6: Commit/PR** — open the PR (GitHub flow, `gh` if installed else web); do not force-push.

> **Domain options** (confirmed by research 2026-06-13):
> - Free auto-subdomain you name yourself: `<project>.pages.dev` (pick the project name).
> - Free *real* domain: **is-a.dev** → PR to `is-a-dev/register` for `nico.is-a.dev` (dev-branded, ~12–24h approval), DNS → Pages. Best free route.
> - Cheapest paid: **Cloudflare Registrar** `.dev` or `.com` ≈ €10/yr at-cost (same price on renewal, free WHOIS privacy). `.dev` forces HTTPS, pairs well with a dev portfolio.
> - Custom domain + auto-SSL is free on Cloudflare Pages. v1 ships on `*.pages.dev`; domain is a follow-up.

---

### Task 14: Docs + prototype cleanup

- [ ] **Step 1:** Append an `## Implementation Notes` section to this plan: what was built, deviations, test evidence (`vitest run` output), the live URL, open `VERIFY` content items.
- [ ] **Step 2:** Update `README.md` — real run/build/deploy instructions, stack, how to add a project (drop a Markdown file in `src/content/projects/`).
- [ ] **Step 3:** Write the design spec `docs/superpowers/specs/2026-06-13-design-system.md` capturing the locked tokens (final green, type scale, motion durations/easings) so future UI work has a contract.
- [ ] **Step 4:** Delete the throwaway `prototype/` folder (its job is done — variant K now lives as real components) in a dedicated commit, or keep only `variant-k.html` as a visual reference if Nico prefers. Confirm with Nico before deleting.
- [ ] **Step 5: Commit** — `git commit -m "docs: implementation notes, readme, design spec"`

---

## Self-review

**Spec coverage:** Astro+React+Tailwind (T1), port K visuals (T4–T9), refined green/themes (T2), kinetic name (T6), job queue (T8), content collection for projects (T7,T8,T10), drafted content (T11), Cloudflare deploy from private repo (T13). All covered.

**Placeholder scan:** Visual CSS is "port from prototype section X" — concrete (the prototype is complete, committed code), not a TODO. All logic/schema/config steps carry full code. Content prose is deliberately deferred to T11 (a real task with its own steps), not hand-waved.

**Type consistency:** `resolveTheme`/`ThemeName`/`THEMES` shared T2↔T5; `proximityToAxes` T3↔T6; `pinnedProgress`/`trackOffset`/`currentPanel` T3↔T8; `countAt`/`easeOutCubic` T3↔T9; `projectSchema` fields (`order,status,year,stack,summary,jobId,slug,title`) consistent T7↔T8↔T10. Consistent.
