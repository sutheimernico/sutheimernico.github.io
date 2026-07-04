---
title: "Grid Scout"
order: 2
status: production
year: "2026"
stack: ["Python", "LightGBM", "GitHub Actions", "React", "Ollama", "MCP"]
summary: "A self-operating German power-market intelligence system — price forecasts, battery backtests, and a measured LLM agent, running itself for 0 €."
role: "self-operating, honestly measured"
featured: true
github: https://github.com/sutheimernico/grid-scout
---

## What it is

A German electricity-market intelligence system that operates itself: every day a GitHub Actions
pipeline pulls the official market data (SMARD, Bundesnetzagentur), retrains checks, refreshes a
day-ahead price forecast, re-runs a battery-arbitrage backtest, and redeploys the dashboard —
**live at [sutheimernico.github.io/grid-scout](https://sutheimernico.github.io/grid-scout/)**.
There is no server and no budget: the whole system runs on GitHub's free tier, and if a run fails
it opens its own GitHub issue.

## Architecture

- **Ingestion** — 19 SMARD series (prices, load, generation; 5.5 years hourly for the model
  series), partitioned and validated; a subtle rolling settlement gap in the hourly price series
  was discovered and is handled explicitly rather than papered over.
- **Forecast** — a LightGBM model predicts day-ahead prices, evaluated strictly walk-forward
  and guarded against leakage with a perturbation test: MAE 15.25 €/MWh, 44 % better than the
  naive baseline. The quantile bands are honestly flagged as too narrow (67 % empirical coverage
  vs the 80 % target) instead of being presented as calibrated.
- **Battery backtest** — a linear-programming optimizer answers "what would a 1-MW storage asset
  earn trading on this forecast?": 94.1 % of the perfect-foresight capture, and the forecast is
  worth +4,721 €/MW/yr over trading on the naive baseline.
- **Agent with a measured error rate** — a local Ollama agent answers market questions through an
  MCP tool server, graded by a programmatic eval suite: 96 % pass rate after an error-analysis
  iteration, with one real failure documented and shown on the site rather than removed.
- **Dashboard** — a static React control-room in dark mode with hand-rolled SVG charts, rebuilt
  and redeployed to GitHub Pages by every pipeline run.

## Why it's built this way

The constraint was zero running cost with real operational credibility. Data lives as commits in
the repo (git-scraping), compute is GitHub Actions, hosting is Pages — so "self-operating" is
verifiable in public: the commit history *is* the uptime log, the pipeline badge *is* the status
page, and failures open issues instead of disappearing. The same honesty rule as everywhere else:
measured numbers over impressions — the model's weak spot (interval calibration) is stated on the
dashboard, not hidden.

## Implementation

- Walk-forward evaluation with a leakage perturbation test, so the reported MAE is an
  out-of-sample number, not a fit.
- The battery model is a small LP (perfect-foresight bound vs forecast-driven vs naive), which
  makes "what is a forecast worth in €" a first-class, reproducible metric.
- The agent evals separate grader gaps from real failures — the eval suite itself was
  error-analyzed and iterated, and transcripts (including the failure) are published.
- 74 Python tests plus 11 site tests gate the pipeline; a fresh-clone verification confirms the
  whole system reproduces from scratch.

## Trade-offs & what I considered

- **Free data has edges.** SMARD's hourly price series carries a rolling settlement gap from
  15-minute market coupling; handling it costs code, but silently interpolating would poison the
  evaluation.
- **Interval calibration is deferred, and says so.** Conformal calibration of the quantile bands
  is the known next step; shipping with an honestly-labeled weakness beat shipping late.
- **GitHub-only has limits.** Actions cron is best-effort and Pages is static — acceptable here,
  because the point is a self-operating *demonstration*, not a trading desk.

_(draft — Nico to refine)_
