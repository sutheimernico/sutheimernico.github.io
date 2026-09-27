---
title: "Leitstand"
order: 10
status: in-progress
year: "2026"
stack: ["Python", "FastAPI", "Ollama", "React", "TypeScript"]
summary: "A cockpit for one engineer's platform and side projects — read-only collectors, one ranked feed of everything waiting on him, and a local-LLM briefing that may only name what the snapshot contains."
role: "read-only, no invented numbers"
featured: false
domain: agents
context: personal
reviewed: false
fieldNote: "Pointed at real data for the first time, the \"waiting on you\" feed found 139 open asks across 17 projects — and ten parser gaps no fixture had shown, from a folder holding three repos without being one to \"Not a blocker.\" being counted as a blocker. Each gap is now pinned by a sanitized fixture or a named test. The work-stack collectors have still never seen a live system."
---

## What it is

A personal cockpit for one developer's working world: the live state of the orchestrator, the
dbt-derived checks, the local git repos and the open pull requests in a single desktop window,
summarised in German by a local model — and, since the second round, every private side project
too, with all their open "needs a decision from me" items folded into one ranked panel. **Honest
state:** the V1 cockpit (backend, React UI, three click-confirmed actions, app-window shell) and
the second round are built on a feature branch that is not merged. The private-project side runs
against real data, read-only. The work-stack collectors have never been pointed at a live system —
credentials are an explicit human task, so those tiles sit in their `unconfigured` state.

## Architecture

- **Collectors behind provider seams.** The git-repo sweep is the only zero-config one: it
  classifies each repo as dirty, diverged, behind or clean as pure logic over `git` porcelain
  output, with the subprocess behind a seam. Orchestrator, dbt-derived and pull-request collectors
  each have a seam, a fake and a real REST client.
- **Snapshot aggregation.** `GET /api/status` runs the collectors concurrently and degrades per
  collector, so one dead system does not take the page down.
- **Briefing service.** A local model turns the structured snapshot into three to six German
  sentences, cached on a timestamp-free content hash of the snapshot, and degrading to an offline
  note when the model is unreachable.
- **Hallucination post-check.** Every digit run *and* every identifier-like token (job ids, repo
  names, pull-request references) in the generated text must appear in the exact JSON the model was
  given; otherwise the briefing is replaced by a deterministic headline. Timestamps are stripped
  from what the model sees, because their digits would otherwise whitelist unrelated numbers.
- **"Braucht dich" feed.** A collector sweeps the private projects' plan and status documents for
  the sections that list what waits on a human, de-duplicates asks that two documents restate
  (never across differing numbers), and ranks blockers first. Open asks are not incidents, so the
  feed never turns the cockpit's header red.
- **Memory.** Snapshots go into a history that writes only on change or on an hourly heartbeat
  (every sweep would be ~14 MB a day); "since yesterday" is computed deterministically, and the
  model gets the change list under the same guard. A Windows toast on a newly critical item is
  built and off by default.

## Why it's built this way

The local model summarises — it does not diagnose, compute or decide. That split is what makes a
7B model usable here at all: the numbers come from collectors, the model only phrases them, and the
post-check enforces that boundary mechanically rather than by prompt. Everything else follows the
same honesty rule: unconfigured and failing collectors are shown loudly instead of being hidden,
and any mocked value carries a visible "Demo-Daten" badge.

## Implementation

- Phase 1 — settings, snapshot models, the repo collector and the FastAPI app (54 tests).
- Phase 2 — the three credentialed collectors with fakes plus a degradation sweep, so unconfigured
  and error paths have their own tests, not just the happy path (140 tests).
- Phase 3 — the model seam, the cached briefing service, the digit post-check and the briefing
  endpoints (176 tests).
- Phases 4–7 — the React cockpit, the three actions with a closed whitelist, an audit log and a
  confirm dialog, the app-window shell and the agent-report inbox contract.
- Second round — the private-project collectors, the feed, history, delta briefing and the toast:
  **381 backend and 65 frontend tests**, all hermetic.
- **Live proof, read-only:** against the real project folder the feed collected 139 asks from 17
  projects in 0.16 s and rendered in headless Chromium with zero console errors. Real data broke
  the fixture-grade code ten times — projects documented only in a PROJECT.md, three repos inside
  one folder that were invisible, the same ask restated in two files, "Not a blocker." ranked as a
  blocker, a UI that waited more than 60 s on a cold local model before showing any tile, and a
  German PowerShell answering in cp850 and crashing the toast. All ten are fixed and pinned.
- No test touches a live network, a real orchestrator or a real model; the build loop was
  explicitly forbidden from calling the target systems, which is why live verification is an open
  human step rather than something that quietly happened.

## Trade-offs & what I considered

- **The digit-subset check is crude on purpose.** It cannot catch a wrong *word*, only a number
  the snapshot never contained — but it is cheap, deterministic and fails closed, which beats
  trusting a second model to grade the first.
- **Exactly three hands.** The write actions (open a pull request, fast-forward a clean repo,
  re-run a failed job) sit behind a closed whitelist, a confirm dialog and an audit log. A command
  palette was planned and deliberately not built: its one new capability needed a fourth action,
  and V1 is locked at three.
- **The feed shows what the documents say.** Several source documents carry asks that are already
  resolved; truthing them is per project, not something the cockpit should guess.
- **Still unfinished, and labelled so.** The work-stack collectors wait for credentials, and a
  weekly headless agent review is shipped but not installed — no persistent schedule without a
  human go. The repo has no remote and will not get one — the inbox is meant to hold
  work-internal notes, so it stays local by design.

<!-- sources: /home/nicosutheimer/private/leitstand/README.md (scope, honest framing, read-only collectors, three whitelisted actions, local model summarises only, 127.0.0.1, no auth), PLAN.md (Status: phases 0-3 done with 54/140/176 tests, phases 4-7 unchecked, "Needs Nico": credentials, live verification, remote decision), AUTOPILOT_LOG.md (phase-3 entries: content-hash cache, digit-run post-check, briefing API, 176 total), git remote -v (no remote → no github link); branch feat/cockpit-completion @ d6eeb0b (not merged): PLAN.md Status (phases 4–7 done 2026-09-20: frontend, three-action whitelist + audit log + confirm dialog, Edge app-window shell, agent inbox contract; beyond V1 381 backend + 65 frontend tests), README.md (Status, Honest framing, Scope), docs/superpowers/plans/2026-07-21-beyond-v1-cockpit.md Task 1 (entity-aware guard, timestamps stripped from model input) and Outcome 2026-09-27 (286 → 381 pytest, 43 → 65 vitest; 139 asks from 17 projects plus workspace level in 0.16 s; zero console errors in headless Chromium; ten real-data shapes 1–10; history on change or hourly heartbeat ~14 MB/day otherwise; toast off by default; Task 11 not built, fourth action vs. V1 lock at three; Task 12 shipped not installed; stale asks in source docs) -->
