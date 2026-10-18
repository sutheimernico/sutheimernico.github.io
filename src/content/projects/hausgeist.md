---
title: "Hausgeist"
order: 27
status: in-progress
year: "2026"
stack: ["Python", "FastAPI", "MQTT", "React", "TypeScript", "Zigbee2MQTT"]
summary: "Self-built smart-home software: one device model, one backend, one PWA for wall tablet and phone. The code runs against a simulator — no real device is connected yet."
role: "design and build, simulator-first"
featured: false
domain: product
context: personal
reviewed: false
fieldNote: "The code runs and has 54 tests, but every device in it is simulated. The Shelly, Zigbee2MQTT and Nuki topic schemas were derived from documentation and have never met hardware, so they are an unverified assumption, not a result."
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

**Status: built against a simulator.** The unified device model, an MQTT bus seam, adapters for
Shelly, Zigbee2MQTT and Nuki, a device simulator, a command API (unlocking only with explicit
confirmation) and a device page exist and are covered by 54 tests. No real device is connected;
the adapters' topic schemas come from vendor documentation and are unverified on hardware.

## Architecture

Device protocols are not reimplemented: Zigbee devices come in through Zigbee2MQTT, Shelly and
Nuki speak MQTT natively, and only the Govee lights need an adapter of my own (their documented
LAN API; not built yet). Everything funnels over an MQTT bus into a FastAPI backend that holds the
device model, rules, schedules and notifications; the bus sits behind a seam, so the simulator and
a real broker are interchangeable. The frontend is React + TypeScript as an installable PWA,
reached remotely over Tailscale. Everything is meant to run in Docker Compose on a laptop first,
so a later move to a small dedicated machine is a copy, not a port.

## Why it's built this way

- **The brain, not the spinal cord.** If the backend is down, the home must stay usable:
  thermostats keep their on-device schedule, the lock and lights still work through their own
  apps, wall switches still switch. The software adds convenience and is never a single point of
  failure for basic living.
- **Own software above a reused device layer.** Writing radio and protocol stacks would be the
  wrong place to spend effort; the model, the rules and the app are where the work is.
- **Safety first for the lock.** Unlocking is never triggered by an automation, an assistant or
  the autonomous build loop without an explicit human confirmation, and the command API enforces
  that.
- **No home data in git.** Device IDs, IPs and credentials live in a gitignored runtime folder;
  tests never touch real devices, every adapter sits behind a seam with a fake.

## Implementation

- **Simulator first, as decided in ADR 0002.** Everything above the bus can be exercised without a
  single device; simulated devices must be labelled as such.
- One device model with typed capabilities; adapters translate vendor topics and payloads into it
  and translate commands back out.
- A decision register with dated entries sits next to the code — for example that Govee ceiling
  lights are only taken from the LAN-API panel series because the round models are Matter-only,
  and that the old tablet is a wall display only, never the server.

## Trade-offs & what I considered

- **Home Assistant would be faster.** It would, and that was weighed; building the layer above the
  devices myself is the point of the project, and the decision is recorded as closed.
- **Simulated is not verified.** The adapters pass their tests against fakes built from the same
  documentation they were written from, so a wrong assumption about a topic or payload would pass
  silently. The first real device is the actual test.
- **Doorbell is undecided.** One option has no official local API and is cloud-bound; another
  offers a local stream without a subscription. The choice is open.
- **Hardware and landlord-dependent parts are open inputs**, such as the Zigbee coordinator
  purchase and anything involving the shutters.
