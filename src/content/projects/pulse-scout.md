---
title: "Pulse Scout"
order: 25
status: in-progress
year: "2026"
stack: ["Python", "Ollama", "SQLite", "FastAPI", "React PWA"]
summary: "A local, zero-cost daily AI and tech digest for the phone: ~600 items in, five that matter out, and every sentence the model writes is checked against its source before it ships."
role: "a small model, fact-checked sentence by sentence"
featured: false
domain: agents
context: personal
reviewed: false
fieldNote: "The first real digest passed every mechanical check — no invented number, id or link — and still said a group had agreed to stop something the source said it would slow. So every sentence now goes back to the model as a yes/no question against its source. On 119 labelled sentences it catches 36 of 37 unfaithful ones and wrongly drops 13 of 62 faithful ones; what it cannot catch is a vague paraphrase that drifts."
---

## What it is

A daily digest of the AI and tech world, read on a phone in five minutes. Its job is not coverage —
it is discarding: roughly **600 items in, five out**, each with an explicit line on why it concerns
the reader's actual work, plus a second tier of one-liners that exist only so a name has been read
once. Everything runs locally at zero cost.

**Where it stands: stage 1 is built and running.** Every evening a timer fetches, dedupes, ranks,
scores, writes, fact-checks and stores a digest; an installable PWA serves it to the phone, offline
too. Verified end to end on the machine and in a headless browser at phone width — not yet on the
real phone, and the acceptance test (five mornings actually read) has not started.

## Architecture

A funnel in which the language model comes **last**, because throughput on the target hardware is
the binding constraint (measured on CPU: 18.1 tokens/s intake, 4.5 tokens/s generation):

1. **Fetch** — RSS/Atom and key-less JSON APIs, cut to a publication window, no model.
2. **Dedupe and rank** — collapsing the same story across sources is itself the strongest
   importance signal; 40 survive, still no model.
3. **Score** — a 1.5B model rates those 40 for job relevance, one short prompt each.
4. **Write** — a 7B model sees only the top candidates and writes the cards.
5. **Check** — every headline and body sentence goes back to the 7B model as a one-word question
   against the source text the writer saw. A "no" drops the sentence; nothing is rephrased.
6. **Serve** — a read-only FastAPI behind a fail-closed token gate, and a React PWA with a service
   worker that shows the last stored digest offline, labelled with its fetch time.

A systemd timer runs the chain at 20:30 and catches up missed days. Stage 2 — linking stories
across days by **embeddings** rather than by the model — waits until stage 1 has run daily.

## Why it's built this way

The constraints came first: no paid API or cloud, ever; the digest is written locally; third-party
feed text is never committed (raw responses live in a gitignored cache, only derived data is
versioned); five minutes stays five minutes.

The topic list was derived by reading the repositories actually worked in, not assumed, and at most
three of the five main slots may come from one tier, so a busy AI news day cannot push someone's
own job out of their own digest.

## Implementation

- **The first real run** (594 items → 40 candidates → 5 cards) takes 750 s end to end on CPU:
  scoring 158 s, writing 184 s, fact-checking 10 sentences 67 s.
- **The fact check is measured, not asserted.** A labelled set of 119 sentences (real writer
  output, hand-written meaning changes, and a held-out second run scored only after the prompt was
  frozen). The shipped checker catches **36/37** unfaithful sentences and drops **13/62** faithful
  ones; on the held-out run it catches **4 of 5**. The 1.5B model as checker catches 2 of 37 —
  the check needs the bigger model. A rejected headline falls back to the source title, an emptied
  body to the source's first sentence, marked as such.
- **The live sources forced three fixes**, each found by fetching rather than reasoning: the
  Hacker News query returned the twenty *newest* posts instead of the most discussed; all three
  Nitter mirrors — the main Anthropic coverage — are dead; and feeds are archives, not streams
  (one returns 2,722 entries back to 2008). Unwindowed, day one ingests 6,193 items and day two
  the same again; a publication window plus a persistent seen-set cuts that to about 570.
- **60 sources, each confirmed by a live fetch**; verified-broken URLs stay listed in the same file
  so nobody re-adds them.
- 359 Python tests and 20 frontend tests; lint, type check and build clean.

## Trade-offs & what I considered

- **Local model over hosted API.** Writing locally costs minutes of CPU per run where a hosted API
  would take seconds for a few euros a month. "No running costs, ever" is the actual constraint,
  and the measured throughput is what makes that a decision rather than a preference.
- **The check's numbers are optimistic**, and the entry says so: the labels are not yet reviewed
  by a second person, the hand-written perturbations come from the same author as the prompt, and
  only 9 real unfaithful model sentences are in the set. In the first production run, 2 of the 9
  shipped sentences were vague distortions the check let through.
- **Known weaknesses, named rather than hidden:** headlines drift to English on longer inputs, the
  second body sentence is usually filler (the check drops it, so cards get shorter), and the number
  check rejects German decimals ("2,8" for "2.8").
- **No fabricated digest.** A run that produces nothing usable fails visibly; a quiet day says
  "only 1 of 5 slots".
- **The acceptance criterion is behavioural:** five consecutive mornings actually read on the phone.
  That observation is prepared, not done.

<!-- sources: /home/nicosutheimer/private/pulse-scout on branch autopilot/work @ 7bd9344 — README.md (Status 2026-09-27: stage 1 built and running, 20:30 timer, PWA offline verified in headless Chromium not on the phone), PROJECT.md (non-negotiables, measured 18,1 tok/s intake + 4,5 tok/s generation, tier scope derived from real repos, three-slot cap), docs/superpowers/plans/2026-09-20-pulse-scout-v1.md §9 (T18 first digest, "Ruhiger Tag: nur 1 von 5 Plätzen"; live-source fixes: HN newest-20, three dead Nitter mirrors, ThoughtWorks 2.722 entries back to 2008, 6.193 unwindowed → 570) and §10 (fact-check design; 119 labelled sentences; 7b prompt v2: 36/37 caught, 13/62 dropped, held-out 4/5; 1.5b: 2/37; "optimistic" caveats incl. only 9 real unfaithful sentences; production run 594 → 40 → 5, 158 s / 184 s / 67 s, 750 s total, 2 of 9 shipped sentences vague distortions; correction: only "slow" → "stop" was wrong; found-not-fixed list; 359 pytest + 20 vitest; T23 five days prepared, not done), data/sources.toml (60 [[source]] entries, header "Every entry below was confirmed by a live fetch", "Verified broken" section), docs/superpowers/specs/2026-08-07-pulse-scout-design.md (D2 local vs hosted cost), no git remote configured -> no github field -->
