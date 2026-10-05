---
title: "Production Data Pipeline"
order: 31
status: research
year: "2026"
stack: ["Python", "OPC UA", "Modbus", "Parquet", "InfluxDB", "Grafana", "Jupyter"]
summary: "University project (Feb–Mar 2026): robot data over OPC UA and an energy meter, turned into KPIs and shown in Grafana."
role: "university project, notebook pipeline"
featured: false
domain: data
context: personal
reviewed: false
fieldNote: "It is a set of notebooks, not a service. The final notebook merges three earlier scripts so each KPI is defined exactly once, which is the one thing I would keep from it in a real pipeline."
---

## What it is

A university project (February to March 2026) on production informatics: read signals from an industrial robot, compute KPIs from them and make them visible
in a Grafana dashboard. The repository is private.

## Architecture

Signals are read over **OPC UA** (operating time, state, the six axes, temperature) and from a
**Modbus** energy meter (voltage, current, power, energy). Raw values are buffered as Parquet
files, KPIs are computed from them, and the results are written to **InfluxDB**, where a Grafana
dashboard picks them up. A mock mode generates synthetic data under the same KPI names, so the
dashboard can be developed and demonstrated without the robot.

## Why it's built this way

- **One place for KPI logic.** Three separate scripts were merged into one notebook so live and
  mock data share the same formulas and names; the dashboard queries do not care which one fed
  them.
- **Real energy data wins** over derived values whenever the meter delivers a clean counter.
- **Parquet in between** keeps the raw capture, so KPIs can be recomputed without the robot.

## Implementation

Separate notebooks cover the OPC UA connection, an inventory of all endpoints and which of them
return data, the energy meter and the combined KPI run; runs are tagged with a run ID that the
queries filter on. The Grafana dashboard is stored as exported JSON. A later project built a
React dashboard on the same data.

## Trade-offs & what I considered

- **Notebooks over a service.** Fast to iterate during a short course, but nothing here restarts
  itself or alerts on failure.
- **No claims about results.** The repository holds code and captured data, not an evaluation of
  the KPIs against the plant's own figures.
