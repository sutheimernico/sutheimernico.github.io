---
title: "Signal Trader"
order: 4
status: research
year: "2026"
stack: ["Python", "LightGBM", "vectorbt", "FastAPI", "React"]
summary: "An honest paper-only backtest harness — point-in-time data, costs always on, failed experiments left visible."
role: "an honest harness, not an edge"
featured: true
github: https://github.com/sutheimernico/signal-trader-demo
---

## What it is

A paper-only harness for measuring whether a trading signal is actually any good, built to be
honest about what a backtest can and cannot tell you. It pulls free, point-in-time signal sources
— insider Form 4 filings, 13F superinvestor longs, US congressional trades — and tests them
against price data through two independent backtest engines, always after realistic costs and
always against a buy-and-hold benchmark. No real money is ever traded. The most interesting result
so far is a negative one, and it's kept on display rather than buried.

## Architecture

A five-layer pipeline:

- **Data layer** — yfinance daily bars cached locally (Parquet + SQLite), plus three free
  point-in-time signal sources scraped from SEC EDGAR and House disclosures.
- **Signal layer** — signals are consolidated per ticker and date, each carrying both the event
  date and the date it actually became *knowable*, so real-world disclosure lag can be measured
  instead of assumed away.
- **Strategy layer** — a momentum baseline plus a LightGBM ranker on price/volume features, both
  strictly point-in-time and validated with purged, embargoed walk-forward.
- **Dual backtest engines** — an event-driven engine (`backtesting.py`) and a vectorized one
  (`vectorbt`) run the *same* strategy behind a common adapter, both charging per-trade costs and
  slippage.
- **Interface** — a FastAPI read API and a React dashboard showing signal cards, hit rates, and
  the data-lag columns; a paper-trading loop wired to Alpaca's paper account only.

## Why it's built this way

The whole project is a stance against the way backtests usually lie. **Point-in-time is enforced
at the schema level** — every signal records when it was knowable, not just when it happened — so
the most common backtest sin, quietly using information that wasn't available yet, is structurally
hard to commit. **Two engines run side by side** because the same strategy can look better or worse
depending on fill assumptions; seeing the gap between them is a realism check you don't get from a
single engine. **Costs and a benchmark are always present**, and the headline metric is never
Sharpe alone — Sortino, Calmar, and a probabilistic Sharpe ratio all have to agree before a result
is taken seriously.

## Implementation

- **Purged and embargoed walk-forward** for the ML layer: training samples whose label window
  overlaps the test window are dropped, with an embargo gap on top, so the model can't peek across
  the boundary.
- The ML experiment's verdict is the feature, not a footnote: a price-feature model edges the
  baseline on a broad universe, but **adding calendar features made out-of-sample performance
  worse** — a concrete demonstration of overfitting, which is exactly what the purged validation
  was built to catch. The autonomous paper loop exists but is left disabled because the model
  doesn't justify the edge.
- **A free survivorship stress test.** Most backtests quietly assume today's survivors always
  existed. Here, a name is penalised point-in-time the moment its SEC delisting became *knowable*,
  and the same walk-forward is re-run. The result keeps its nerve rather than flattering the
  author: under stress *both* strategies still lose, and the cause is laid bare — the momentum
  baseline keeps picking fragile, soon-to-delist names roughly ten times as often as the ML model
  does. A truly clean test needs paid delisted-price data; that limit is stated, not hidden.
- Over two hundred tests back the engines, the cost model, the point-in-time guarantees, and
  the validation regime; the gate is pytest + ruff.

## Trade-offs & what I considered

- **Methodology over performance.** The deliverable is the measurement discipline — catching
  look-ahead, charging costs, letting failed experiments stay failed — not a profitable strategy.
  Phases 1–2 (data, costs, both engines, insider signals) are solid; the dashboard and the ML
  experiment are live research, with the dashboard's final look still being tuned.
- **Paper-only, by rule.** Insider-style suggestions are human-decided; the ML side is autonomous
  but paper-only. No backtest result executes real money without a human in the loop — a
  deliberate, non-negotiable constraint, not a missing feature.
- **Dual engines cost duplication.** Maintaining two backtest paths is more work than one, paid
  willingly because the disagreement between them is the realism signal.

_(draft — Nico to refine)_
