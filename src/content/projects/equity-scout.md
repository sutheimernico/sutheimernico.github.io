---
title: "Equity Scout"
order: 3
status: research
year: "2026"
stack: ["Python", "scikit-learn", "CatBoost", "FastAPI", "React"]
summary: "A local research harness that compares systematic strategies honestly — costs always on, no alpha promised."
role: "research assistant, not advice"
featured: true
github: https://github.com/sutheimernico/equity-scout
---

## What it is

A local-first research platform for comparing systematic investing strategies and learning
*when* a signal is worth following — not a trading bot and explicitly not advice. It runs a set
of textbook strategies and a global stock screener side by side, evaluates everything after
realistic costs, and puts a machine-learning meta-model on top that tries to learn the market
regimes in which the primary signals actually pay off. The framing is fixed: this is process and
risk education, the LLM layer *interprets*, it never forecasts or ranks. A personal research
project, in progress.

## Architecture

Six moving parts, each independently testable:

- **Strategy engine** — six classic systematic strategies (DCA, volatility targeting, risk
  parity, the Permanent Portfolio, dual momentum / GEM, defensive asset allocation) over a small
  ETF basket, backtested with monthly rebalancing, turnover tracking, and costs.
- **Equity screener funnel** — a global stock universe is pulled from yfinance, passed through a
  data-quality gate, then scored with sector-relative, rank-based factors (value, quality,
  momentum, growth, low-vol) and split into three risk buckets, with the per-stock score kept
  transparent.
- **ML meta-labeler** — triple-barrier meta-labels derived from the backtest trades; elastic-net
  logistic and gradient-boosted (CatBoost) models learn regime features (volatility, trend,
  breadth, drawdown) to predict when to follow the primary signal. Purged walk-forward validation
  blocks look-ahead.
- **Research loop** — a background search over the meta-model configuration space, gated by a
  *rising* Deflated-Sharpe hurdle so that wider searching doesn't reward a lucky trial.
- **Paper accounts** — multi-account state (JSON + SQLite) marked to market daily; nothing touches
  real money.
- **Dashboard** — a React + FastAPI front end with per-strategy equity curves, cost sweeps, the
  ML and research tabs, and the screener drill-down, plus a local Ollama assistant (no external
  API calls).

## Why it's built this way

The hard problem in quant research isn't generating a strategy — it's not fooling yourself. Every
decision here is a guard against self-deception. **Costs are always on** (and there's a sweep
across cost levels) because a free-data edge usually evaporates once you charge for turnover — and
seeing that happen is the point, not a bug. The **rising Deflated-Sharpe hurdle** exists because
if you search enough configurations, one will look brilliant by chance; the hurdle climbs as the
search widens so luck has to clear a higher bar — and the loop reports a **Probability of Backtest
Overfitting** beside every champion, openly admitting when its own search is more likely finding
luck than a real edge. The **honesty guardrails** — plain-language
explanations on every metric, "research assistant, not advice" on every surface — are there
because the failure mode of a tool like this is someone trusting it.

## Implementation

- **Own metrics library** rather than a third-party one — CAGR, Sharpe, Sortino, Calmar, and the
  Deflated Sharpe Ratio — to force cost-inclusive, deterministic, reproducible reporting.
- **State-free strategies.** Each strategy is a pure function returning target weights, with no
  dependency on portfolio state, which keeps them deterministic and trivially testable.
- **Regime features that blend price signals with free macro context** — volatility, trend,
  breadth, and drawdown derived from prices, plus a market-volatility series pulled from FRED's
  no-key CSV endpoint — so the model sees macro context while the system still needs no paid API
  key.
- Backed by a real test suite (well over a hundred tests) and run against live yfinance data; the
  build gate is pytest + ruff.

## Trade-offs & what I considered

- **Research, not a product.** The backtest engine, the six strategies, and the meta-model are
  built and validated; the continuous "self-improving" loop is live but exploratory — its training
  data is still backtest-origin, so true forward learning lands only once forward-paper persistence
  is merged. That's stated plainly rather than dressed up.
- **Free data has holes.** The screener runs on live yfinance, which is genuinely incomplete
  outside the US — a real limitation of the free-only constraint, not hidden.
- **Lower reported numbers, on purpose.** Charging realistic costs everywhere makes the headline
  figures smaller than a cost-free backtest would show. That's the honest number, and the honest
  number is the deliverable.

_(draft — Nico to refine)_
