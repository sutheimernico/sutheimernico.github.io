---
title: "Bandit Simulator"
order: 29
status: research
year: "2025"
stack: ["Vue 3", "TypeScript", "Pinia", "Chart.js", "Vitest", "GitHub Actions"]
summary: "University team project (five contributors, Aug–Oct 2025): a Vue 3 web app that simulates multi-armed-bandit algorithms on a stock portfolio."
role: "one of five, algorithm docs and evaluation tests"
featured: false
github: https://github.com/g-dev-net/HSOS-Programmierprojekt
domain: ml
context: personal
reviewed: false
fieldNote: "This was a team project: of the repository's 109 commits, 25 are mine, mostly the UCB and Gaussian-bandit parts, the evaluation helpers with their unit tests, and the written theory behind the algorithms."
---

## What it is

A programming project from Hochschule Osnabrück, built by five students between August and October
2025. Users assemble a stock portfolio, make investments, and then compare bandit algorithms on it:
greedy, epsilon-greedy, optimistic initial values, UCB, Thompson sampling and gradient bandit. Each
stock is an arm; the app simulates Bernoulli and Gaussian bandits and charts rewards, accuracy and
the portfolio's development next to the arm parameters. An in-app description of every algorithm,
with its mathematics, is part of the product. The repository is public and lives under a teammate's
account.

## Architecture

A Vue 3 single-page app with TypeScript. The algorithms and the two bandit types are plain
TypeScript modules, each with a Markdown note beside it; Pinia stores hold the bandit, the
algorithm parameters and the comparison state; Chart.js components and a table render the results,
and KaTeX typesets the formulas. A GitHub Actions workflow handles deployment.

## Why it's built this way

Keeping the algorithms free of Vue code means they can be unit-tested without a browser and
explained next to the code that implements them. The evaluation module turns the investment history of each algorithm into a hit-rate series against
the best stock, which the charts then plot step by step.

## Implementation

My part was mainly UCB and the Gaussian bandit, the evaluation module (hit rate against the best arm) with
Vitest tests, a fix for a double pop-up, and the theory write-ups and sources for the
algorithms.

## Trade-offs & what I considered

- **A simulation, not a trading tool.** The stock "returns" are parameters of simulated arms, not
  a market prediction, and the app makes no such claim.
- **Team trade-off.** With five people the useful discipline was the shared structure — one
  module and one note per algorithm — so parts could be written and reviewed independently.
