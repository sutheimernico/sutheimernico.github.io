# Portfolio Prototype Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the approved "variant-shift" prototype (`prototype/variant-shift.html`) into the real Astro/React codebase as the production landing page, with projects driven by an editable content collection.

**Architecture:** Keep the existing tested foundation (Astro 6 + React 19 islands + Tailwind v4, `src/lib/*` pure logic, `Base.astro` no-FOUC bootstrap, self-hosted Martian Mono + IBM Plex Mono). Replace the five non-default accent themes with the prototype's palettes and add an animated **Shift** mode. Each prototype effect becomes a React island that imports framework-agnostic logic from `src/lib/`; visual styling is ported into scoped component `<style>` blocks and global tokens. Projects become an `astro:content` collection so adding one = adding a Markdown file.

**Tech stack:** Astro 6.4.6, React 19, Tailwind v4, TypeScript (strict), Vitest 4. No new heavy deps (the prototype runs on vanilla rAF/Canvas/CSS-3D — no GSAP/Lenis/three needed).

**This supersedes** the variant-k section plan in `2026-06-13-portfolio-site.md` (Tasks T6–T11 there). The foundation tasks (T1–T5) of that plan stay valid and are reused.

**Source of truth:** `prototype/variant-shift.html` (committed). Port sections verbatim in look; do not reinvent. Reduced-motion fallbacks already exist in the prototype — preserve them.

---

## File Structure

**Logic (pure, unit-tested with Vitest) — `src/lib/`**
- `themes.ts` (MODIFY) — `ThemeName` union, `THEMES` list, `DEFAULT_THEME`, `resolveTheme()`. Swap palette names.
- `shift.ts` (CREATE) — `PALETTES`, `mixHex()`, `paletteAt(t)` → flat map of CSS-var name → value for the animated shift mode. Framework-agnostic; the island just sets the returned vars.
- `kinetic.ts`, `scroll.ts`, `format.ts` (REUSE, unchanged) — `proximityToAxes`, `pinnedProgress`/`trackOffset`/`currentPanel`, `easeOutCubic`/`countAt`.

**Content — `src/content/`**
- `src/content.config.ts` (CREATE) — `projects` collection (glob loader) + exported `projectSchema` (zod) so the schema is unit-testable.
- `src/content/projects/*.md` (CREATE) — 4 seed entries.

**Styling — `src/styles/global.css`** (MODIFY) — expand the token set to the prototype's full set, replace the `html[data-theme=…]` blocks, add `--wip` status token + daylight overrides + `.theming` transition helper. Keep `@theme inline` font mapping.

**Components — `src/components/`** (CREATE all)
- `NsMonogram.astro` — the interlocking offset-S NS SVG (props for stroke treatment); reused in nav, boot, about, favicon.
- `ThemeSwitcher.tsx` (island) — 6 swatches + Shift toggle, number keys 1–7, localStorage, drives `data-theme` and the shift loop via `src/lib/shift.ts`.
- `ColdBoot.tsx` (island) — boot overlay: scanlines, NS draw-on, scrambled log; dismiss on click/scroll/key + safety timeout.
- `HeroMercury.tsx` (island) — cursor-reactive 3D tilt + specular over the NS monogram.
- `DataSpine.tsx` (island) — scroll-driven rotating 3D vertebra column built from the projects collection; active-panel sync via `src/lib/scroll.ts`.
- `ProjectDeck.tsx` (island) — exploded → fanned project cards from the collection; responsive spread.
- `Constellation.tsx` (island) — mouse-reactive canvas skill graph; animates only while in view; reads theme accent from CSS vars.
- `Nav.astro`, `HeroSection.astro`, `AboutSection.astro`, `ContactSection.astro`, `SiteFooter.astro` — static Astro shells that mount the islands.

**Pages — `src/pages/`**
- `index.astro` (MODIFY) — query the projects collection, assemble all sections, mount islands with correct client directives.

**Config**
- `package.json` (MODIFY) — add `"test": "vitest run"`.

**Naming convention decision (locked here):** adopt the prototype's richer token names as the single set — `--bg, --bg-warm, --surface, --surface-2, --line, --line-soft, --canvas-bg, --ink, --ink-dim, --ink-faint, --accent, --accent-soft, --accent-rgb, --accent-2, --accent-2-rgb, --accent-3, --accent-3-rgb, --chrome-mid, --wip`. Migrate the existing `--text/--muted/--rule` (only used in `global.css` body) to `--ink/--ink-dim/--line`. Keep `--ease-hard`/`--ease-out` and the `--mono`/`--disp` font tokens. Fonts: use **Martian Mono** for display/headings and **IBM Plex Mono** for body (replace the prototype's system-font + serif stacks; serif accents become Martian Mono).

---

## Task 0: Branch, prototype reference, test script

**Files:**
- Reference (DONE): `prototype/variant-shift.html` (already copied)
- Modify: `package.json`

- [ ] **Step 1:** Confirm on branch `feat/build-site` (not main): `git branch --show-current` → `feat/build-site`.
- [ ] **Step 2:** Add a test script. In `package.json` `"scripts"`, add `"test": "vitest run"`.
- [ ] **Step 3:** Verify the toolchain runs: `npm run test` → existing 12 tests pass.
- [ ] **Step 4:** Commit.

```bash
git add package.json prototype/variant-shift.html
git commit -m "chore: add test script and commit approved shift prototype as reference"
```

---

## Task 1: Replace theme palettes (TDD)

**Files:**
- Modify: `src/lib/themes.ts`
- Modify: `src/lib/themes.test.ts`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/Base.astro` (bootstrap valid-array)

- [ ] **Step 1: Update the failing tests** in `src/lib/themes.test.ts` to expect the new palette names.

```ts
import { describe, it, expect } from 'vitest';
import { THEMES, DEFAULT_THEME, resolveTheme } from './themes';

describe('themes', () => {
  it('exposes six selectable accent themes', () => {
    expect(THEMES.map(t => t.name)).toEqual(
      ['phosphor', 'petrol', 'amethyst', 'solar', 'molten', 'daylight'],
    );
  });
  it('defaults to phosphor', () => {
    expect(DEFAULT_THEME).toBe('phosphor');
  });
  it('falls back to the default for unknown input', () => {
    expect(resolveTheme('bogus')).toBe('phosphor');
    expect(resolveTheme(null)).toBe('phosphor');
    expect(resolveTheme('petrol')).toBe('petrol');
  });
});
```

- [ ] **Step 2: Run, verify it fails:** `npm run test -- themes` → FAIL (names mismatch).

- [ ] **Step 3: Update `src/lib/themes.ts`** to the new names + swatches (swatches taken from each palette's `--accent`):

```ts
export type ThemeName = 'phosphor' | 'petrol' | 'amethyst' | 'solar' | 'molten' | 'daylight';

export interface Theme {
  name: ThemeName;
  label: string;
  swatch: string; // accent hex for the switcher dot
}

// Order = display order in the switcher; keys 1..6 map to this order. Shift (key 7) is a mode, not a Theme.
export const THEMES: Theme[] = [
  { name: 'phosphor', label: 'Phosphor', swatch: '#45E08A' },
  { name: 'petrol',   label: 'Petrol',   swatch: '#2BD4C0' },
  { name: 'amethyst', label: 'Amethyst', swatch: '#A98BE6' },
  { name: 'solar',    label: 'Solar',    swatch: '#FF8A3D' },
  { name: 'molten',   label: 'Molten',   swatch: '#BFD0D8' },
  { name: 'daylight', label: 'Daylight', swatch: '#178A50' },
];

export const DEFAULT_THEME: ThemeName = 'phosphor';

export function resolveTheme(input: string | null | undefined): ThemeName {
  return THEMES.some(t => t.name === input) ? (input as ThemeName) : DEFAULT_THEME;
}
```

- [ ] **Step 4: Run, verify pass:** `npm run test -- themes` → PASS.

- [ ] **Step 5: Rewrite the token blocks in `src/styles/global.css`.** Keep `@import "tailwindcss";` and `@theme inline { --font-mono: var(--mono); --font-display: var(--disp); }`. Replace the `:root` and `html[data-theme]` blocks with the full token set, porting values from `prototype/variant-shift.html` `:root`/`:root[data-theme=…]` (its CSS top). Set `--mono: "IBM Plex Mono", ...` and `--disp: "Martian Mono Variable", ...` (keep the repo fonts). Add `--wip` (`#D9A441`, daylight `#8A5F00`), the `.theming` transition helper, and the daylight `body::after`/`hero-aurora`/`mercury-spec`/`cursor-glow` overrides from the prototype. Update `body` to use `--ink`/`--bg`. Keep the global `prefers-reduced-motion` reset.

- [ ] **Step 6: Update the no-FOUC bootstrap in `src/layouts/Base.astro`** (the inline `<script>`): change the valid array and storage key, and resume Shift mode without flashing. The shift loop itself starts in `ThemeSwitcher` after hydration; the bootstrap only needs to set a dark base when shift was saved.

```js
try {
  const valid = ['phosphor','petrol','amethyst','solar','molten','daylight','shift'];
  const t = localStorage.getItem('ns-theme2');
  if (valid.includes(t)) {
    document.documentElement.dataset.theme = (t === 'shift') ? 'phosphor' : t;
  }
} catch (_) {}
```

- [ ] **Step 7: Verify build + dev render.** `npm run build` → succeeds. `npm run dev`, open `/`, confirm no console errors and the page paints on the dark phosphor ground.

- [ ] **Step 8: Commit.**

```bash
git add src/lib/themes.ts src/lib/themes.test.ts src/styles/global.css src/layouts/Base.astro
git commit -m "feat: replace accent palettes with prototype themes (phosphor/petrol/amethyst/solar/molten/daylight)"
```

---

## Task 2: Shift mode logic (TDD)

**Files:**
- Create: `src/lib/shift.ts`
- Create: `src/lib/shift.test.ts`

- [ ] **Step 1: Write the failing test** `src/lib/shift.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PALETTES, mixHex, paletteAt } from './shift';

describe('shift', () => {
  it('cross-fades only through dark palettes (daylight excluded)', () => {
    expect(PALETTES.length).toBe(5);
  });
  it('mixHex interpolates each channel and returns "r,g,b"', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('0,0,0');
    expect(mixHex('#000000', '#ffffff', 1)).toBe('255,255,255');
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('128,128,128');
  });
  it('paletteAt returns a var map and wraps around the loop', () => {
    const a = paletteAt(0);
    expect(a['--accent']).toMatch(/^rgb\(/);
    expect(a['--accent-rgb']).toMatch(/^\d+,\d+,\d+$/);
    // t at an exact integer equals that palette's accent (te=smoothstep(0)=0)
    const p0 = paletteAt(0), pLen = paletteAt(PALETTES.length); // wraps to 0
    expect(p0['--accent']).toBe(pLen['--accent']);
  });
});
```

- [ ] **Step 2: Run, verify fail:** `npm run test -- shift` → FAIL (module missing).

- [ ] **Step 3: Implement `src/lib/shift.ts`.** Port `PALETTES`, `mix`, `paintShift` from `prototype/variant-shift.html` `<script>` (the shift engine block). Refactor into pure functions: `mixHex(a,b,t)` returns `"r,g,b"`; `paletteAt(t)` computes `i=floor(t)%N`, smoothstep `te`, and returns a flat object mapping every shift CSS-var name → value (the `PAL_MAP` colors as `rgb(...)`, plus `--accent-rgb`/`--accent-2-rgb`/`--accent-3-rgb` as triplets). No DOM access here.

```ts
export interface Palette {
  bg: string; bgWarm: string; surface: string; surface2: string;
  line: string; lineSoft: string; canvasBg: string;
  ink: string; inkDim: string; inkFaint: string;
  accent: string; accentSoft: string; accent2: string; accent3: string;
}

// dark palettes only — daylight is intentionally excluded (would flash bright)
export const PALETTES: Palette[] = [ /* phosphor, petrol, amethyst, solar, molten — port hex from prototype */ ];

const PAL_MAP: [string, keyof Palette][] = [
  ['--bg','bg'],['--bg-warm','bgWarm'],['--surface','surface'],['--surface-2','surface2'],
  ['--line','line'],['--line-soft','lineSoft'],['--canvas-bg','canvasBg'],
  ['--ink','ink'],['--ink-dim','inkDim'],['--ink-faint','inkFaint'],
  ['--accent','accent'],['--accent-soft','accentSoft'],['--accent-2','accent2'],
  ['--accent-3','accent3'],['--chrome-mid','accent'],
];

const hx = (c: string) => [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
export function mixHex(a: string, b: string, t: number): string {
  const x = hx(a), y = hx(b);
  return [0,1,2].map(i => Math.round(x[i] + (y[i]-x[i])*t)).join(',');
}

export function paletteAt(t: number): Record<string, string> {
  const N = PALETTES.length;
  const tt = ((t % N) + N) % N;
  const i = Math.floor(tt), j = (i+1) % N, f = tt - i, te = f*f*(3-2*f);
  const pa = PALETTES[i], pb = PALETTES[j];
  const out: Record<string, string> = {};
  for (const [varName, key] of PAL_MAP) out[varName] = `rgb(${mixHex(pa[key], pb[key], te)})`;
  out['--accent-rgb']   = mixHex(pa.accent,  pb.accent,  te);
  out['--accent-2-rgb'] = mixHex(pa.accent2, pb.accent2, te);
  out['--accent-3-rgb'] = mixHex(pa.accent3, pb.accent3, te);
  return out;
}
```

- [ ] **Step 4: Run, verify pass:** `npm run test -- shift` → PASS.
- [ ] **Step 5: Commit.**

```bash
git add src/lib/shift.ts src/lib/shift.test.ts
git commit -m "feat: add tested palette cross-fade logic for shift mode"
```

---

## Task 3: Projects content collection (TDD on schema)

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/projects/after-sales-bi.md`, `scouting-rag.md`, `this-portfolio.md`, `data-quality.md`
- Create: `src/lib/projectSchema.test.ts`

- [ ] **Step 1: Write the failing schema test** `src/lib/projectSchema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { projectSchema } from '../content.config';

const valid = {
  title: 'After-Sales BI Platform', order: 1, status: 'production',
  year: '2024', stack: ['Azure','dbt'], summary: 'x', role: 'the backbone', featured: true,
};

describe('projectSchema', () => {
  it('accepts a well-formed project', () => {
    expect(projectSchema.safeParse(valid).success).toBe(true);
  });
  it('rejects an unknown status', () => {
    expect(projectSchema.safeParse({ ...valid, status: 'nope' }).success).toBe(false);
  });
  it('requires a numeric order', () => {
    expect(projectSchema.safeParse({ ...valid, order: 'first' }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run, verify fail:** `npm run test -- projectSchema` → FAIL (module missing).

- [ ] **Step 3: Create `src/content.config.ts`** (Astro 6 content-layer API; export the schema so it's testable):

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const projectSchema = z.object({
  title: z.string(),
  order: z.number(),
  status: z.enum(['production', 'in-progress', 'research', 'internal']),
  year: z.string(),
  stack: z.array(z.string()),
  summary: z.string(),
  role: z.string(),            // the spine "tag" line
  featured: z.boolean().default(true),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: projectSchema,
});

export const collections = { projects };
```

- [ ] **Step 4: Run, verify pass:** `npm run test -- projectSchema` → PASS. (If `astro:content` import fails under vitest, alias it in `vitest.config.ts` or move `projectSchema` to `src/lib/projectSchema.ts` and import it into `content.config.ts`. Prefer the latter if the alias is fiddly — keep the test importing from `src/lib/projectSchema.ts`.)

- [ ] **Step 5: Create the 4 seed Markdown files.** Front-matter must satisfy the schema; bodies are short drafts (Nico edits later). Derive content from the prototype's `SPINE`/`PROJECTS` data. Example `src/content/projects/after-sales-bi.md`:

```markdown
---
title: After-Sales BI Platform
order: 1
status: production
year: "2024"
stack: ["Azure", "dbt", "Airflow", "Power BI"]
summary: The analytics backbone for after-sales — raw events to the KPIs the business runs on.
role: the backbone — bekumoo
featured: true
---

End-to-end after-sales analytics: ingestion, a tested warehouse, and the dashboards
decision-makers actually open. _(draft — Nico to refine)_
```

(Repeat for `scouting-rag` [research], `this-portfolio` [in-progress], `data-quality` [internal] using the prototype's data.)

- [ ] **Step 6: Verify the collection builds:** `npm run build` → no schema errors.
- [ ] **Step 7: Commit.**

```bash
git add src/content.config.ts src/content/projects src/lib/projectSchema.test.ts
git commit -m "feat: add projects content collection with tested schema and seed entries"
```

---

## Task 4: NS monogram, Nav, ThemeSwitcher + Shift wiring

**Files:**
- Create: `src/components/NsMonogram.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/ThemeSwitcher.tsx`
- Modify: `src/pages/index.astro` (temporary mount to verify)

- [ ] **Step 1: `NsMonogram.astro`** — render the interlocking offset-S NS SVG. Two paths (`ns-n` chrome via `url(#chrome)`, `ns-s` accent) plus the `<defs><linearGradient id="chrome">` with `--chrome-mid` stop, ported from `prototype/variant-shift.html` (hero `.mercury` SVG). Accept a `combined` prop to emit a single monochrome path (for nav/boot/favicon). Paths:
  - N: `M20 72 V26 L52 72 V26`
  - S: `M82 44 C82 34 48 34 48 48 C48 62 82 58 82 74 C82 88 46 88 44 76`
  - combined = N + " " + S.

- [ ] **Step 2: `ThemeSwitcher.tsx`** (React island). Port the theme engine from `prototype/variant-shift.html` `<script>`: render swatch buttons from `THEMES` (import `src/lib/themes.ts`) + a Shift swatch; `applyTheme(name)` sets `document.documentElement.dataset.theme` (or runs the shift loop for `'shift'`); number keys 1–7; `localStorage('ns-theme2')`; `aria-pressed`, `.sw-tip` tooltips, `:focus-visible`. Shift loop uses `paletteAt` from `src/lib/shift.ts`: a rAF loop, throttled to every 3rd frame, advances `t` by ~0.0083, applies the returned var map to `document.documentElement.style`, and calls a passed-in `onAccentChange` (so the constellation can refresh). Guard with `prefers-reduced-motion` (static palette, no loop). On unmount, cancel rAF and remove the inline shift vars (the `SHIFT_VARS` cleanup). Mount with `client:idle`.

- [ ] **Step 3: `Nav.astro`** — fixed top bar: `NsMonogram` (combined, small) + anchor links (Work/Projects/Skills/About/Contact) with smooth-scroll; `.solid` class toggled on scroll via a tiny inline script (or reuse in a wrapper). Port styles from prototype `nav`.

- [ ] **Step 4: Temporarily mount** `Nav` + `ThemeSwitcher` (`client:idle`) in `index.astro` under `Base`. `npm run dev` → verify: switching themes recolors the page; **Shift animates** the palette smoothly; keys 1–7 work; reduced-motion holds a static palette; no console errors; `npm run build` passes.

- [ ] **Step 5: Commit.**

```bash
git add src/components/NsMonogram.astro src/components/Nav.astro src/components/ThemeSwitcher.tsx src/pages/index.astro
git commit -m "feat: NS monogram, nav, and theme switcher with animated shift mode"
```

---

## Task 5: Cold-boot island

**Files:** Create `src/components/ColdBoot.tsx`; Modify `src/pages/index.astro`.

- [ ] **Step 1:** Port the boot overlay from prototype (`.boot` markup + script): scanline veil, `NsMonogram` draw-on (`pathLength="1"` + `stroke-dashoffset`), scrambled boot log. Dismiss on click / first wheel / Escape-Space-Enter, plus a 4.4s safety timeout; clear the scramble interval and remove listeners on dismiss (the cleanup already fixed in the prototype). `prefers-reduced-motion`: render the log instantly and fade fast. Mount `client:load` (must run before paint feel).
- [ ] **Step 2:** `npm run dev` → boot plays once, dismisses every way, leaves no leaked listeners (switch tabs / press keys after — no errors). reduced-motion → instant.
- [ ] **Step 3: Commit** `feat: add cold-boot intro island`.

---

## Task 6: Hero section

**Files:** Create `src/components/HeroSection.astro`, `src/components/HeroMercury.tsx`; Modify `index.astro`.

- [ ] **Step 1:** `HeroSection.astro` — aurora background (CSS), forged metallic headline `NICO / SUTHEIMER` with shine-sweep (port `.forged` incl. the `background-position` sweep fix and `white-space:pre` `::after`), role line + sub + CTAs, scroll cue. Use **Martian Mono** for the forged headline.
- [ ] **Step 2:** `HeroMercury.tsx` (island, `client:idle`) — wraps `NsMonogram`, adds cursor 3D tilt + specular (port `.mercury` script). reduced-motion → no tilt. Pointer-coarse → no tilt.
- [ ] **Step 3:** `npm run dev` → hero renders; mercury tilts on mouse; sweep animates; reduced-motion static; theme + shift recolor it. `npm run build` passes.
- [ ] **Step 4: Commit** `feat: add hero section with liquid-mercury NS and forged type`.

---

## Task 7: Data Spine island (from collection)

**Files:** Create `src/components/DataSpine.tsx`; Modify `index.astro` (pass projects).

- [ ] **Step 1:** `DataSpine.tsx` (island, `client:visible`) — props: `projects` (mapped from the collection: `{title, role, summary, stack}`). Build vertebrae (one per project), a sticky 3D stage. On scroll, compute progress with `pinnedProgress` from `src/lib/scroll.ts` (reuse — do not reinvent), rotate the spine and set the active vertebra + side panel via `currentPanel`-style indexing. rAF-throttled scroll handler. reduced-motion → static tilt, panel shows project 1. Port styles + structure from prototype `.spine-*`.
- [ ] **Step 2:** In `index.astro`, query `getCollection('projects')`, sort by `order`, pass the mapped array as a prop to `<DataSpine client:visible projects={...} />`.
- [ ] **Step 3:** `npm run dev` → spine rotates on scroll, panel tracks the active vertebra, content comes from the Markdown files (edit a `.md` → it changes). Mobile (<840px): reduced height, panel hidden. reduced-motion static. `npm run build` passes.
- [ ] **Step 4: Commit** `feat: add scroll-driven data spine bound to projects collection`.

---

## Task 8: Project Deck island (from collection)

**Files:** Create `src/components/ProjectDeck.tsx`; Modify `index.astro`.

- [ ] **Step 1:** `ProjectDeck.tsx` (island, `client:visible`) — props: `projects`. Build cards (title, status→badge label+`live`/`wip` class, year, stack/meta, summary). IntersectionObserver scatter→fan assemble; **responsive spread** computed from stage width (port the fixed `geom()` version, not the fixed-px one); hover reveals summary via the grid-rows trick. reduced-motion → assembled immediately. Status→badge mapping: `production`→"Production"/`live`, `in-progress`→"In-progress"/`wip`, `research`→"Research"/`wip`, `internal`→"Internal"/``.
- [ ] **Step 2:** Mount in `index.astro` with the same projects prop.
- [ ] **Step 3:** `npm run dev` → cards fly in, fan fits viewport at tablet width (no horizontal overflow), hover works, content from collection. reduced-motion static. `npm run build` passes.
- [ ] **Step 4: Commit** `feat: add exploded project deck bound to collection`.

---

## Task 9: Constellation island

**Files:** Create `src/components/Constellation.tsx`; Modify `index.astro`.

- [ ] **Step 1:** `Constellation.tsx` (island, `client:visible`) — canvas force graph of skill labels (prop `skills: string[]`, default the prototype list). Mouse attractor; animate only while in view (IntersectionObserver). Read accent color from CSS vars into a cached object, refreshed on theme change and on each shift tick (accept an event or poll `getComputedStyle` on a `themechange` CustomEvent dispatched by `ThemeSwitcher`). reduced-motion → static draw. Port from prototype constellation block (with the `Math.PI*2` arc fix).
- [ ] **Step 2:** To make the constellation follow Shift, have `ThemeSwitcher` dispatch `window.dispatchEvent(new CustomEvent('ns-accent'))` on each applied palette; `Constellation` listens and refreshes its cached colors. (Decouples the two islands.)
- [ ] **Step 3:** `npm run dev` → graph reacts to cursor, recolors with theme + shift, pauses off-screen. reduced-motion static. `npm run build` passes.
- [ ] **Step 4: Commit** `feat: add mouse-reactive skill constellation`.

---

## Task 10: About, Contact, Footer

**Files:** Create `src/components/AboutSection.astro`, `ContactSection.astro`, `SiteFooter.astro`; Modify `index.astro`.

- [ ] **Step 1:** `AboutSection.astro` — bio copy + the on-brand monogram portrait block (`NsMonogram` + scanlines, NOT the rainbow wheel). Port from prototype `.about-*`.
- [ ] **Step 2:** `ContactSection.astro` — terminal card with mail/github/linkedin (real handles: `nico.sutheimer@bekumoo.de`, `github.com/sutheimernico`; linkedin placeholder until Nico confirms). Port `.term`.
- [ ] **Step 3:** `SiteFooter.astro` — minimal footer line.
- [ ] **Step 4:** `npm run dev` → all render and recolor. `npm run build` passes.
- [ ] **Step 5: Commit** `feat: add about, contact, and footer sections`.

---

## Task 11: Assemble landing page + global polish

**Files:** Modify `src/pages/index.astro`, `src/styles/global.css`.

- [ ] **Step 1:** Final `index.astro`: `Base` → `ColdBoot` (client:load) + `Nav` + `HeroSection` (with `HeroMercury`) + `DataSpine` + `ProjectDeck` (#projects) + `Constellation` (#skills) + `AboutSection` + `ContactSection` + `SiteFooter` + `ThemeSwitcher` (client:idle). Query projects once, sort by `order`, pass to spine + deck. Add the global decorations from the prototype (grain `body::after`, scanlines `body::before`, ambient aurora, cursor-glow, scroll progress bar) — put grain/scanline/aurora in `global.css`, cursor-glow + progress as a tiny island or inline script.
- [ ] **Step 2:** `npm run build` → static output; check `dist/` has the page. `npm run dev` → full top-to-bottom flow works; Shift is the default on first load (no saved value); every section recolors live.
- [ ] **Step 3: Commit** `feat: assemble full landing page from prototype sections`.

---

## Task 12: Verification & review gates

- [ ] **Step 1:** `npm run test` → all unit tests pass (themes, shift, projectSchema, kinetic, scroll, format).
- [ ] **Step 2:** `npm run build` → clean build, no warnings about content/schema/hydration.
- [ ] **Step 3:** Browser pass (`npm run dev`): boot → hero → spine → deck → constellation → about → contact; theme keys 1–7; Shift animates; `prefers-reduced-motion` (DevTools emulate) calms everything; mobile widths (375/768) have no horizontal scroll.
- [ ] **Step 4:** Run the project review gates on the diff: `design-reviewer` (visual quality, spec-treue, motion) + `frontend-reviewer` (React/TS, hooks, a11y, hydration). Fix findings.
- [ ] **Step 5:** Append `## Implementation Notes` to this plan (what was built, deviations, verification evidence). Update `AGENTS.md` if the "how to add a project" workflow changed.
- [ ] **Step 6: Final commit** `docs: implementation notes for prototype integration`.

---

## Open decisions (flag during build, don't block)
- **`astro:content` under Vitest** (Task 3 Step 4): if importing `projectSchema` from `content.config.ts` fails in the test runner, move the schema to `src/lib/projectSchema.ts` and re-export. Pick whichever keeps the test green.
- **LinkedIn URL** (Task 10): placeholder until Nico confirms the handle.
- **Project bodies** (Task 3): drafted by Claude, grounded in bekumoo/scouting-rag; Nico edits the prose later (separate pass).

---

## Implementation Notes (2026-06-24)

**Built:** all 13 tasks, committed task-by-task on `feat/build-site` (commits `d2d2cd1` → `99da1f4`), executed via subagent-driven-development (fresh subagent per task + design/frontend review gates at the end). The standalone shift-prototype is now a real Astro site: theme palettes (phosphor + petrol/amethyst/solar/molten/daylight) + animated **Shift** mode (default on first load), projects as an `astro:content` collection (one `.md` = one project, drives both Data Spine and Project Deck), and the ported sections — Cold Boot, Hero (forged type + liquid-mercury NS + aurora), Data Spine, Exploded Deck, Constellation, About, Contact, Footer — plus global chrome (grain, scanlines, ambient aurora, cursor glow, scroll progress).

**Deviations from plan (deliberate):**
- **No serif font.** Prototype used a system serif for accent lines; to stay mono-led (Kinetic Terminal) the `.hero-role` / spine `.p-tag` use Martian/IBM-Plex mono made distinctive via size, tracking and color instead. Open to revisiting if a self-hosted serif is wanted later.
- **Schema lives in `src/lib/projectSchema.ts`** (re-exported into `src/content.config.ts`) so it's unit-testable under Vitest (importing `astro:content` in vitest is unreliable). zod imported from `'zod'`.
- **Reveal-on-scroll for island-internal elements:** `DataSpine` runs its own IntersectionObserver for `.spine-intro` (the global observer in `Base.astro` can't reliably see elements rendered inside a `client:visible` island).
- `Base.astro` carries one `is:inline` script: reveal observer + cursor-glow rAF (visibilitychange-paused) + scroll-progress.
- `--wip` status color is global (root + daylight), not per-theme — `#D9A441` reads on all dark grounds.
- Constellation canvas uses a React `ref` (not the prototype's `#constCanvas` id).
- The pre-existing untracked `docs/sessions/2026-06-13_…md` got swept into commit `99da1f4` by a `git add -A`; harmless (it belongs in the repo).

**Verification evidence:** `npm run test` 19/19 green (themes, shift, projectSchema, kinetic, scroll, format); `npx tsc --noEmit` exit 0; `npm run build` clean, no hydration warnings; built `dist/index.html` contains all sections, the 4 seed projects, contact handles, and all 6 islands hydrate. design-reviewer + frontend-reviewer ran on the full diff; all Critical/Should findings fixed in `99da1f4`.

**NOT done / open:**
- **Visual/motion browser verification** — not performed (no browser tool in this run). Needs a human pass via `npm run dev`: cold-boot, theme keys 1–7, shift animation, scroll choreography, `prefers-reduced-motion`, mobile widths.
- **Deploy** (Task 13 of the original plan / Cloudflare Pages) — NOT done; nothing pushed. Awaiting Nico's go.
- LinkedIn handle (placeholder), project prose refinement (Nico edits), possible serif reconsideration.
```
