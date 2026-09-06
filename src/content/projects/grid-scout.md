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
fieldNote: "The published numbers move, because the evaluation window rolls with the data: since launch the forecast's MAE drifted from 15.25 to 16.80 €/MWh and the interval coverage from 67 % to 65 %. The dashboard shows the current number, not the launch number."
---

## What it is

A German electricity-market intelligence system that operates itself: every three hours a GitHub
Actions pipeline pulls fresh SMARD (Bundesnetzagentur) market data, validates it, refreshes the
artifacts and republishes the dashboard; every Monday it re-runs the full walk-forward evaluation
of a day-ahead price forecast and a battery-arbitrage backtest — **live at
[sutheimernico.github.io/grid-scout](https://sutheimernico.github.io/grid-scout/)**. No server, no
budget: it runs on GitHub's free tier and opens its own issue when a run fails. Live since
**2026-07-04** — **439 pipeline runs across 65 consecutive days**, no day missed, 10 failed and 6
cancelled runs on the record.

## Architecture

- **Ingestion** — 19 SMARD series (prices, load, generation; 5.5 years hourly for the model
  series), partitioned and validated; a subtle rolling settlement gap in the hourly price series
  was discovered and is handled explicitly rather than papered over.
- **Forecast** — a LightGBM model (14 features) predicts day-ahead prices, evaluated strictly
  walk-forward over a rolling 365-day window with a weekly refit, guarded against leakage by a
  perturbation test: **MAE 16.80 €/MWh, 40.9 % better than the naive baseline** (28.43) and 52.9 %
  better than seasonal-naive. The quantile bands are honestly flagged as too narrow — **64.5 %
  empirical coverage against an 80 % target** — instead of being presented as calibrated.
- **Battery backtest** — a linear-programming optimizer answers "what would a 1 MW / 2 MWh storage
  asset earn trading on this forecast?": **94.0 % of the perfect-foresight capture** against 89.0 %
  on the naive forecast, so the model is worth **+4,079 €** over the 364-day window.
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
- 74 Python tests plus 11 site tests gate the pipeline; a fresh-clone verification confirms the
  whole system reproduces from scratch.

## Trade-offs & what I considered

- **Free data has edges.** SMARD's hourly price series carries a rolling settlement gap from
  15-minute market coupling; handling it costs code, but silently interpolating would poison the
  evaluation.
- **Interval calibration is deferred, and says so.** Conformal calibration is the known next step —
  and coverage has drifted slightly *worse* since launch, which is exactly what a rolling
  evaluation is supposed to expose.
- **GitHub-only has limits.** Actions cron is best-effort and Pages is static; 10 of 439 runs
  failed. Acceptable, because the point is a self-operating *demonstration*, not a trading desk.

<!-- sources: /home/nicosutheimer/private/grid-scout/README.md (19 SMARD series, 5.5y hourly, settlement gap, 74 tests, LP battery, MCP, qwen2.5:7b, eval error analysis 75%→96%, grader gaps 5 of 7, remaining stock-advice failure), .github/workflows/pipeline.yml (cron "47 */3 * * *" ingest+publish, "13 2 * * 1" full eval), PLAN.md Outcome (published 2026-07-04, 74 Python + 11 site tests, fresh-clone verification), reports/forecast_eval.json on main @ 2026-08-31 (lgbm_point MAE 16.802, naive 28.426, seasonal-naive 35.664, skill +40.9% / +52.9%, coverage_p10_p90 0.645 vs target 0.8, eval period 2025-08-31..2026-08-30, refit_every_days 7, 14 features per README), reports/battery_backtest.json on main (1 MW / 2 MWh, 86% round-trip, capture_rate_model 0.9404, capture_rate_naive 0.8903, model_edge_over_naive_eur 4078.76, n_days 364), reports/agent_eval.json on main (n 28, passed 27, pass_rate 0.964, programmatic grading, no LLM judge), gh run list --workflow=pipeline.yml (439 runs 2026-07-04..2026-09-06, 65 distinct days, 0 missing days, 423 success / 10 failure / 6 cancelled) -->
