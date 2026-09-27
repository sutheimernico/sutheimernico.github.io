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
fieldNote: "A later audit found the source had started returning real salary ranges — the EU pay-transparency directive has been in force in Germany since June 2026 — while the adapter still read the old boolean flag and threw the numbers away, and the docs still claimed the system knows no salaries. The planned second data source existed to buy exactly that field. The ranges now flow through to the score and the alert — for the roughly one advert in five that carries one."
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

When salary points entered the score, the threshold was recalibrated by a rule fixed before the
replay: keep the alert volume within ±30 % of what was actually sent. Over 374 adverts from three
weeks, the replay first reproduced the old operating point (20 alerts against 21 really sent);
keeping threshold 8 with salary points would have meant 39 alerts (+86 %), so the threshold moved
to **10**, which gives 19 — and 18 of those 19 now carry a real salary range.

**One named source, honestly bounded.** Indeed shut its API, StepStone never had one, LinkedIn
blocks automation, and scraping them would be permanent maintenance. So the system uses the
federal board alone and does not claim to see what it cannot see. The score is a heuristic with
its weights written out in the open — staffing agencies are down-weighted because they supplied
40 of 309 regional adverts and sell no product of their own — and that is stated as an opinion,
not as truth.

## Implementation

74 tests plus ruff gate the code (15 before the salary round); there is one dependency beyond the
standard library. **A dead run now makes noise:** every finished run writes a marker, the next run
checks the previous working day and sends a warning line even when there is nothing else to report
— before that, "no hits" and "scanner dead" were indistinguishable. The salary round sits on a
feature branch that is not merged yet, but the scheduled task runs from that working tree, so it is
what has run every morning since 2026-09-21.

A one-off
30-day sweep — 36 search terms, paginated to 600 adverts each — pulled 3,951 adverts, 2,171 of
them distinct after deduplication, and exposed a genuine design limit: **the scanner reports
deltas and can never answer "what does the market look like right now"**. That sweep ran as
throwaway analysis outside the production code, importing the project's own scoring so the
numbers stayed consistent; its scripts were archived into the session log rather than merged.

## Trade-offs & what I considered

- **No web UI.** An interface for eight lines a day would be its own purpose. Telegram is enough.
- **No salary estimation** — and then the source quietly started publishing ranges. The finding
  above is the honest consequence: the roadmap's "add a paid salary source" item was obsolete
  before it was ever started, and the adapter, not the market, was the gap. Coverage is partial
  (about 21 % of adverts) and stated as such; a single fixed salary in a separate field is still
  ignored, named rather than silently handled.
- **A null result, kept.** Four scoring fixes (architect and consulting roles, junior titles as a
  hard exclusion, more staffing tokens) change nothing at today's operating point — of 90 junior
  adverts in the store, none had ever alerted. They close future failure cases, not current ones.
- **No LLM in the loop.** Scoring is a transparent heuristic, because a model that cannot explain
  a rejection is worse here than a rule that can.
- **Never applies, never negotiates.** The system proposes; the decision stays with a human.

<!-- sources: /home/nicosutheimer/private/job-scout/README.md (honest-harness framing, single source, first run silent), PROJECT.md (architecture, data model, threshold 8 calibrated on 634 ads/3 days -> 136 vs 31, staffing agencies 40 of 309, production since 2026-08-11, task 07:30 WakeToRun, 15 tests), docs/sessions/2026-08-28_0929_market-sweep.md (gehaltsspanneVon/Bis + artDerVerguetung, EU pay-transparency in force since June 2026, adapter reads old flag, 36 terms / 3,951 ads / 2,171 distinct, sweep ran outside the repo) ; branch feat/salary-truth @ 5b59719 (not merged into master): docs/superpowers/plans/2026-08-30-salary-truth-and-negotiation-report.md Outcome (pre-registered ±30 % band, 374 ads 2026-08-30..09-20, 21 real alerts, replay 20 at old threshold 8, 39 with salary points (+86 %), new threshold 10 → 19, 18 of 19 with a range, ~21 % coverage, run markers + missed-run warning, Phase D changes nothing: 90 junior-pattern ads none ever alerted, FESTGEHALT still ignored), RUNDE-2026-09-20.md §1 (74 passed, was 15; scheduled task runs the checked-out branch from 2026-09-21), .cache/run-2026-09-21.log … run-2026-09-27.log (daily runs with the new per-term log line) -->
