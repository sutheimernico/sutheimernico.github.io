---
title: "Grid Scout"
order: 1
status: production
year: "2026"
stack: ["Python", "LightGBM", "GitHub Actions", "React", "Ollama", "MCP"]
summary: "A self-operating German power-market intelligence system — price forecasts, battery backtests, and a measured LLM agent, running itself for 0 €."
role: "self-operating, honestly measured"
featured: true
github: https://github.com/sutheimernico/grid-scout
domain: ml
context: personal
reviewed: false
liveRepo: sutheimernico/grid-scout
fieldNote: "The published numbers move, because the evaluation window rolls with the data: since launch the forecast's MAE drifted from 15.25 to 17.88 €/MWh and the interval coverage from 67 % to 64 %. The dashboard shows the current number, not the launch number."
---

## What it is

A German electricity-market intelligence system that operates itself: a GitHub Actions pipeline
scheduled every three hours pulls fresh SMARD (Bundesnetzagentur) market data, validates it, refreshes the
artifacts and republishes the dashboard; every Monday it re-runs the full walk-forward evaluation
of a day-ahead price forecast and a battery-arbitrage backtest — **live at
[sutheimernico.github.io/grid-scout](https://sutheimernico.github.io/grid-scout/)**. No server, no
budget: it runs on GitHub's free tier and opens its own issue when a run fails. Live since
**2026-07-04** — **540 pipeline runs across 86 consecutive days**, no day missed, 10 failed and 6
cancelled runs on the record.

## Architecture

- **Ingestion** — 19 SMARD series (prices, load, generation; 5.5 years hourly for the model
  series), partitioned and validated; a subtle rolling settlement gap in the hourly price series
  was discovered and is handled explicitly rather than papered over.
- **Forecast** — a LightGBM model (14 features) predicts day-ahead prices, evaluated strictly
  walk-forward over a rolling 365-day window with a weekly refit, guarded against leakage by a
  perturbation test: **MAE 17.88 €/MWh, 38.3 % better than the naive baseline** (28.95) and 51.6 %
  better than seasonal-naive. The quantile bands are honestly flagged as too narrow — **63.6 %
  empirical coverage against an 80 % target** — instead of being presented as calibrated.
- **Battery backtest** — a linear-programming optimizer answers "what would a 1 MW / 2 MWh storage
  asset earn trading on this forecast?": **94.1 % of the perfect-foresight capture** against 88.8 %
  on the naive forecast, so the model is worth **+4,361 €** over the 364-day window.
- **Agent with a measured error rate** — a local Ollama agent (`qwen2.5:7b`) answers market
  questions through an MCP tool server, graded programmatically, no LLM judge: **27 of 28 pass
  (96.4 %)**, and the one real failure is published rather than removed.
- **Dashboard** — a static React control room with hand-rolled SVG charts, rebuilt and redeployed
  to GitHub Pages by every pipeline run.

## Why it's built this way

The constraint was zero running cost with real operational credibility. Data lives as commits in
the repo (git-scraping), compute is GitHub Actions, hosting is Pages — so "self-operating" is
verifiable in public: the commit history *is* the uptime log, the pipeline badge *is* the status
page. The model's weak spot (interval calibration) is stated on the dashboard, and because the eval
window rolls, the headline figures move without anyone editing them.

## Implementation

- Walk-forward evaluation with a leakage perturbation test, so the reported MAE is out-of-sample,
  not a fit.
- The battery model is a small LP (perfect-foresight bound vs forecast-driven vs naive), which
  makes "what is a forecast worth in €" a first-class, reproducible metric.
- The agent eval separates grader gaps from real failures. The first run scored 75 %; error
  analysis showed 5 of 7 failures were the *grader* missing valid refusals, only 2 were real. After
  fixing the grader — with regression tests taken from the real transcripts — it is 96.4 %, and the
  remaining failure (answering a stock-advice trap with in-scope price data instead of declining)
  stays in the report.
- 74 Python tests plus 11 site tests gate the live pipeline; a fresh-clone verification confirms
  the whole system reproduces from scratch.

## Next — built on a branch, not live yet

A second round is finished and tested but **not pushed**, so none of it is on the live site until
it is merged (on the branch: 135 Python and 38 site tests):

- **A forward-test ledger** — the step from backtest to living proof. Every morning before the
  day-ahead auction the model records tomorrow's forecast; the ledger scores it once prices are
  published and never overwrites a scored day. It runs on a reduced feature set, because SMARD
  publishes the generation forecast for day D only after the auction — so the live model is
  expected to be weaker than the backtest, and that gap is the number the ledger will show. A clock
  guard refuses a record once the auction has closed: a dry run had logged a "pre-auction" forecast
  after it.
- **Operations** — per-series fault isolation in ingestion; the discontinued nuclear-generation
  series reported as "discontinued" instead of as a permanent red "stale" alarm; freshness
  monitoring for the derived weekly reports; one retry for the Pages deploy.
- **Depth** — a segmented error analysis (the model beats naive in every slice; the weakest are
  Sundays at +16.6 % and the 22:00 hour at +21.9 %, computed from the data rather than written into
  a caption), and a battery sensitivity sweep over efficiency and duration: the model beats naive
  in all six cells, **+4,363 to +8,584 € per MW and year**, capture 94.0–96.2 %.
- **Visible proof** — an uptime calendar built from the pipeline's own commits, and deterministic
  market captions; the page now renders in one pass (phone layout shift 0.49 → 0.003, no horizontal
  scroll at 320–375 px).

## Trade-offs & what I considered

- **Free data has edges.** SMARD's hourly price series carries a rolling settlement gap from
  15-minute market coupling; handling it costs code, but silently interpolating would poison the
  evaluation.
- **Interval calibration is deferred, and says so.** Conformal calibration is the known next step —
  and coverage has drifted slightly *worse* since launch, which is exactly what a rolling
  evaluation is supposed to expose.
- **GitHub-only has limits.** Actions cron is best-effort — measured over three weeks, GitHub runs
  only 4–6 of the 8 daily slots and starts them a median 1.7 h late — and Pages is static; 10 of 540
  runs failed. Acceptable, because the point is a self-operating *demonstration*, not a trading
  desk; the forward forecast is scheduled twice per morning because of it.
