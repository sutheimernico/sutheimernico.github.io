---
title: "Hausgeist"
order: 27
status: in-progress
year: "2026"
stack: ["Python", "FastAPI", "MQTT", "React", "TypeScript", "Zigbee2MQTT"]
summary: "Self-built smart-home software: one device model, one backend, one PWA for wall tablet and phone. Scaffolded and designed — no device is connected yet."
role: "design and scaffold, nothing runs yet"
featured: false
domain: product
context: personal
reviewed: false
fieldNote: "Honest state: three commits, a green gate on an empty package, a research briefing and a decision register. No adapter, no UI, no device. The interesting part so far is what was decided and what was ruled out."
---

## What it is

Software for one home, built instead of installing Home Assistant: lights, LED strips, shutters,
heating, a door lock, door and window sensors and a doorbell, all visible and controllable in a
single app. Every device is mapped onto **one internal device model** (switch, dimmer, colour,
cover, climate, sensor, lock, doorbell); the UI and the rules only ever talk to that model, never
to a vendor protocol. One backend owns the model and the automations, and one installable PWA
serves both a wall-mounted tablet and a phone.

It is a personal system and a portfolio piece, not a Home Assistant replacement for anyone else.
The repository is private, with no remote yet.

**Status: planned.** Phase 0 is done — project scaffold, research on hubs, protocols, shutters,
lock and doorbell, and a design briefing. The design spec and the implementation plan are not
approved yet, so the build backlog is empty on purpose.

## Architecture

Planned, not built. Device protocols are not reimplemented: Zigbee devices come in through
Zigbee2MQTT, Shelly and Nuki speak MQTT natively, and only the Govee lights need an adapter of my
own (their documented LAN API). Everything funnels over an MQTT bus (Mosquitto) into a FastAPI
backend that holds the device model, rules, schedules and notifications. The frontend is React +
TypeScript as an installable PWA, reached remotely over Tailscale. Everything runs in Docker
Compose on a laptop for now, so a later move to a small dedicated machine is a copy, not a port.

## Why it's built this way

- **The brain, not the spinal cord.** If the backend is down, the home must stay usable:
  thermostats keep their on-device schedule, the lock and lights still work through their own
  apps, wall switches still switch. The software adds convenience and is never a single point of
  failure for basic living.
- **Own software above a reused device layer.** Writing radio and protocol stacks would be the
  wrong place to spend effort; the model, the rules and the app are where the work is.
- **Safety first for the lock.** Unlocking is never triggered by an automation, an assistant or
  the autonomous build loop without an explicit human confirmation.
- **No home data in git.** Device IDs, IPs and credentials live in a gitignored runtime folder;
  tests never touch real devices, every adapter sits behind a seam with a fake.

## Implementation

A Python package skeleton with a green gate (pytest and ruff on the empty scaffold), the project
documents, and a decision register with dated entries — for example that Govee ceiling lights are
only taken from the LAN-API panel series because the round models are Matter-only, and that the
old tablet is a wall display only, never the server.

## Trade-offs & what I considered

- **Home Assistant would be faster.** It would, and that was weighed; building the layer above the
  devices myself is the point of the project, and the decision is recorded as closed.
- **Doorbell is undecided.** One option has no official local API and is cloud-bound; another
  offers a local stream without a subscription. The choice is open.
- **Hardware and landlord-dependent parts are open inputs**, such as the Zigbee coordinator
  purchase and anything involving the shutters. Until they are settled the plan starts with
  simulated devices, which the UI would mark as simulated.
