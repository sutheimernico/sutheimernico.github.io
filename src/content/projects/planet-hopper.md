---
title: "Planet Hopper"
order: 20
status: in-progress
year: "2026"
stack: ["Three.js", "TypeScript", "Vite", "Vitest", "WebAudio"]
summary: "A 3D slingshot-gravity browser game whose physics core is pure, deterministic and unit-tested without a GPU — 145 kB gzip, no backend."
role: "deterministic core, no fake preview"
featured: false
domain: product
context: personal
reviewed: false
fieldNote: "Written, gated and built entirely headless: 80 tests pass, the bundle is measured — but no human has ever felt the game on a real GPU. The 60 fps target is still a requirement, not a result."
---

## What it is

An endless arcade game in the browser: a ship sits in orbit, you drag to aim, release, and
gravity does the rest — capture into the next planet's orbit, collect crystals, chain flyby
bonuses, run out of fuel and die. Everything on screen is rendered live with Three.js; there are
no prerendered assets, no backend, no install, and no network access at runtime. v1 is
**code-complete** (24 tasks, 2026-07-11) but has only ever run headless — the live game-feel and
frame-rate session on a real GPU is still open.

## Architecture

- **A pure core with no renderer in it.** `src/core`, `src/physics` and `src/world` import
  neither Three.js nor the DOM. Gravity (k-nearest, inverse-square), the semi-implicit Euler
  integrator, orbit capture, scoring, the phase machine and the seeded world generator are all
  plain functions — which is why 80 unit tests can run without a GPU.
- **Fixed-timestep simulation** at 120 Hz with render interpolation and a spiral-of-death clamp,
  so the physics is frame-rate independent.
- **The trajectory preview is not a preview.** It runs the same integrator as the actual flight,
  so the dashed line and the path taken cannot drift apart.
- **Seeded, deterministic world generation** — the corridor of planets, suns and crystals is
  derived from a seed at runtime; nothing is stored or fetched.
- **Render layer**: pooled meshes with explicit GPU-buffer disposal on prune, a DOM overlay HUD,
  and WebAudio-synthesized SFX (five oscillator cues, zero audio files, zero licensing).

## Why it's built this way

The interesting engineering claim of a browser game is not the visuals — it is that the
simulation is testable. Splitting pure logic from rendering made the whole gameplay layer
verifiable in CI on a machine with no display, which is the only reason an autonomous build loop
could work on it at all. The stack is deliberately framework-free: vanilla Three.js over React
Three Fiber or Babylon.js, for direct control of the game loop and a small bundle.

## Implementation

- `npm run gate` (typecheck + Vitest + ESLint) is the objective done-check; nothing was committed
  red. Final state: **80 tests**, clean typecheck and lint.
- Production build is **145 kB gzip** against a self-imposed 500 kB budget; the dev FPS overlay is
  verified tree-shaken out of the production bundle.
- **A test that could not fail was caught by mutation-checking it.** The first draft of the
  difficulty-ramp test recomputed its expectations from the same constants the generator uses —
  swapping two of those constants in the generator still left the test green. It was rewritten to
  read real generator output, then re-verified against two deliberate mutations.
- A performance pass moved world generation out of the per-tick loop and throttled the aim preview
  to once per rendered frame; remaining allocations in the gravity hot path were documented rather
  than "fixed" blind, because the rewrite cannot be verified headless.

## Trade-offs & what I considered

- **Headless has a hard ceiling.** Gate, build and a preview smoke test are green — game feel,
  bloom subtlety, touch-target ergonomics and actual fps are explicitly listed as unverifiable by
  the build loop and left open, not asserted.
- **No solvability proof yet.** Tests pin determinism and bounds, but not that consecutive planets
  are always reachable within the allowed launch power. That gap is written down, not papered over.
- **Frustration avoided by design**: planets always capture, hazards are suns and void drift, and
  there is no mid-flight thrust — v1 is a pure slingshot.
- **Deployment is wired but inert** — a GitHub Pages workflow exists, but there is no public
  remote, so nothing is live.

<!-- sources: /home/nicosutheimer/private/planet-hopper/README.md (79→80 tests, 145 kB gzip, headless-only verification), PROJECT.md (architecture, decisions register, non-negotiables), PLAN.md (tasks 1-24, needs-nico live-verify list, deferred polish), AUTOPILOT_LOG.md (80 tests after task 24, 145 kB gzip, mutation-check story task 24 part D, task 21 performance pass), docs/superpowers/plans/2026-07-21-ghost-and-shine.md (pure-core layering, no solvability guarantee, "never run on a real GPU"), git remote -v (no remote → no github link) -->
