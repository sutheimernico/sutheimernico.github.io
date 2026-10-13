---
title: "Descent — 3D Scroll Landing"
order: 9
status: production
year: "2026"
stack: ["Astro", "TypeScript", "CSS 3D transforms", "Vitest"]
summary: "This site's previous landing: a scroll-driven camera ride through every project, built without WebGL. Retired for speed, kept as a design lab."
role: "design lab — frontend showcase"
featured: true
domain: product
context: personal
reviewed: false
github: https://github.com/sutheimernico/sutheimernico.github.io
fieldNote: "It looked right and it scrolled at about 30 fps on a throttled CPU. A portfolio that stutters says more than the effect does, so the ride moved to its own page and the landing went back to plain HTML."
---

## What it is

The landing this portfolio had until October 2026, still running at
**[/descent](/descent/)**. You scroll and a camera dollies down through a 3D shaft: past
the hero, through an entry gate, past one panel per project (alternating left and right),
out through an exit gate. A HUD gauge reads the depth and a station rail shows where you are.
No WebGL and no canvas: it is DOM, CSS 3D transforms and one scroll-driven loop.

## Architecture

- **A sticky viewport inside a tall section.** The section's height is the length of the
  ride; the viewport stays pinned while the page scrolls past it.
- **One loop, one read.** A single `requestAnimationFrame` loop reads the scroll position
  once per frame, eases the camera towards it and writes only `transform` and `opacity`.
  It goes to sleep when the camera has settled.
- **Geometry as pure functions.** Ride length, panel placement, fade bands and depth labels
  live in `src/lib/descent.ts` and are unit-tested; the script only applies them.
- **Data-driven stations.** Every project in the content collection becomes a panel, so a new
  Markdown file adds a station without touching the ride.

## Why it's built this way

The goal was a landing that felt like a place, not a page, and that stayed in the site's
terminal language instead of reaching for a 3D library. CSS 3D keeps text real (selectable,
crawlable, readable by screen readers) and the bundle small.

## Implementation

- Ported from a hand-tuned single-file prototype, then hardened over two performance passes:
  no `filter: blur()` on 3D layers, no full-viewport blend-mode overlays, capped shadows,
  scroll read in the scroll event instead of inside the frame, panels culled when out of view.
- Reduced motion or no 3D support falls back to one viewport of hero and a plain index.

## Trade-offs & what I considered

- **Measured, then retired.** Headless Chromium at 4× CPU throttling, scrolling the whole
  page: median frame time 33.3 ms (about 30 fps), 11 % of frames over 33 ms, 604 layout
  passes during one scroll-through. A plain page under the same conditions holds 16.7 ms.
  The effect was worth keeping, but not as the first thing a recruiter's laptop has to render.
- **Kept, not deleted.** It is the most ambitious frontend piece on the site, so it moved to
  `/descent` and the landing became static HTML with a one-off load animation.

<!-- Sources: frame-time numbers from scripts run on 2026-10-13 (headless Chromium via
playwright-core, CPU throttle 4x, 1440x900, wheel scroll 120 px steps over the full page):
baseline landing p50 33.3 ms, 56/508 frames > 33.4 ms, LayoutCount 604; control page p50
16.7 ms, 0 janky frames. Architecture from src/lib/descent.ts, src/scripts/descent.ts and
styles/descent.css in this repo. -->
