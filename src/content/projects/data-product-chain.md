---
title: "Data-Product Delivery Chain"
order: 30
status: internal
year: "2025"
stack: ["dbt", "FastAPI", "Alembic", "React", "TypeScript"]
summary: "One repeatable path for a new KPI at bekumoo: mart model → product definition → serving endpoint → app dataset → frontend module."
role: "from a change ticket to a chart"
featured: false
domain: data
context: work
reviewed: false
fieldNote: "Most 'add a column' tickets touch four repositories. Writing the chain down as a checklist turned a half-day of archaeology into a routine — and made the gaps between the layers visible."
---

## What it is

The end-to-end path a data product takes through the after-sales platform at bekumoo, treated
as a piece of engineering in its own right. A typical ticket reads "we added a column, please
expose it" or "new KPI for module X". Fulfilling it touches the warehouse, the serving API, the
application backend and the frontend — four repositories with four sets of conventions. This
is the documented, repeatable way through them.

## Architecture

The chain, in delivery order:

- **Mart model (dbt).** The business-facing model in the top warehouse layer is where a new
  measure or dimension is born, with its tests.
- **Product definition.** The serving layer describes each data product declaratively: the
  fields it exposes, the filters it accepts, and the metric definitions that give a number its
  meaning (unit, aggregation, wording). Adding a column means extending the definition, not
  writing a handler.
- **Serving endpoint.** Generated from the definition and read by everything downstream.
- **Application dataset.** The backend registers which module consumes which product and how
  it is shaped for that screen — a change here often needs a schema migration.
- **Frontend module.** The React / TypeScript component renders from the dataset contract:
  a table, a chart, a filter.

## Why it's built this way

Because the alternative was tribal knowledge. Each layer is sensible on its own; the friction
lived between them — which repository first, what the registry needs, why a module returns
empty items or a 404 when one link in the chain is missing. Making the path explicit does two
things: a new colleague can ship a data product without a guide sitting next to them, and the
recurring failure modes get names and fixes instead of being rediscovered.

## Implementation

- **A guided workflow** for creating or changing a data product, written as the checklist I
  follow myself and encoded as a reusable skill for the AI coding assistant we use — so the
  assistant walks the same four steps in the same order instead of improvising.
- **Debugging paths** for the classic symptoms (empty dataset, forbidden, not found) that trace
  the chain backwards to the missing link.
- **Migration routine** for the application backend: create, apply, verify in the target
  database, merge heads when two branches both migrated.

## Trade-offs & what I considered

- **Declarative products are more upfront work** than a hand-written endpoint, and they resist
  one-off special cases. That resistance is the feature: every product behaves the same way for
  the frontend.
- **Four repositories is a real cost.** A monorepo would remove some of the friction; the chain
  document is the pragmatic answer inside the structure we have.
- **Company-internal.** No code, no screenshots, no numbers here — the public projects on this
  site show the same habits in the open.

<!-- sources: Nico's own workflow documentation for the bekumoo data lab (the guided
endpoint workflow and the migration routine he encoded as reusable assistant skills). No
internal repository was read for this page; wording is intentionally generic and names no
identifiers. Nico must vet for confidentiality before merge. -->
