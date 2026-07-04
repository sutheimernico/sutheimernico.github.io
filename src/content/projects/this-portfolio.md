---
title: "This Portfolio"
order: 7
status: in-progress
year: "2025"
stack: ["Astro", "React", "TypeScript"]
summary: "A kinetic-terminal portfolio — the site you're looking at, treated as a real project."
role: "pipeline to pixel"
featured: true
# github: https://github.com/...   # fill in if/when public
---

## What it is

This site — treated as a real project, not a throwaway. A "Kinetic Terminal" portfolio:
warm near-black, a phosphor-green accent, mono typography, and deliberate motion. Static
output with React only where interaction earns it, and a theme engine that cross-fades between
six palettes plus an animated palette-shift mode.

## Architecture

- **Astro for static output.** The whole site renders to static HTML at build time. There's no
  server, no client framework loading just to paint text.
- **React islands, sparingly.** Interactive pieces — the project deck, the scroll-driven data
  spine, the theme switcher — are isolated React islands hydrated on demand (`client:visible`,
  `client:idle`). Everything static stays static.
- **Tailwind v4 + TypeScript** for styling and type safety, with design tokens (accent, ink,
  surface, line) as CSS variables so a theme switch is a token swap, not a re-style.
- **Projects as a content collection.** Each project is a Markdown file with typed front-matter
  validated by a Zod schema. Adding a project is adding a file — no code change. (This page is
  one of those files.)

## Why it's built this way

Design-first, but maintainable and fast. Islands keep the bundle near-zero on a page that's
mostly content, which is the whole reason to reach for Astro over a SPA. Content collections
mean the site scales with writing, not with engineering. The token-based theming means the
"Kinetic Terminal" look is one source of truth, applied everywhere, switchable at runtime.

## Implementation

- **Pure logic extracted and unit-tested.** Theme resolution, the palette-shift cross-fade
  timing, and the scroll math are plain functions in `src/lib`, covered by Vitest. Visual work
  is verified in the browser; only the math is asserted in tests.
- **Prototype → components.** The design was hand-tuned as a single throwaway HTML prototype
  first, then ported to Astro/React components once the look was locked — design decisions made
  in the prototype, structure decisions made in the port.
- **Accessibility and performance as constraints.** Every animation respects
  `prefers-reduced-motion`; focus states are real; islands keep the page light.

## Trade-offs & what I considered

- **Astro over Next.js.** This is a content site, not an app. Astro's static-first model with
  opt-in hydration fits the workload; a full React framework would ship JavaScript to paint
  what is essentially a document.
- **Custom design over a template.** Slower to build and a higher bar to hit, but the entire
  point is a site that doesn't read as a generic AI/template build.
- **Six themes + a shift mode is more than a portfolio needs.** Indulgent on purpose — the
  theme engine is itself a small demonstration of the token architecture.

_(draft — Nico to refine)_
