---
title: "Data Center Tycoon"
order: 26
status: production
year: "2026"
stack: ["TypeScript", "React", "Vite", "vitest"]
summary: "An idle game whose pacing is a test suite instead of a feeling. Bot players simulate hours of play in seconds; after a hand-played session the economy was retuned until the first prestige came 2.6× sooner."
role: "design, economy, balancing harness and UI"
github: https://github.com/sutheimernico/incremental-game
featured: false
domain: product
context: personal
reviewed: false
fieldNote: "The bots said the pacing was fine; a human said it was too slow. Retuning against the harness took the casual bot's first prestige from 54:30 to 20:43 and the longest wait for a new tier from 45 to 10 minutes. It also made later prestiges trivially fast, which the harness showed at once and which is the next thing to fix."
---

## What it is

An idle/incremental game: click the processor, buy a CPU node, end up running a hyperscaler, then
prestige by "shipping a model generation" and start over faster. The UI is in German.

**Playable at [sutheimernico.github.io/incremental-game](https://sutheimernico.github.io/incremental-game/).**
It has eight generator tiers, a 35-node skill tree in five branches, prestige with an insight shop,
and a save that migrates between schema versions. A tab in the background keeps producing at full
rate, and a closed page earns offline credit up to 8 hours. 97 tests, about 82 kB gzip.

## Architecture

One dependency direction, `ui → store → sim → economy`, never backwards, with `economy` and `sim`
importable from a plain Node script with no DOM. That is what makes the balancing harness possible.
Game state lives in a module store outside React and is read through `useSyncExternalStore`.
Content is data: generators and skill-tree nodes, including prerequisites and positions, are rows
in a table, and derived values are never persisted.

The simulation runs on wall-clock time, not frames. Browsers throttle hidden tabs to almost nothing,
so every tick measures the real elapsed time and drains it as a backlog in small slices. The game
keeps running in the background without freezing the page when you come back.

## Why it's built this way

In this genre **the code is the easy part**; the economy decides whether the result is fun. So the
balancing harness came *before* the content. `tools/balance.ts` runs bot policies (greedy, efficient,
prestige-loop) over two simulated hours in about three seconds and prints the pacing curve. The
targets become assertions, so a balance change that breaks pacing fails the suite instead of
failing players.

## Implementation

- **Processor as the click target:** an SVG chip whose eight die tiles stand for the eight tiers
  and light up as you own them. Data pulses run along the traces in step with production. Click
  effects bypass React renders, and `prefers-reduced-motion` turns them off.
- **Skill tree instead of a research list:** 35 nodes with prerequisites in five branches (click
  power, infrastructure, network synergies, automation, cooling), each with a capstone. A run
  affords about 15 of them before prestige, so it is a choice of path.
- **Save schema v2 with a migration:** saves from before the skill tree keep their research.
- **Pacing, before and after the retune** (harness, deterministic):

| | before | after |
| --- | --- | --- |
| first prestige, casual bot | 54:30 | 20:43 |
| first prestige, efficient bot | 21:55 | 9:20 |
| longest gap between new tiers, casual | 45:35 | 10:18 |
| longest gap between new tiers, efficient | 6:11 | 2:01 |

## Trade-offs & what I considered

- **The bots were not enough.** The first version met most of its pacing targets and still played
  too slowly by hand. The harness turned a vague "faster, especially late" into numbers to hit,
  but the request had to come from a person.
- **Later prestiges are now too quick:** 3:40, 1:50, 1:10 and 0:50 to the threshold after the first
  run, because the insight reward was not rebalanced when run 1 got faster. A threshold that rises
  per generation is the next lever.
- **float64 with a ~1e15 design ceiling** instead of a big-number library. The largest value seen
  so far is about 1.3e12, and currency math stays in one directory so a later swap stays local.
- **Flat generator topology** rather than chained: chaining feels deeper and balances much harder.
- **Not built:** achievements, a stats page, and save export or import.

<!-- Sources (2026-10-19): incremental-game README.md and PLAN.md section 11 (harness before/after
tables); `npm run balance` output on main c24e790 (tier unlocks, first prestige 20:43 / 9:20,
prestige-loop 3:40 1:50 1:10 0:50, largest run 1.29T); `npm run gate` 97 tests; build gzip
JS 75.69 + CSS 6.00 + HTML 0.43 kB; skill tree: src/content/upgrades.ts (35 nodes, 5 branches).
Pre-retune numbers: README as of 2026-10-18 (54:30, 21:55, longest tier gap 45:35 / 6:11). -->
