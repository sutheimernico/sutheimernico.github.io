---
title: "Data Center Tycoon"
order: 26
status: in-progress
year: "2026"
stack: ["TypeScript", "React", "Vite", "vitest"]
summary: "An idle-game design that turns pacing into a test suite instead of a feeling. Concept stage — the repo holds the plan and nothing else."
role: "a plan, not yet a line of code"
featured: false
domain: product
context: personal
reviewed: false
fieldNote: "Nothing is built: the repository contains exactly one file, dated 2026-09-01 and marked 'waiting for go'. It is listed here as a design artefact, not as a game."
---

## What it is

A written design for an idle/incremental game — click a job, buy a CPU node, end up running a
hyperscaler, then prestige by "shipping a model generation" and start over faster. The working
title is *Data Center Tycoon*; the theme is deliberately swappable, because it lives in content
data rows rather than in code.

**Status: concept stage.** The project folder contains one file, the plan, dated 2026-09-01 and
marked "waiting for go". No scaffold, no code, no tests.

## Architecture

Planned, not built: one dependency direction, `ui → store → sim → economy`, never backwards, with
`economy` and `sim` importable from a plain Node script with no DOM — the precondition for the
balancing harness. Game state lives in a module store outside React, read through
`useSyncExternalStore` and notified at 10 Hz while the simulation steps at a fixed 20 Hz; content
is data, and derived values are never persisted.

## Why it's built this way

The plan's central claim is that in this genre **the code is the easy part** — the economy decides
whether the result is fun. So the balancing harness comes *before* content: a Node script runs bot
policies (greedy, efficient, prestige-loop) over hours of simulated play in under a second and
prints the pacing curve. Those targets then become assertions — time-to-next-buy inside its band,
first prestige in 40–70 minutes, run 2 two to five times faster than run 1 — so a balance change
that breaks pacing fails the suite instead of failing players.

## Implementation

None yet. The phase plan runs 0–8 (scaffold, vertical slice, harness, content, prestige, offline
and migrations, polish, retention, ship), roughly 22 hours, each phase ending in something playable.

## Trade-offs & what I considered

- **float64 with a ~1e15 design ceiling** instead of a big-number library, which taxes every
  arithmetic expression forever; currency math stays in one directory so a later swap is local.
- **Flat generator topology** rather than chained — chaining feels deeper and balances much harder,
  so it is a v2 decision if v1 proves boring.
- **Offline credit is linear with autobuyers paused**, so offline equals online exactly and a
  chunking-equivalence test can guard it.
