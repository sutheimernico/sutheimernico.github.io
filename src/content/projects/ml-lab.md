---
title: "ML Lab"
order: 4
status: research
year: "2026"
stack: ["TabPFN", "Chronos", "LightGBM", "DuckDB", "Streamlit", "Python"]
summary: "Three benchmarks where the verdict defaults to 'tie': TabPFN vs tuned LightGBM, zero-shot Chronos vs classical baselines, and an agent with a judge."
role: "a named test behind every claim"
featured: true
domain: ml
context: personal
reviewed: false
fieldNote: "A local 7B model drove the analyst loop live for about three hours and never produced a schema-valid report — while training a baseline better than the demo's along the way. Both halves are committed as artifacts."
---

## What it is

Three self-contained benchmarks, built to answer questions whose honest answer is often "no
difference": **tabular-showdown** (a tabular foundation model vs a properly tuned GBDT),
**timeseries-showdown** (zero-shot forecasting foundation models vs classical baselines), and
**agentic-analyst** (an LLM that writes an analysis report, plus a judge that recomputes every
number in it). Each ships committed result artifacts, a Streamlit app over them, and a limits
section.

## Architecture

- **tabular-showdown** — TabPFN v2 vs an Optuna-tuned LightGBM vs an untuned logistic regression
  on UCI Adult, swept over training-set size with 10 subsample seeds per size (5 at the larger
  ones) and a **seed-paired** significance test at every size both models actually ran on.
- **timeseries-showdown** — nine model configs (Chronos-Bolt, Chronos-2, AutoARIMA, AutoETS,
  Prophet, feature-engineered LightGBM, seasonal-naive) over 20 weekly rolling-origin windows on
  hourly bike-sharing demand, scored in MASE at 24 h and 168 h with Diebold–Mariano/HLN tests on
  the two headline pairs.
- **agentic-analyst** — a tool-calling agent (schema read → SQL profiling → sandboxed Python →
  report) over the Telco churn CSV, where every claim carries the exact SQL or code that produced
  it. The judge re-executes that evidence and compares the recomputed value to the claim; it never
  asks a second model whether the text looks right.

## Why it's built this way

The rule across all three is that a "win" needs a named test and everything else defaults to a
tie. That rule is what turned the tabular headline from "LightGBM overtakes at 5,000 rows" into
"still a tie at 5,000, and no measured crossover anywhere" once the confidence interval, not the
larger mean, was allowed to decide. A cross-cutting review round found and fixed two more of these:
a calibration gap that was really a mis-tuned LightGBM, and a stale caveat contradicting its own
artifact.

## Implementation

- **Tabular result:** TabPFN wins significantly from 200 to 2,000 rows (+0.100 ROC-AUC at n=200,
  +0.0033 at n=2,000, both CIs excluding zero) and ties at 5,000 (+0.0014, CI [−0.0045, +0.0072]).
  Its predict is ~4 orders of magnitude slower than LightGBM's. The honest surprise: at n=200 an
  untuned logistic regression (0.882) nearly matches TabPFN (0.884) and buries a 10-trial-tuned
  LightGBM (0.784).
- **Time-series result:** every foundation-model config beats every classical baseline at both
  horizons — but zero-shot Chronos-Bolt against tuned LightGBM at 24 h is a statistical tie
  (p=0.30) and a clear loss at 168 h (p=0.004). Chronos-Bolt takes 16 of 20 windows against
  AutoARIMA at 24 h and the test still cannot reject (p=0.086), so it is labelled a tie.
- **Judge result:** 255 planted lies across five attack classes — precision 100 %, recall 98.4 %,
  zero false positives on the honest controls. All four misses are ±5 % distortions of a ~0.16
  value, i.e. inside the documented absolute tolerance rather than a leak.
- 172 tests gate the time-series project, 165 the analyst.

## Trade-offs & what I considered

- **A 7B model at the wheel is a negative result, and it is published as one.** `qwen2.5:7b` drove
  the analyst loop live three times, ~57–61 min each, and never produced a schema-valid report —
  it kept submitting qualitative findings without the one recomputable value per finding the
  contract needs. It did run a clean multi-tool analysis and trained a logistic regression at
  ROC-AUC ≈0.829, beating the committed demo baseline (0.8105).
- **The scope limits are the headline's fine print.** The tabular study is one dataset and a
  single frozen eval split; the forecasting study is one univariate series, so it does not test
  the multi-series cross-learning these models are actually built for.
- **The judge does not catch everything**, and says so: evidence that genuinely queries the real
  data but a different population is only partly caught by a conservative heuristic.

<!-- sources: /home/nicosutheimer/private/ml-lab/tabular-showdown/README.md (per-size paired table: +0.1000 at n=200, +0.0033 at n=2000, +0.0014 CI [-0.0045,+0.0072] at n=5000; LogReg 0.882 vs TabPFN 0.884 vs LightGBM 0.784 at n=200; ~4 orders of magnitude predict gap; 10 seeds / 5 seeds; frozen 4,000-row eval split), timeseries-showdown/README.md (9 configs, 20 rolling windows, MASE 0.658/0.667 vs 0.713/0.698, DM/HLN p=0.30 / p=0.004 / p=0.086, coverage caveats, single-series caveat), agentic-analyst/README.md (255 planted lies, precision 100 % / recall 98.4 % / FPR 0 %, four ±5 % misses inside abs_tol=0.01, qwen2.5:7b 3 attempts x 20 iterations ~57-61 min, no schema-valid report, ROC-AUC ~0.829 vs 0.8105, "what the judge does NOT catch"), timeseries-showdown/AUTOPILOT_LOG.md (172 tests green), agentic-analyst/AUTOPILOT_LOG.md (165 tests green), REVIEW.md (WP-B1 tie-by-default, WP-B2 mis-tuned calibration), no git repo → no github link -->
