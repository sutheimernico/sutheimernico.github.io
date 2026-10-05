---
title: "Sustainability Dashboard"
order: 30
status: research
year: "2026"
stack: ["React", "TypeScript", "Vite", "Recharts", "InfluxDB", "Express", "Python", "Gemini"]
summary: "University team project (March 2026) for an industrial partner: a dashboard of industrial-robot KPIs from InfluxDB — availability, performance, energy, OEE — with an LLM-written summary."
role: "team project, local demo"
featured: false
domain: data
context: personal
reviewed: false
fieldNote: "Built for local demonstration, not operation: the browser queries InfluxDB directly, and the README itself calls it a pragmatic local analysis frontend rather than a backend system."
---

## What it is

A university team project (March 2026), done together with an
industrial partner whose name I leave out. A dashboard for one robot cell that shows
overall equipment effectiveness (OEE) with its availability, performance and quality parts,
process figures such as energy and CO2 per 1000 parts and scrap rate, and a separate temperature
section. A button generates a short summary of the last eight hours of data with an LLM. The
repository is private.

## Architecture

- **Frontend:** a React and TypeScript single-page app on Vite; TanStack Query handles polling and
  loading states, Zustand holds the filters, Recharts draws the series, Tailwind does the styling.
- **Data:** KPI series in InfluxDB v2, read straight from the browser. The newest run is picked up
  automatically, and time windows (5 minutes to the full run) are resolved relative to that run's
  end, never before its start.
- **Summary:** a small local Express bridge starts a Python script that reads the last eight hours
  from InfluxDB and asks Gemini for a summary. It runs only on demand, never on a poll.

## Why it's built this way

- Gauges show the **mean over the loaded window**, not the latest value, so a single reading does
  not swing the picture; charts show the same window as a series.
- Temperature is its own section so it does not disappear in the process group.
- The LLM call goes through a server-side script, so the API key never reaches the browser, and
  the dashboard's KPIs and thresholds stay visible in config rather than hidden in a prompt.

## Implementation

Status thresholds and gauge segments are configured in one file; aggregation windows scale with
the chosen time range so charts stay readable; empty, loading and error states are handled in the
UI. A separate document explains the KPI logic and what has to change to run against real data.

## Trade-offs & what I considered

- **Local by design.** Credentials sit in an environment file and the app is meant for demos on one
  machine; hardening it for shared use would be a separate project.
- **The summary is a convenience, not a measurement.** It is generated text over the same numbers
  and is not evaluated in the repository.
