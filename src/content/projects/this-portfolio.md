---
title: "This Portfolio"
order: 23
status: production
year: "2025"
stack: ["Astro", "React", "TypeScript", "Vitest", "GitHub Pages"]
summary: "A kinetic-terminal portfolio — the site you're looking at, treated as a real project: content collection, motion system, view transitions."
role: "pipeline to pixel"
featured: false
domain: product
context: personal
reviewed: false
github: https://github.com/sutheimernico/sutheimernico.github.io
fieldNote: "Every project page on this site is one Markdown file with a validated front-matter. The index, the deck, the spine and the skill graph all derive from it — nothing is hard-coded, so adding a project is adding a file."
---

## What it is

This site — treated as a real project, not a throwaway. A "Kinetic Terminal" portfolio: warm
near-black, a phosphor-green accent, mono typography, and deliberate motion. Static output with
React only where interaction earns it, a theme engine that cross-fades between six palettes
plus an animated palette-shift mode, and since v2 a full motion layer: a once-per-session
boot sequence, headings that resolve out of terminal noise, a typed statement, a stack ticker,
a filterable process-table index of every project, and view transitions that morph a project
title from the card into its detail page.

## Architecture

- **Astro for static output.** The whole site renders to static HTML at build time and deploys
  to GitHub Pages on every push to main. No server.
- **React islands, sparingly.** The project deck, the scroll-driven data spine, the project
  index, the skill constellation, the theme switcher and the live-proof line are isolated
  islands hydrated on demand (`client:visible`, `client:idle`). Everything else stays static.
- **One content collection.** Each project is a Markdown file with typed front-matter validated
  by a Zod schema (status, domain, work-vs-personal context, an optional field note, an
  optional repository whose CI history proves the system runs). Every surface derives from it.
- **A shared motion primitive layer.** Reveal, stagger, decode, count-up, typed text and
  magnetic buttons are opt-in data attributes handled by one small script that re-runs after
  every client-side navigation.

## Why it's built this way

Design-first, but maintainable and fast. Islands keep the bundle near-zero on a page that is
mostly content, which is the whole reason to reach for Astro over a SPA. The collection means
the site scales with writing, not with engineering. The token-based theming means the look is
one source of truth, switchable at runtime. And the motion is a system, not decoration: one
easing set, one duration scale, `prefers-reduced-motion` honoured everywhere, transforms and
opacity only.

## Implementation

- **Pure logic extracted and unit-tested.** Theme resolution, the palette-shift cross-fade,
  the deck geometry, scroll math, the schema, the domain filter and the live-proof formatting
  are plain functions under `src/lib`, covered by Vitest. Visual work is verified in the
  browser; only the math is asserted in tests.
- **Prototype → components.** The design was hand-tuned as a single throwaway HTML prototype
  first, then ported once the look was locked.
- **Honesty in the chrome too.** The live-proof line shows the last real pipeline run of a
  public repository; when the API is unavailable it says so instead of inventing a timestamp.
- **Accessibility as a constraint.** Skip link, focus states, screen-reader fallbacks for the
  canvas graph and the decoding headings, keyboard-reachable theme switcher.

## Trade-offs & what I considered

- **Astro over Next.js.** This is a content site, not an app. A full React framework would
  ship JavaScript to paint what is essentially a document.
- **Custom design over a template.** Slower to build and a higher bar to hit, but the entire
  point is a site that doesn't read as a generic AI/template build.
- **A lot of motion for a portfolio.** Indulgent on purpose — it is the one place where the
  frontend is allowed to show off, and it doubles as my React and CSS practice ground.
