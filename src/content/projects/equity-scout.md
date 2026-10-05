---
title: "Equity Scout"
order: 2
status: production
year: "2026"
stack: ["Python", "CatBoost", "FastAPI", "React", "SQLite", "Ollama"]
summary: "An autonomously operating signal-evaluation system whose real product is its honesty gates — and the negative findings they keep producing."
role: "honesty gates against self-deception"
featured: true
github: https://github.com/sutheimernico/equity-scout
domain: ml
context: personal
reviewed: false
fieldNote: "The live entry model claimed an AUC of 0.6195 from 220 out-of-sample rows; re-measured on 3,281 rows it scored 0.5152 — and it had been blocking better challengers for five weeks. Across 29 trained models none ever reached the project's own 0.55 gate, so nothing is promoted and the ML lanes trade nothing."
---

## What it is

A local system that screens a global equity universe, scores candidate entries and runs paper
lanes against those signals — and it runs itself: a daily chain at 18:00, nightly training at
02:30, minute-level catalyst scans in the market window, a crypto lane around the clock. The
trading is not the deliverable; the **measurement apparatus** is — nothing it claims about a signal
counts until it clears a gate written down first. Decision support, never advice; no real money is
ever routed.

## Architecture

- **Screener funnel** — a ~7,500-ticker global universe passes a data-quality and investability
  gate (≥ 300 M € market cap *and* ≥ 1 M € daily turnover — size excludes, it never ranks), then
  sector-relative factor scores split it into risk buckets.
- **Lanes as separate books** — rule-based ETF sleeves in one meta-allocated paper depot plus five
  short-term lanes, each with its own book, benchmark and kill gate.
- **Predict-then-resolve ledger** — every live score enters an immutable ledger *before* the
  outcome is knowable and is resolved later against real forward prices; a companion **non-trade
  book** records what was rejected and why, and resolves that too.
- **Evidence layer** — five free disclosure sources (congress filings, 13F, Form 4 insider buys,
  news themes, tracked voices) annotate pitches but never touch selection.
- **Operations** — a token-gated FastAPI + React cockpit that installs as a PWA; alerts fan out
  over Web Push/VAPID, ntfy and Telegram so one dead channel never costs the others, and a GitHub
  Actions workflow builds the Android APK as a Trusted Web Activity.

## Why it's built this way

An autonomous ML system that grades its own homework will lie to you, so the gates come first.
**Costs are always on**: each depot fill is charged `max(10 bps, half the Corwin-Schultz spread
estimate)`, and the crypto lane pays Kraken's real 80 bps taker fee per side. **Purged,
date-grouped walk-forward** everywhere, promotion only on a strictly better out-of-sample AUC. A
**Deflated-Sharpe hurdle that rises with every trial**, so a wider search cannot buy a
better-looking champion, plus a weekly CSCV **Probability of Backtest Overfitting** check. And
**kill gates are pre-registered**: the session lane was paused on 2026-08-17 when its entry rule
was refuted, the gap-fade lane switched off after six days produced zero measurable observations.

## Implementation

- **Live paper trading, not simulated fills.** The session lane routed bracket orders to an Alpaca
  **paper** account; the gap between signal price and broker fill is the only *measured* slippage
  here — 1–3 bps at roughly 5 s fill latency. The track record carries a labelled break at
  2026-08-06, because everything before it used delayed bars and simulated fills.
- **The negative findings stay.** 11 behavioural indicators tested over up to 19 years predict no
  market return at all, and 0 of 63 incremental tests survive. The study's own recommendation:
  build nothing from this map.
- **The apparatus catches its own errors.** A published congress-trading result (−17.55 pp vs SPY,
  t = −51.6) was **withdrawn** when a re-check found SPY subtracted twice: corrected it reads
  −0.39 pp at t = −1.04 — undecidable, not negative — and the insider figure flipped from −5.76 pp
  to +7.91 pp, no horizon surviving Bonferroni.
- **2,707 Python tests** plus a frontend suite gate the build.

## Trade-offs & what I considered

- **No edge is claimed, because none has been measured.** After seven weeks no lane has a
  statistically robust positive expected value; the crypto lane's −452 $ was almost exactly its
  taker fees; and a diversification study found **3.19 independent bets among 12 sleeves** — scaled
  to market volatility the depot returns 12.63 % against SPY's 16.07 %. Two thirds of the return at
  half the risk: a different product, not a better one, and the dashboard says so.
- **Free data has holes.** yfinance is unofficial and incomplete outside the US, and the ML
  training universe is today's watchlist backfilled to 2007 — survivorship-biased. Both caveats are
  served live by the model endpoint, not buried in a README.
- **Paper only, by rule.** A smaller public sibling,
  [signal-trader-demo](https://github.com/sutheimernico/signal-trader-demo), carries the same
  discipline into a standalone harness.
