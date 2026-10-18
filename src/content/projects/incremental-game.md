---
title: "Data Center Tycoon"
order: 26
status: in-progress
year: "2026"
stack: ["TypeScript", "React", "Vite", "vitest"]
summary: "An idle game whose pacing is a test suite instead of a feeling. Phases 0–4 are built and playable; with the plan's numbers the balancing bot never reached its target, which is the finding."
role: "design, economy and balancing harness"
featured: false
domain: product
context: personal
reviewed: false
fieldNote: "With the plan's own numbers the greedy bot never reached 1e9 in two simulated hours, so production was retuned ×12. The late pacing bands (3–8 minutes to the next buy) were not reached after hundreds of parameter combinations, so the guard tests assert only what holds."
---

## What it is

An idle/incremental game — click a job, buy a CPU node, end up running a hyperscaler, then
prestige by "shipping a model generation" and start over faster. The working title is *Data Center
Tycoon*; the theme is deliberately swappable, because it lives in content data rows rather than
in code. The UI is in German.

**Status: built through phase 4, plus offline credit from phase 5.** It has an economy module with
invariant tests, a simulation stepping at 20 Hz outside React, 8 generator tiers, 15 research
upgrades, prestige with an insight shop, save with offline credit (capped at 8 hours) and a
bot-driven balancing harness. 63 tests, 66 kB gzip, and it has been played headless in Chromium.
Not public yet: there is no remote.

## Architecture

One dependency direction, `ui → store → sim → economy`, never backwards, with `economy` and `sim`
importable from a plain Node script with no DOM — which is what makes the balancing harness
possible. Game state lives in a module store outside React, read through `useSyncExternalStore`
and notified at 10 Hz while the simulation steps at a fixed 20 Hz; content is data, and derived
values are never persisted.

## Why it's built this way

The central claim is that in this genre **the code is the easy part** — the economy decides
whether the result is fun. So the balancing harness came *before* content: `tools/balance.ts` runs
bot policies (greedy, efficient, prestige-loop) over 120 simulated minutes in about 0.3 s and
prints the pacing curve. Those targets become assertions where they can hold, so a balance change
that breaks pacing fails the suite instead of failing players.

## Implementation

- **Economy with invariant tests**, written before the content that uses it.
- **Three bots** drive the harness; a full two-hour simulation costs about 0.3 s, cheap enough to
  sweep parameters in bulk.
- **Prestige works as designed on the numbers that matter most:** the first prestige unlocks at
  54:30 minutes (target 40–70), and the second run is 2.47× faster than the first (target 2–5×).
- **Offline credit** is linear with autobuyers paused, so offline equals online exactly; it is
  capped at 8 hours.
- Played headless in Chromium to check the loop end to end; 63 tests in total.

## Trade-offs & what I considered

- **The plan's numbers were wrong, and the harness said so.** The greedy bot never reached 1e9 in
  two hours with the planned values, so production was retuned ×12. That is the harness doing its
  job, but it also shows how far a spreadsheet estimate sits from a simulated economy.
- **Some pacing targets were not reached.** The late bands (3–8 minutes to the next buy) stayed
  out of reach across hundreds of parameter combinations. The guard tests assert only what holds,
  rather than asserting the target and being red or loosening it until it passes silently.
- **float64 with a ~1e15 design ceiling** instead of a big-number library, which taxes every
  arithmetic expression forever; currency math stays in one directory so a later swap is local.
- **Flat generator topology** rather than chained — chaining feels deeper and balances much harder,
  so it is a v2 decision if v1 proves boring.
- **Not public.** No remote yet; the phases after 5 (polish, retention, ship) are not built.
