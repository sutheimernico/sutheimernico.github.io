---
title: "Match Scout"
order: 16
status: research
year: "2026"
stack: ["Python", "Dixon-Coles", "LightGBM", "pandas", "React 19"]
summary: "A measurement harness for football prediction: Dixon-Coles and a LightGBM challenger against the closing line — the answer was no edge."
role: "a negative result, fully measured"
featured: false
domain: ml
context: personal
reviewed: false
fieldNote: "Across 4,540 simulated bets in the Top-5 leagues the flat-stake yield was −8.78 %, with a confidence interval that excludes zero — a statistically significant loss. Every single league was negative, and the machine-learning challenger lost to both the statistical model and the market."
---

## What it is

A harness for measuring whether a systematic football model would have beaten real bookmaker
odds — **not a tipster, and explicitly not betting advice**. It ingests free historical results
and odds for the Top-5 European leagues, fits a statistical goal model, selects the matches where
the model disagrees with the market in its own favour, and simulates a bankroll over time. Stakes
are paper only; no money is ever placed. The deliverable is the measurement, and a negative
result is a result.

## Architecture

`data` (provider seam with fakes, Parquet cache) → `model` (Dixon-Coles with the low-score
correction, plus Elo as a baseline) → `value` (de-vig the market, edge against a single named
pre-match price) → `backtest` (walk-forward simulation, flat staking as the headline, quarter-
Kelly as a secondary, naive baselines) and `ml` (a walled-off LightGBM challenger) → a static
JSON export → a React dashboard with hand-rolled SVG charts.

## Why it's built this way

Every design rule exists to stop the harness from flattering itself:

- **Benchmark-first.** The comparison is the market's own closing line after the margin, plus
  naive baselines (always home, always favourite, always over 2.5). Beating nothing is not a
  result.
- **Point-in-time integrity.** A bet is priced only with odds knowable before kickoff. Closing
  odds measure closing-line value and settle the bet; they are never the price you "got".
- **The challenger has to earn it.** The LightGBM model must beat Dixon-Coles *and* the closing
  line to count, validated on purged and embargoed walk-forward folds.

## Implementation

The interesting work was in the guards, and a methodology review found two real bugs in them.
The **placebo null was broken**: shuffling match outcomes globally borrowed a favourite-heavy
base rate while value bets skew towards long odds, which inflated the null to a +18.8 % yield —
it could have hidden a leak worth 15 to 18 points. It was replaced by a market-truth Monte-Carlo
null that draws each outcome from the de-vigged closing probability; the corrected null centres
on the mean closing-line value (−5.45 % against −5.36 %), and the observed result sits inside it.
The second bug was subtler: the bootstrap confidence interval was computed on stake-invariant
per-bet returns, so flat and Kelly staking reported bit-identical intervals. 130 tests at the
last recorded gate; no raw licensed CSV is committed.

**The measured answer.** First run on one league (971 bets): flat yield −4.7 %, interval
straddling zero, closing-line value −5.4 % with a beat rate of 20.4 %. Expanded to all five
leagues: 4,540 bets, −8.78 %, interval [−12.8 %, −4.8 %], and no league positive. The LightGBM
challenger scored a Brier of 0.774 and log-loss 1.674 out of sample against 0.563 / 0.952 for
Dixon-Coles and 0.539 / 0.917 for the market — worse than uniform, beaten by the simpler model.

## Trade-offs & what I considered

- **Narrow universe on purpose.** 1X2 and over/under 2.5 only, because those are the markets with
  free closing odds; both-teams-to-score was dropped for lack of them, and cup competitions run in
  shadow mode — predictions, no stake.
- **The verdict is stated with its limits.** The trial log and the rising significance hurdle are
  still open, so the finding is reported as "no edge under this untuned configuration" rather than
  as a proof.
- **Not yet running forward.** The paper loop and the scheduled pipeline are designed but unbuilt;
  what exists is the backtest and the dashboard.

<!-- sources: /home/nicosutheimer/private/match-scout/README.md (framing, honest-harness rules, scope), PROJECT.md (architecture, decisions of 2026-07-05), PLAN.md (Phase 4 acceptance: 971 bets, -4.7 %, CI [-13.0, +4.1], CLV -5.4 %, beat rate 20.4 %, baselines; Phase 5 acceptance: 563 OOS, Brier/log-loss ML 0.774/1.674 vs DC 0.563/0.952 vs market 0.539/0.917; open trial log), docs/adr/0002-placebo-null-and-kelly-ci-fixes.md (+18.8 % inflated null, market-truth null -5.45 % vs CLV -5.36 %, stake-invariant Kelly CI), AUTOPILOT_LOG.md (Top-5 expansion: 4,540 bets, -8.78 %, CI [-12.8, -4.8], CLV beat rate 22.4 %, per-league all negative; last logged gate total 130 tests) -->
