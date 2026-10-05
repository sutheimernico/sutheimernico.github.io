---
title: "Repz"
order: 21
status: production
year: "2026"
stack: ["React Native", "Expo", "TypeScript", "SQLite", "Jest"]
summary: "A local-first Android gym tracker I actually train with: fully offline, a pure testable domain core, and screen tests that run against real SQLite."
role: "offline by design, tested on real SQLite"
featured: false
github: https://github.com/sutheimernico/reptic
domain: product
context: personal
reviewed: false
fieldNote: "The automatic daily backup lives in the app's own document directory — so it survives a bad delete but dies with the phone. The settings screen says exactly that instead of implying more safety than it has."
---

## What it is

A personal gym-tracking app for Android, built to replace an ad-hoc Notes workflow. Single user,
no accounts, no backend, no network calls: every session lives in a local SQLite database on the
device. The one feature the notes app could never give me is **last time, per set** — the weight
from the previous session is pre-filled and editable, reps are typed fresh, and a grey reference
line under each set shows the number to beat. Suggestions are gym-aware: the same gym's history
first, any-gym as a labelled fallback.

Beyond logging: training plans that merge into one editable session list, an exercise library,
history with a calendar and per-exercise progression, a rest timer, personal-record detection, a
plate calculator, weekly trends, and JSON export/import. Since v1.2 ("Trainingsbegleiter") it also
coaches a little: a double-progression suggestion per exercise, a summary when a session ends, and
a live session clock.

## Architecture

- **`domain/` is pure** — no React, no native modules. Carry-over, last-time resolution, plan
  merge, record detection, Epley 1RM, plate loading, backup (de)serialisation and formatting are
  plain functions, testable in plain Node.
- **`db/`** is a thin typed layer over `expo-sqlite` with `PRAGMA user_version` migrations,
  mapping snake_case rows to domain types. In v1.1 it was split from one 911-line file into seven
  domain modules (largest now 282 lines).
- **`app/`** holds thin expo-router screens that call `db/` and render `domain/` output;
  **`lib/`** isolates the impure device bridges (file I/O, sharing, haptics).
- **`test-support/`** renders real screens against **real SQLite** (`node:sqlite`) — only the
  router and haptics are mocked.

## Why it's built this way

Local-first is the product decision, not a limitation: training data is personal, the gym has bad
reception, and an offline SQLite file needs no server to stay alive. The hard layering rule
(`domain/` may never import from `db/`, `app/` or a native module) is what keeps a React Native
app testable at all — the interesting logic never sits inside a component.

## Implementation

- **240 tests** in 20 suites (62 before the v1.1 round, 179 after it, 240 after v1.2) across
  domain, query layer and screens. The 900-line data layer previously had none; adding integration
  tests against real SQLite came before adding features.
- **The history list was the one real hot spot.** Profiled against a synthetic three-year dataset
  (624 sessions, 17,472 sets), its query took **2,281 ms**: three correlated sub-selects per
  session, each scanning every set. Rewritten as one grouped pass it takes **24 ms** (one calendar
  month: 71 → 16 ms) with identical rows, and a query-plan test fails if a correlated sub-select
  comes back. With two months of real data the old cost was barely visible — it would have hit
  around year one.
- An N+1 read in the exercise history was collapsed into a single query and **pinned by a test
  that counts SQL statements**, so the regression cannot come back quietly.
- The **rest timer is timestamp-based**, not a tick counter: putting the phone away for two
  minutes shows "Pause vorbei" instead of a frozen countdown.
- **Records are claimed conservatively** — nothing is announced until an exercise has three
  sessions of history, and a tie is never a record.
- The **progression hint** only speaks when it has grounds: it suggests the next loadable weight
  once every working set last time hit the rep target, says "stay" otherwise, and stays quiet
  without history or when last time was another gym. Nothing changes until "Übernehmen" is tapped.
- The **plate calculator** answers "what do I load per side" or says "nicht exakt stellbar" with
  the neighbouring achievable weights, rather than rounding silently.
- Weekly trends show untrained weeks as zero and never interpolate them.

## Trade-offs & what I considered

- **Not in any store.** It is installed as a self-built APK; the Play Store's developer fee buys
  nothing for a single-user app. The v1.1 and v1.2 feature sets are code-complete and gated but
  deliberately not built onto the phone yet — both device smoke tests are still open, and builds
  happen after a device sign-off, a rule earned from three-hour blind cloud builds.
- **Backup honesty over backup theatre.** The rolling on-device backup (newest seven, restorable
  in-app because Android's document picker cannot reach the app's own files) protects against
  accidental deletes, not against losing the device. Manual JSON export covers that case.
- **Cloud backup is designed, not built.** An optional Google Drive backup is blocked on an OAuth
  client and a dev build; until then, export/import is the migration path.
- **Measured and left alone:** the daily auto-backup takes 134 ms for 5 MB at three years of
  data. Dropping the JSON indentation would roughly halve that, but the backup format is the safety
  net and does not change in passing.
