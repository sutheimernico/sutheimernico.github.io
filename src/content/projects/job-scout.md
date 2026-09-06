---
title: "Job Scout"
order: 15
status: production
year: "2026"
stack: ["Python", "httpx", "SQLite", "Telegram Bot API", "Windows Task Scheduler"]
summary: "A daily radar over the German federal job board: ads scored against a profile, with one Telegram alert only when something clears the bar."
role: "one signal a day, or none"
featured: false
domain: agents
context: personal
reviewed: false
fieldNote: "A later audit found the source had started returning real salary ranges — the EU pay-transparency directive has been in force in Germany since June 2026 — while the adapter still read the old boolean flag and threw the numbers away, and the docs still claimed the system knows no salaries. The planned second data source existed to buy exactly that field."
---

## What it is

A market radar for the German software and AI job market. Every morning it queries the job-board
API of the Federal Employment Agency for a set of search terms — regional and nationwide — scores
each advert against a profile that lives as data, records what it has already seen, and sends a
**Telegram message only for the few adverts above the threshold**. It never applies to anything
and never rates employers; it finds and filters. In production since 2026-08-11 as a Windows
scheduled task at 07:30, with wake-to-run set so a sleeping machine still gets its run.

## Architecture

Six small modules and no framework:

- `sources/arbeitsagentur.py` — the API adapter behind a provider seam, faked in every test.
- `profile.py` — search terms, regions and work model as plain data, not as code branches.
- `scoring.py` — pure scoring logic, no I/O, therefore trivially testable.
- `store.py` — SQLite keyed on the agency's own reference number, so an advert is reported once.
- `notify.py` — Telegram, strictly best-effort: a failed send never aborts a run.
- `run.py` — collect → filter → notify → remember.

## Why it's built this way

**Alert economy first.** A missed borderline case is cheaper than a notification that gets swiped
away, so the threshold was calibrated against the first live run rather than guessed: over 634
adverts from three days, a threshold of 6 would have fired 136 times, a threshold of 8 fires 31.
The first run deliberately fills the database silently — with an empty store every advert is
"new", and that would be a backlog, not a signal.

**One named source, honestly bounded.** Indeed shut its API, StepStone never had one, LinkedIn
blocks automation, and scraping them would be permanent maintenance. So the system uses the
federal board alone and does not claim to see what it cannot see. The score is a heuristic with
its weights written out in the open — staffing agencies are down-weighted because they supplied
40 of 309 regional adverts and sell no product of their own — and that is stated as an opinion,
not as truth.

## Implementation

15 tests plus ruff gate the code; there is one dependency beyond the standard library. A one-off
30-day sweep — 36 search terms, paginated to 600 adverts each — pulled 3,951 adverts, 2,171 of
them distinct after deduplication, and exposed a genuine design limit: **the scanner reports
deltas and can never answer "what does the market look like right now"**. That sweep ran as
throwaway analysis outside the production code, importing the project's own scoring so the
numbers stayed consistent; its scripts were archived into the session log rather than merged.

## Trade-offs & what I considered

- **No web UI.** An interface for eight lines a day would be its own purpose. Telegram is enough.
- **No salary estimation** — and then the source quietly started publishing ranges. The finding
  above is the honest consequence: the roadmap's "add a paid salary source" item was obsolete
  before it was ever started, and the adapter, not the market, was the gap.
- **No LLM in the loop.** Scoring is a transparent heuristic, because a model that cannot explain
  a rejection is worse here than a rule that can.
- **Never applies, never negotiates.** The system proposes; the decision stays with a human.

<!-- sources: /home/nicosutheimer/private/job-scout/README.md (honest-harness framing, single source, first run silent), PROJECT.md (architecture, data model, threshold 8 calibrated on 634 ads/3 days -> 136 vs 31, staffing agencies 40 of 309, production since 2026-08-11, task 07:30 WakeToRun, 15 tests), docs/sessions/2026-08-28_0929_market-sweep.md (gehaltsspanneVon/Bis + artDerVerguetung, EU pay-transparency in force since June 2026, adapter reads old flag, 36 terms / 3,951 ads / 2,171 distinct, sweep ran outside the repo) -->
