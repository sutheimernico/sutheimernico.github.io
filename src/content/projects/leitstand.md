---
title: "Leitstand"
order: 10
status: in-progress
year: "2026"
stack: ["Python", "FastAPI", "Ollama", "React", "TypeScript"]
summary: "A cockpit for one engineer's platform — read-only collectors and a local-LLM briefing whose every digit must appear in the snapshot."
role: "read-only, no invented numbers"
featured: false
domain: agents
context: personal
reviewed: false
fieldNote: "The briefing is checked digit by digit against its own input and falls back to deterministic text if a number appears that the snapshot does not contain. The collectors themselves have still never been pointed at a live system."
---

## What it is

A personal cockpit for one developer's working world: the live state of the orchestrator, the
dbt-derived checks, the local git repos and the open pull requests in a single desktop window,
summarised in German by a local model. **Honest state:** the backend is built and tested up to and
including the briefing layer (176 tests); the React frontend exists only as an uncommitted
scaffold, and no collector has ever been pointed at a real system — credentials are an explicit
human task, so every tile that needs one currently sits in its `unconfigured` state. Nothing here
is operating yet.

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
- **Hallucination post-check.** Every digit run in the generated text must be a subset of the exact
  JSON the model was given; otherwise the briefing is replaced by a deterministic headline.

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
- No test touches a live network, a real orchestrator or a real model; the build loop was
  explicitly forbidden from calling the target systems, which is why live verification is an open
  human step rather than something that quietly happened.

## Trade-offs & what I considered

- **The digit-subset check is crude on purpose.** It cannot catch a wrong *word*, only a number
  the snapshot never contained — but it is cheap, deterministic and fails closed, which beats
  trusting a second model to grade the first.
- **Read path first.** The three write actions (open a pull request, fast-forward a clean repo,
  re-run a failed job) are specified down to the audit log and the confirm dialog, and are
  deliberately not built: giving a cockpit hands before its eyes are verified is the wrong order.
- **Still unfinished, and labelled so.** Frontend, actions, the desktop shell and the agent-report
  inbox are all open. The repo has no remote and will not get one — the inbox is meant to hold
  work-internal notes, so it stays local by design.

<!-- sources: /home/nicosutheimer/private/leitstand/README.md (scope, honest framing, read-only collectors, three whitelisted actions, local model summarises only, 127.0.0.1, no auth), PLAN.md (Status: phases 0-3 done with 54/140/176 tests, phases 4-7 unchecked, "Needs Nico": credentials, live verification, remote decision), AUTOPILOT_LOG.md (phase-3 entries: content-hash cache, digit-run post-check, briefing API, 176 total), git status (frontend/ untracked scaffold), git remote -v (no remote → no github link) -->
