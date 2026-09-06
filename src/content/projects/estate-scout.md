---
title: "Estate Scout"
order: 11
status: in-progress
year: "2026"
stack: ["Python", "Ollama", "RAG", "FastAPI", "React", "Typer"]
summary: "A local real-estate knowledge assistant where the model routes and explains but never computes — every number comes from tested Python."
role: "the model routes, the code computes"
featured: false
domain: agents
context: personal
reviewed: false
fieldNote: "The scouting funnel does not scrape listing portals — an ADR killed that on legal and data-protection grounds before a line was written, so the funnel works over objects the user brings in instead."
---

## What it is

A local, free knowledge assistant plus finance calculators for the German residential property
market (Lower Saxony / North Rhine-Westphalia). Ask a question about buying or financing a
property: the model understands the question and picks a tool, but every number — annuity
payment, purchase side costs, affordability, rental yield — is produced by tested Python. It runs
entirely on one machine through Ollama, with no paid APIs and no listing scraping. Stage 1, the
assistant, is complete and was verified against a live local model; Stage 2, a scoring funnel, is
half-built.

## Architecture

- **`finance/` — the trust anchor.** Five pure, typed calculators (annuity with optional annual
  extra repayment, purchase side costs, affordability, yield metrics) over a versioned YAML config
  in which every rate carries its source and date — including all 16 state transfer-tax rates.
- **`rag/`** — a heading-aware chunker over a curated seven-document corpus, embeddings from a
  local model, cosine similarity over a cached NumPy matrix, retrieval returning chunk plus
  source.
- **`assistant/`** — a JSON tool schema per calculator, a dispatcher that validates arguments
  before dispatching, and a tool-calling loop over a chat seam; retrieved context is injected for
  knowledge questions, and the disclaimer rides on every response.
- **Interfaces** — a Typer CLI (`ask` plus four direct calculator commands), a FastAPI app
  (`POST /api/ask`, `POST /api/finance/{calc}`) and a small React chat tab served from the same
  app, with amortization tables rendered beside the answer.
- **`scout/` (Stage 2)** — a listing model that deliberately stores no seller contact data, a
  SQLite store, manual intake via CLI and API, and two enrichment seams that report "unavailable"
  rather than guessing.

## Why it's built this way

A local 7B model cannot be trusted with arithmetic — so it is never asked to do any. Splitting
"understand the question" from "produce the number" is what makes a small local model usable for
a domain where a wrong figure is worse than no figure. The same rule extends outward: rates live
in versioned config with a source, not in a prompt, and a missing market figure lowers a
confidence value instead of being filled in.

## Implementation

- The finance core was written test-first against hand-computed references — 29 tests before
  anything else existed; 97 tests at the current state.
- Every external dependency sits behind a seam with a fake (embeddings, chat, land value, regional
  signals), so no test touches the network.
- Verified live, not only in tests: a real local run routed a financing question to the annuity
  tool with correct arguments and surfaced a monthly payment straight out of `finance/` — the
  number came from the code, the sentence from the model.
- Golden retrieval queries pin that the expected knowledge document comes back for a given
  question.

## Trade-offs & what I considered

- **No scraping, recorded as a decision.** The portals' terms forbid bots, bot protection makes it
  technically hostile, there is no free API for private users, and scraped listings carry seller
  personal data. So the funnel is an honest scout over objects the user brings in, enriched from
  public sources — narrower, and legal.
- **Honest gaps over convenient numbers.** The land-value adapter degrades to "unavailable"
  because that public register has no documented REST API; the fake and the manual production path
  are the same class, so the honest path is the tested one.
- **Deliberately deferred and still open:** chat history in SQLite (no second use case yet), the
  transparent scoring engine and the scout UI. A hardening and UX plan is written and unexecuted,
  and the repo has no remote.

<!-- sources: /home/nicosutheimer/private/estate-scout/README.md (numbers from tested code, local-only via Ollama, no scraping, honest-harness framing), PROJECT.md (stage list, layout, core design constraint), PLAN.md (phases 0-5 done: 29/43/61/78 tests, live qwen2.5:7b annuity round-trip surfacing the tool's own number; phases 6-7 done, phases 8-9 unchecked; "Needs Nico": merge, remote, deferred portfolio coupling), AUTOPILOT_LOG.md (97 tests green at phase 7 complete), docs/adr/0001-stage2-data-source.md (no scraping: terms of service, bot protection, no free API, DSGVO; enrichment seams degrade to unavailable), git remote -v (no remote → no github link) -->
