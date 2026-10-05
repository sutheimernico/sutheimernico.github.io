---
title: "Showroom"
order: 22
status: in-progress
year: "2026"
stack: ["Three.js", "GLSL", "GSAP", "Lenis", "Playwright"]
summary: "A lab of scroll-driven 3D web scenes built with no build step — and an honest lesson about verifying graphics on a software renderer."
role: "software-rendered, GPU check pending"
featured: false
github: https://github.com/sutheimernico/showroom
domain: product
context: personal
reviewed: false
fieldNote: "Two of five scenes I had marked done needed real rework after the first look on actual GPU hardware. The software renderer used for automated verification never showed the failures — so the GPU check has to move earlier in the loop, not sit at the end."
---

## What it is

A workshop for scroll-driven 3D web design: a set of self-contained scenes, each one folder with
an `index.html`, opened from a local gallery. **Six of 23 planned concepts are touched, four are
genuinely finished** — an orbiting house that runs a golden-hour-to-night arc, a solar-system
journey ending at a black hole, a morphing particle field, and a cross-section cutaway through
the Earth's layers. Every scene binds a single normalised 0→1 scroll value to camera, shader
uniforms and post-processing, so the whole piece is scrubbable and deterministic.

## Architecture

- **No build step.** Plain HTML plus ES modules through a CDN import map; Three.js r185 with
  `ShaderMaterial`, GSAP/ScrollTrigger for choreography, Lenis for smooth scroll, all driven from
  one rAF loop.
- **Each design is independent** — shared helpers live in `shared/`, but a scene must run alone.
- **A Playwright harness** renders every scene at scroll 0 / .25 / .5 / .75 / 1 and checks for
  console errors, WebGL context loss and dead frames.
- Assets are CC0 or CC BY with a `SOURCES.md` per directory; attribution is rendered in the
  gallery, not skipped.

## Why it's built this way

The point is craft under a fixed bar: a wow moment a layperson notices in five seconds, real
post-processing, ~60 fps, `prefers-reduced-motion` handled, and a look that is not templated. No
build step keeps each scene readable as a single artefact — the technique is the deliverable.

## Implementation

Three findings are worth more than the scenes themselves:

- **Three.js does not apply `instanceMatrix` for a raw `ShaderMaterial`.** Twenty-six building
  instances per side silently collapsed onto one shape at the group origin — and it still
  *rendered*, which is why only the screenshots caught it.
- **The anti-aliasing measurement contradicted the assumption.** MSAA was disabled on a detected
  software rasterizer after measuring, not assuming, what it cost.
- **A NaN class produced large black rectangles on real GPU hardware** that neither SwiftShader
  nor llvmpipe reproduces; the shaders were hardened against it blind.

## Trade-offs & what I considered

- **The honest blocker: this was tuned on a software renderer.** Frame-rate numbers from that
  environment are labelled non-representative, and the record is clear about what it cost —
  a scene marked done was later rejected on a real display as "flat boxes with painted-on
  puddles". Two rebuild plans are written and unexecuted.
- **Source only, deliberately.** The repository is public, but there is no hosting and no tracking — public hosting is a separate
  later decision.
