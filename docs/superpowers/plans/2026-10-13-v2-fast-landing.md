# v2 fast landing — plan and outcome

Goal (Nico, 2026-10-13): the live site stutters on load and scroll. Replace the landing with a
fast version; keep the Descent ride as a design project that shows the frontend work.

## Plan

1. Measure a baseline: headless Chromium, 4x CPU throttle, 1440x900, wheel scroll over the page.
2. Move `pages/index.astro` to `pages/descent.astro` unchanged; `Base.astro` gets a `ride` prop,
   every other page renders `html.lite` and lazy-loads the ride script only where `[data-ride]` exists.
3. New static landing: terminal hero, featured cards, static index (`ProjectList.astro`),
   domains + stack instead of the canvas, About and Contact reused. No React on the page.
4. Content entry `descent.md` (featured design-lab card) with the measured numbers.
5. Docs: CLAUDE.md locked decision, AGENTS.md, `this-portfolio.md`.

## Outcome

Built as planned. Measurements (same script, same machine, 4x throttle):

| | old landing (Descent) | v2 landing | control page |
|---|---|---|---|
| median frame while scrolling | 33.3 ms | 16.7 ms | 16.7 ms |
| frames > 33 ms | 56 / 508 (11 %) | 1 / 197 (0.5 %) | 0 |
| layout passes during scroll | 604 | 85 | 1 |
| load event | 478 ms | 227 ms | — |
| first contentful paint | 292 ms | 184 ms | — |

Deviations: `filterCounts` was extracted to `lib/domains.ts` (tested) and is shared by the
React index and the static list. Full-page screenshots show empty sections below the fold —
an artifact of scroll-driven reveals in fullPage capture; viewport screenshots per section are fine.

Open: the theme switcher is only on `/descent` now (the saved theme still applies everywhere).

Follow-up 2026-10-13 (Nico): the "Selected work" section (featured cards + design-lab card) was
removed. The hero leads straight into the index, which lists the Descent ride like any other
project; the nav lost its "Work" link.

Follow-up 2026-10-13 (Nico): "Index" renamed to **Projects** (`#projects`, nav, detail back
link). The Skills chapter replaced domain counts + stack chips with six fullstack-first areas
(`lib/skills.ts`): what I do, tools, and the projects that show it, derived from the project
stacks (work entries first). `analytics-platform.md` gained `dbt` in its stack (as on the CV).
