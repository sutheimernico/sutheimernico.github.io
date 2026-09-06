---
title: "Pulse Scout"
order: 25
status: in-progress
year: "2026"
stack: ["Python", "Ollama", "SQLite", "FastAPI", "React PWA"]
summary: "A local, zero-cost daily AI and tech digest for the phone: ~400 items in, five that matter out. Phase 0 — designed and measured, not built."
role: "designed and measured, not built"
featured: false
domain: agents
context: personal
reviewed: false
fieldNote: "Writing the digest locally costs roughly 30 minutes of CPU per run at the measured 4.5 tokens/s; a hosted API would take about 8 seconds for a few euros a month. I kept it local anyway, because 'no running costs, ever' is the actual constraint — and the measurement is what makes that a decision rather than a preference."
---

## What it is

A daily digest of the AI and tech world, read on a phone in five minutes. Its job is not coverage —
it is discarding: roughly **400 items in, five out**, each with an explicit line on why it concerns
the reader's actual work, plus a second tier of one-liners that exist only so a name has been read
once. Everything runs locally at zero cost.

**Where it stands: Phase 0.** Spec approved, source list verified, local throughput measured,
layout mocked up. The code so far is a config module and its test — no fetching, no scoring, no
digest has ever been produced.

## Architecture

A funnel in which the language model comes **last**, because throughput on the target hardware is
the binding constraint (measured on CPU: 18.1 tokens/s intake, 4.5 tokens/s generation):

1. **Fetch** — RSS/Atom and key-less JSON APIs, ~400 items, no model.
2. **Dedupe and rank** — collapsing the same story across sources is itself the strongest
   importance signal; ~40 survive, still no model.
3. **Score** — a small model rates those 40 for job relevance, one short prompt each.
4. **Write** — a 7B model sees only the top 12 and produces ~700 tokens.

Stories are linked across days by **embeddings**, not by the language model: cosine similarity
answers "same topic?" deterministically, which is exactly where a small local model is weakest.

## Why it's built this way

The constraints came first: no paid API or cloud, ever; the digest is written locally; third-party
feed text is never committed (raw responses live in a gitignored cache, only derived data is
versioned); five minutes stays five minutes.

The topic list was derived by reading the repositories actually worked in, not assumed — the first
premise was wrong, and popular topics (Terraform, Kubernetes, dbt, SQL Server) are out because that
is not the stack in use. At most three of the five main slots may come from one tier, so a busy AI
news day cannot push someone's own job out of their own digest.

## Implementation

- **63 sources, every one confirmed by a live fetch** (HTTP 200 *and* a real feed body). Nine
  widely cited feed URLs are recorded at the bottom of the same file as verified broken — HTML
  shells, Cloudflare 403s, 404s — so nobody re-adds them.
- A session-start script derives the current phase from the repository itself (open checkboxes,
  modules present) rather than from a status line nobody updates.
- The build backlog is deliberately **empty** until the implementation plan is written; the
  autonomous loop exits on an empty backlog instead of inventing work.

## Trade-offs & what I considered

- **Local model over hosted API** — see the field note; the cost of that choice is measured.
- **No fabricated digest.** A run that produces nothing usable fails visibly; invented items would
  destroy the only thing the product sells.
- **Two feeds stay unverified** (Reddit, the CISA advisories) — both look IP-blocked from the build
  environment rather than key-gated, and neither is quietly assumed to work.
- **The acceptance criterion is behavioural:** five consecutive mornings actually read on the phone.
  Anything less and it is the sixteenth unopened source.

<!-- sources: /home/nicosutheimer/private/pulse-scout/PROJECT.md (vision, non-negotiables, four-stage funnel, measured 18,1 tok/s intake + 4,5 tok/s generation, embeddings for threads, tier scope derived from real repos on 2026-08-07, D8 three-slot cap, status "Phase 0, scaffold - no pipeline code yet", Needs Nico incl. Reddit/CISA IP block), README.md (400 in / 5 out, honest-harness section, stack, Phase 0 status), PLAN.md (iron principles, gate, "Backlog intentionally empty", session-start reminder rationale), docs/superpowers/specs/2026-08-07-pulse-scout-design.md (D2: local model ~30 min CPU vs ~8 s and ~3 EUR/month hosted, measured throughput table), data/sources.toml (63 [[source]] entries all live-verified; 9 entries listed under "Verified broken"), src/ + tests/ (only config.py and test_config.py exist), no git remote configured -> no github field -->
