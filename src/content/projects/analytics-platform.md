---
title: "After-Sales Data Platform"
order: 6
status: production
year: "2024"
stack: ["dbt", "FastAPI", "React", "Azure", "Airflow", "Pulumi"]
summary: "The analytics backbone for after-sales at bekumoo — from raw events through dbt and a serving API to the frontend people open every morning."
role: "the backbone — bekumoo"
featured: true
domain: data
context: work
reviewed: false
fieldNote: "The hard part was never the SQL. It was making a number on a chart traceable back to the row that produced it — and making a broken source fail loudly upstream instead of quietly on a dashboard."
---

## What it is

The after-sales analytics platform at bekumoo, the system I work on in my day job. It turns
raw operational data from dealer and workshop systems into the KPIs the business actually runs
on, and delivers them through an application of our own rather than only through a BI tool:
a data warehouse modelled in **dbt**, a **FastAPI** serving layer on top of it, an application
backend with its own database and migrations, and a **React / TypeScript** frontend. The whole
thing lives on **Azure**.

I'm one engineer on a small team; this page describes the platform as a whole and my part in
it — end-to-end delivery of data products, from the model to the pixel.

## Architecture

- **Warehouse, layered.** Source data lands untouched, is typed and conformed in staging, then
  shaped into business-facing marts. Only the top layer is allowed to be read by anything a
  user sees — dashboards and app alike.
- **Serving API.** A FastAPI service exposes the marts as versioned data products: each product
  carries its own definition (what it measures, which filters it accepts, which metric
  definitions apply), so a new KPI is a new definition, not a new endpoint written by hand.
- **Application backend.** A second FastAPI service owns users, modules and per-module datasets
  on a relational database with **Alembic** migrations; it composes the data products into what
  a specific screen needs.
- **Frontend.** A React / TypeScript app renders the modules — tables, charts, drill-downs —
  from the dataset contracts the backend publishes.
- **Orchestration and infrastructure.** **Airflow** schedules the dbt runs and the loads;
  **Pulumi** describes the Azure resources as code, so environments are rebuilt, not clicked.

## Why it's built this way

Trust is the product. The layered warehouse exists so that a broken upstream feed fails in
staging — cheap, visible, early — instead of surfacing as a wrong number in a management
meeting. Putting a serving API between the warehouse and every consumer means the KPI
definition lives in exactly one place, and the app, a dashboard and an export all show the same
number. Splitting the application backend from the serving layer keeps "what the business
measures" separate from "what this screen shows", which is what lets the frontend evolve
without touching the warehouse.

## Implementation

- **dbt tests as contracts** — uniqueness, not-null, referential integrity, accepted values and
  freshness run on every build; a model that violates its contract fails the pipeline.
- **A repeatable delivery path for a new data product**: mart model → product definition and
  metric definitions → serving endpoint → application dataset → frontend module. I wrote the
  step-by-step for this chain so a change ticket ("column added, please expose it") becomes a
  checklist instead of archaeology.
- **Schema changes as migrations**, reviewed and applied per environment, with the check
  "did it actually arrive in the database?" as part of the routine.
- **Pull-request workflow** on Azure DevOps with per-repository target branches, build
  validation and review before anything reaches a shared environment.

## Trade-offs & what I considered

- **More layers, more moving parts.** A warehouse plus two services plus a frontend is more
  to maintain than a BI tool on a database. The payoff is a clean blast radius and one
  definition per KPI, which on a platform the business depends on daily is worth the
  boilerplate.
- **Tests slow the build.** Deliberately. In analytics, a late number is a question; a wrong
  number is a lost argument.
- **What I can't show here.** It's company software: no repository, no screenshots, no
  numbers. The public projects on this site exist partly to demonstrate in the open what this
  platform demonstrates behind a login.

<!-- sources: Nico's day-job stack as described in his LinkedIn profile draft (dbt, FastAPI on
Azure, Alembic migrations, Airflow, React/TypeScript, Pulumi, Azure DevOps PRs). No internal
repository was read for this page; wording is intentionally generic. Nico must vet for
confidentiality before merge. -->
