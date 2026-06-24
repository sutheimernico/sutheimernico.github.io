---
title: "After-Sales BI Platform"
order: 1
status: production
year: "2024"
stack: ["Azure", "dbt", "Airflow", "Power BI"]
summary: "The analytics backbone for after-sales — raw events to the KPIs the business runs on."
role: "the backbone — bekumoo"
featured: true
# github: https://github.com/...   # fill in if/when public
---

## What it is

The after-sales analytics platform at bekumoo. It turns raw operational events into the
KPIs the business actually runs on — the layer between source systems and the dashboards
decision-makers open every morning. The whole thing lives on Azure and is built so that a
number on a dashboard can always be traced back to the row that produced it.

## Architecture

The warehouse is layered (a medallion-style separation of concerns):

- **Raw** — source data landed as-is, untouched, the immutable record of what arrived.
- **Clean / staging** — typed, deduplicated, conformed. One staging model per source, doing
  exactly one job: making the source trustworthy and boring.
- **Serving / marts** — business-facing models shaped for the questions stakeholders ask.
  This is the only layer Power BI is allowed to read from.

Transformations are modeled in **dbt**, scheduled by **Airflow** DAGs, and the infrastructure
itself is **Pulumi** (infrastructure as code) so the platform is reproducible rather than
click-configured. **Power BI** sits on top of the serving layer.

## Why it's built this way

The hard part of analytics isn't the SQL — it's trust. The layered split exists so that a
broken source can never silently corrupt a dashboard: failures surface in staging, where
they're cheap to catch, instead of in a board-meeting chart. Keeping serving as the only
layer BI touches means dashboard authors never reach into raw data and accidentally bake a
quirk of an upstream system into a KPI definition.

## Implementation

- **dbt tests as contracts.** Uniqueness, not-null, referential, and accepted-value tests run
  on every build. A model that violates its contract fails the pipeline rather than shipping
  wrong numbers downstream.
- **Reliable scheduled ingestion.** Airflow orchestrates the dependency graph so models only
  run once their inputs are fresh; retries and alerting mean a transient source hiccup doesn't
  silently leave stale data behind.
- **Observability.** Run status, freshness, and test results are visible, so "is the data
  current?" has a real answer instead of a guess.
- **Infrastructure as code.** Pulumi means the environment is versioned and rebuildable, not a
  snowflake someone configured by hand once.

## Trade-offs & what I considered

- **More layers = more models to maintain.** The medallion split costs boilerplate, but the
  payoff — a clean blast radius when something breaks — is worth it on a platform the business
  depends on daily.
- **Tests slow the build.** Deliberately. A slower-but-trustworthy build beats a fast one that
  occasionally serves wrong numbers; in BI, a wrong number is worse than a late one.
- **dbt + Airflow over an all-in-one tool.** Splitting transformation (dbt) from orchestration
  (Airflow) keeps each tool doing what it's best at and avoids lock-in to a single vendor's
  modeling layer.

_(draft — Nico to refine)_
