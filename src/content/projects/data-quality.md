---
title: "Data Quality Monitoring"
order: 7
status: internal
year: "2024"
stack: ["dbt", "tests", "alerting"]
summary: "Continuous checks that catch broken data before a dashboard ever lies."
role: "trust, by construction"
featured: true
# github: https://github.com/...   # fill in if/when public
---

## What it is

Continuous data-quality monitoring for the warehouse: dbt tests plus alerting that catch
broken data *before* it reaches a dashboard. An internal layer whose entire job is to make
sure a report never quietly lies.

## Architecture

- **dbt tests as the checks.** Schema and data assertions — uniqueness, not-null, referential
  integrity, accepted values, freshness — run as part of the warehouse build, expressing the
  invariants every model must satisfy.
- **Alerting on failure.** When an assertion breaks, it surfaces loudly to the people who can
  act on it, instead of being buried in a log nobody reads.
- **Upstream placement.** The checks sit *before* the serving layer, so a failure stops bad
  data on its way in rather than after it's already been charted.

## Why it's built this way

Trust by construction. The cheapest place to catch a data problem is the moment it appears; the
most expensive is when a stakeholder spots a wrong number in a meeting. The guiding rule is
**fail loudly upstream rather than silently serving wrong numbers** — a missing dashboard
prompts a question, a wrong dashboard erodes trust in every dashboard.

## Implementation

- **Tests live with the models they guard,** so a model and its contract evolve together and a
  schema change can't outrun its checks.
- **Failures are actionable, not noise.** Alerts point at the specific assertion and model that
  broke, so the response is "fix this," not "go hunting."
- **Built into the pipeline, not bolted on.** Quality is a build step, not an after-the-fact
  audit — there's no window where unverified data is allowed to serve.

## Trade-offs & what I considered

- **Strict tests fail builds.** That's the feature. A failed build that blocks bad data is the
  point; the cost is the occasional 2am page, paid gladly to keep dashboards trustworthy.
- **Alert tuning is ongoing.** Too sensitive and people tune it out; too loose and problems
  slip through. Calibrating the signal-to-noise is continuous work, not a one-time setup.
- **dbt's native tests over a separate DQ tool.** Keeping checks in dbt means they live next to
  the transformations, version together, and run in the same pipeline — no second system to
  keep in sync with reality.

_(draft — Nico to refine)_
