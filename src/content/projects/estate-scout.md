---
title: "Estate Scout"
order: 11
status: in-progress
year: "2026"
stack: ["Python", "Ollama", "RAG", "FastAPI", "React", "Typer"]
summary: "A local real-estate knowledge assistant where the model routes and explains but never computes — every number comes from tested Python."
role: "the model routes, the code computes"
featured: false
github: https://github.com/sutheimernico/estate-scout
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
assistant, is complete and was verified against a live local model; Stage 2, a scoring funnel,
now has its transparent scoring engine and drilldown UI — on a feature branch, not merged.

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
  SQLite store, manual intake via CLI and API, enrichment seams that name *why* a figure is
  unavailable, and a 0–100 score from three blocks (yield, price against land value, region) whose
  weights renormalise over what is actually available. Confidence counts available raw signals, so
  half a region signal honestly reads as half. The UI shows each block as a bar with its weight and
  lists what is missing and why.
- **Live public data, keyless** — land values from the Lower Saxony land-value register's WFS
  (median residential zone per municipality), and the Bundesbank mortgage rate with a 24 h cache.
  The live rate is offered as a labelled suggestion (`live` / `cache` / `fallback`), never injected
  as a silent default into `finance/`, which stays pure and offline.

## Why it's built this way

A local 7B model cannot be trusted with arithmetic — so it is never asked to do any. Splitting
"understand the question" from "produce the number" is what makes a small local model usable for
a domain where a wrong figure is worse than no figure. The same rule extends outward: rates live
in versioned config with a source, not in a prompt, and a missing market figure lowers a
confidence value instead of being filled in.

## Implementation

- The finance core was written test-first against hand-computed references — 29 tests before
  anything else existed; 205 tests now (97 before the hardening and scoring rounds), with a
  coverage floor of 94 % set at the integer *below* the measured 94.99 %, not rounded up. The
  scoring engine alone has 17 tests with hand-computed reference values.
- Every external dependency sits behind a seam with a fake (embeddings, chat, land value, regional
  signals), so no test touches the network.
- Verified live, not only in tests: a real local run routed a financing question to the annuity
  tool with correct arguments and surfaced a monthly payment straight out of `finance/` — the
  number came from the code, the sentence from the model. The same run also showed the limit: the
  model quoted a second tool figure in its prose and garbled it (181,209.86 became "181.210,86").
  Prompt rules do not bind free text; a code-level check that prose numbers match tool results is
  still open, and a tool-trace panel in the chat makes every call inspectable meanwhile.
- Golden retrieval queries pin that the expected knowledge document comes back for a given
  question.

## Trade-offs & what I considered

- **No scraping, recorded as a decision.** The portals' terms forbid bots, bot protection makes it
  technically hostile, there is no free API for private users, and scraped listings carry seller
  personal data. So the funnel is an honest scout over objects the user brings in, enriched from
  public sources — narrower, and legal.
- **A score that is really a constant, found on real data.** Run against the live land-value feed
  for a real listing (300,000 € for 100 m² in a small Lower Saxony town), the price block compares
  3,000 €/m² of living space with 190 €/m² of land — a ratio of 15.8, so the block scores 0, and
  would score 0 almost everywhere outside expensive urban land markets. The thresholds were
  implemented as specified and the finding is written up as needing a decision before that block
  carries 40 % of a score anyone acts on.
- **Honest gaps over convenient numbers.** No keyless machine interface for regional population and
  vacancy data was found, so the region block reports "provider missing" instead of inventing one.
- **Deliberately deferred and still open:** chat history in SQLite (no second use case yet) and a
  nightly re-score digest. The hardening and scoring rounds live on a feature branch that is not
  merged.
