---
title: "Vol Scout"
order: 19
status: research
year: "2026"
stack: ["Python", "HAR-RV", "LightGBM", "Chronos-2", "arch (GARCH)", "pandas"]
summary: "A rolling-origin study asking whether ML and foundation models beat HAR-RV at forecasting equity volatility. Forecasts exist, the verdict does not."
role: "study set up, verdict not in yet"
featured: false
domain: ml
context: personal
reviewed: false
fieldNote: "Four of five models have produced their full backtest and Chronos-2 is about half done — but not a single QLIKE, RMSE or Diebold-Mariano number has been computed yet. So there is nothing to claim here, and nothing is claimed."
---

## What it is

An econometrics study with one question: **does modern ML or a foundation model beat HAR-RV — the
standard in the volatility literature — at forecasting equity volatility?** Five contenders on the
same information set: a random-walk benchmark (yesterday's realized variance), **HAR-RV**
hand-implemented as OLS on daily/weekly/monthly lags, GARCH(1,1) via `arch`, a feature-engineered
**LightGBM**, and **Chronos-2 zero-shot** on log-RV. Horizons h=1 and h=22 trading days, ten
tickers (SPY as the primary series plus nine single names and ETFs as a robustness set), free daily
OHLCV committed to the repo so the whole thing reproduces from a fresh clone without network.

By design there is no trading strategy, no backtested P&L and no alpha claim — the question is what
is *forecastable*, not what is tradable.

## Architecture

- `data.py` — yfinance fetch with an append-only CSV cache, plus the volatility proxies:
  **Parkinson** (primary), Garman-Klass and squared close-to-close returns as sensitivity checks.
- `models.py` — one registry, one call signature; every model returns both horizons from training
  data sliced strictly as of the origin.
- `backtest.py` — rolling origins tiling **forward** from 2018-01-02, one every 5 trading days.
- `stats.py` — QLIKE (primary), RMSE, Mincer-Zarnowitz for bias, and Diebold-Mariano with the
  Harvey-Leybourne-Newbold small-sample correction.
- `scripts/` — thin, resumable runners appending to one long-format `results/forecasts.csv`.

## Why it's built this way

Forward tiling (rather than backward from the latest bar) keeps every previously computed origin's
window byte-identical when the data is refreshed — new origins only append at the tail, which makes
"skip what is already computed" a correct resume rule instead of a silent inconsistency. A model
failure at an origin is recorded *as a result* for the same reason: otherwise a resumable run
retries it forever.

QLIKE is primary because it is the metric that stays robust when the target is a noisy proxy. And
because h=22 windows overlap by 17 of 22 days, a naive significance test would be wrong — hence
DM with the HLN correction, and the standing editorial rule that differences inside the noise are
called ties.

## Implementation

Data, proxies, all five model adapters, the backtest mechanics and the statistics module are
implemented, with **105 test functions** — including anti-leakage sentinels that poison a single
future day with `1e9` and assert that an origin before it never sees the value. The backtest has
produced **38,108 forecasts**: random walk, HAR-RV, GARCH and LightGBM complete at 8,500 rows each
(10 tickers × 425 origins × 2 horizons), Chronos-2 at 4,108 of 8,500.

Not yet: the metrics run, the DM verdicts, the figures, the README write-up and the read-only demo
app. Until those exist, the study has forecasts but no findings.

## Trade-offs & what I considered

- **The target is a proxy.** True realized volatility needs intraday data, which is not free; OHLC
  estimators are stated as caveat #1 rather than glossed over.
- **Chronos-2 sees only the univariate volatility series** — fair against HAR-RV on the same
  information set, but a limit worth naming.
- **One dominant market regime** in the out-of-sample window; the robustness set mitigates that, it
  does not solve it.

<!-- sources: /home/nicosutheimer/private/vol-scout/PROJECT.md (research question, constraints incl. no PnL claim, data policy 10 tickers ~16y committed, milestone status M1-M3 done, M4 partial, M5/M6 open), docs/superpowers/specs/2026-07-20-vol-scout-design.md (contender table incl. hand-implemented HAR-RV and arch GARCH, horizons h=1/h=22, Parkinson primary + GK/squared returns, QLIKE/RMSE/MZ, DM with HLN, editorial tie rule, honest limitations 1-5), docs/superpowers/plans/2026-07-20-vol-scout-v1.md (forward tiling rationale for resumability, h=22 overlap 17 of 22 days, error column / failure-as-result, resumable append helper), src/vol_scout/backtest.py (OOS_START = "2018-01-02", STEP_TRADING_DAYS = 5, HORIZONS = (1, 22)), results/forecasts.csv (38,108 rows: random_walk/har_rv/garch/lgbm 8,500 each, chronos2 4,108; 10 tickers; origins 2018-01-02..2026-06-10), tests/*.py (105 `def test_` functions; poison-sentinel tests in test_models.py), no git remote configured -> no github field -->
