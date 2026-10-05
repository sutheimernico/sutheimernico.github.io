---
title: "Hugin"
order: 3
status: internal
year: "2026"
stack: ["Python", "MCP", "FastAPI", "React", "Claude Code", "Ollama"]
summary: "An agentic OS: a kernel that runs AI agents as supervised processes with PIDs, budgets and capability-gated syscalls, live on screen."
role: "real processes, replayable evidence"
featured: true
github: https://github.com/sutheimernico/hugin
domain: agents
context: personal
reviewed: false
fieldNote: "Five live planner attempts with a local 7B model produced zero completed multi-agent runs — it handed its children 60-second budgets and wrote tool calls as prose. That is why the planner role stays with Claude and Ollama is a worker lane."
---

## What it is

A locally running **agentic operating system**: a Python kernel runs AI agents as supervised
processes — each with a PID, a budget, capabilities, a scheduler slot, IPC and a shared memory —
and a React shell shows every agent, message, tool call and memory write as it happens.
Everything underneath is real: the processes are real `claude -p` subprocesses or real Ollama
tool loops, the syscalls are real MCP tools, and the event log is the only truth — the UI is a
projection of it. Exactly one driver is simulated — a deterministic script driver, so tests and
the offline demo run without a model, always labelled `SIMULATION`. v1 is feature-complete:
30 tasks, finished 2026-09-06.

## Architecture

- **Event sourcing as the spine** — every state change is an immutable event (24 closed kinds,
  each with a pydantic payload), written to the log before it is broadcast. The frontend derives
  its state from nothing else, so replay is the same log folded through the same reducer.
- **Kernel, processes, budgets** — a validated state machine
  (`queued → spawning → running ⇄ waiting_tool → done | failed | killed`), a working directory
  per process, and hard budgets in turns, seconds and output tokens; on overrun a watcher kills
  with `exit_reason="budget:<which>"`.
- **Three interchangeable drivers** behind one protocol: scripted, Claude Code
  (`claude -p --output-format stream-json` as a subprocess), and Ollama, which drives the tool
  loop itself.
- **Syscalls as MCP tools** — seven kernel calls (memory search/write, spawn, send, wait, report,
  artifact write) sit behind a capability check and reach agents over Streamable HTTP at `/mcp`;
  each process authenticates with its own token, issued at spawn.

## Why it's built this way

The cost ceiling is zero, so Claude runs headless on an existing subscription instead of the API:
the kernel strips `ANTHROPIC_API_KEY` from every agent environment and refuses to start the Claude
driver at all if that key sits in its own. The dollar figure the CLI reports is shown as an
"API equivalent", never as a bill — the same rule that shows a missing subsystem in amber instead
of hiding it.

## Implementation

- Largest real run so far: a planner plus three web-searching scouts — 848 events, 51 turns,
  231 s, five memory entries, one `report.md` — committed, like two other runs, as a replayable
  recording that the exporter scrubs of paths.
- Isolation needed a decision (ADR 0002): `--bare` rejects the subscription login, so agents run
  in an isolated config dir with only the credentials symlinked — no user hooks, MCP servers or
  instructions. Measured effect: prompt overhead fell from ~40k to ~6.4k tokens per turn.
- 356 pytest and 234 vitest tests gate the build, and none touch the network, `claude` or Ollama:
  the kernel runs on the scripted driver, subprocesses on a fake factory, Ollama on a mock
  transport.

## Trade-offs & what I considered

- **A 7B model does not orchestrate.** Five live planner attempts with `qwen2.5:7b`: zero
  completed multi-agent runs — 60-second child budgets, tool calls written as prose, or circling
  until the 900-second mission budget killed the run. One single-agent `program:scout` run
  finished cleanly (462 events, 242 s). So Ollama is a worker lane and the planner stays with
  Claude or the simulation (ADR 0003).
- **Tolerance belongs in the kernel, not in the prompt.** The five accommodations for small
  models — string-typed PIDs, a defaulted artifact name, temperature 0, a wider concurrency slot,
  a floor under child budgets — cost nothing when the caller is Claude.
- **No auth, loopback only** — accepted for a single-user tool; and the isolation is only as
  strong as the symlinked credential file it shares.
