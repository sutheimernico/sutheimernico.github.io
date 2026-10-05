---
title: "Factotum"
order: 12
status: in-progress
year: "2026"
stack: ["Python", "Ollama", "Qwen2.5", "Typer"]
summary: "A local-first task assistant: reads Asana and your files, acts only on confirmation, never sends data to a cloud model."
role: "local-first, confirm-then-execute"
featured: false
domain: agents
context: personal
reviewed: false
---

## What it is

A personal task assistant that answers "what should I be doing today?" by reading your Asana
tasks and selected local files, then prioritising them into a single briefing — and that can act
on those tasks, but only after you explicitly confirm each action. The hard constraint that shapes
everything: your content never leaves the machine toward an AI vendor. All the reasoning runs
on-device against a local model. In progress, and deliberately never published.

## Architecture

Four cleanly separated layers:

- **Connectors** — normalised data fetch behind a common interface. The Asana connector reads
  assigned tasks via the REST API (scoped to a workspace/project); the filesystem connector reads
  allowlist-scoped text files with strict containment (no symlink, hardlink, or `..` escapes).
  Both can write, but neither is ever invoked automatically.
- **Core** — pure, testable orchestration with no I/O and no model calls: prioritisation (open
  tasks sorted overdue → today → upcoming → undated) and intent resolution (mapping a user
  reference — a briefing index, a task id, a name fragment — to exactly one task, deterministically).
- **LLM layer** — a thin interface with an Ollama implementation behind it (tests use a fake). The
  model does only bounded language work: summarise, prioritise. It proposes; the code decides.
- **CLI** — a thin entry point: `factotum briefing` (read and render the prioritised list, with a
  "since the last briefing" section on top), `factotum digest` (the same pipeline written to a dated
  Markdown file for the morning) and `factotum do <ref | instruction>` (resolve a write action, show
  the proposal, and run it only after explicit confirmation — it refuses to write at all when
  there's no interactive terminal).

## Why it's built this way

The design splits the work so that the unreliable part never holds the steering wheel. **Code
orchestrates deterministically; the model is a narrow tool**, because a small local model's
hallucinations and prompt-injection risk are unacceptable in something that can complete your
tasks. **Local-only reasoning** is the founding constraint: the only egress is to Asana's own API,
which already holds that data — there are no cloud LLM calls, full stop. And **confirm-then-execute**
means model output can never trigger a side effect on its own; every write is shown and gated. The
cost of all this is honestly accepted: a local model is slower and less capable, so the deterministic
code has to carry the orchestration.

## Implementation

- **Filesystem containment** is enforced with resolved paths and `O_NOFOLLOW`, blocking
  symlink/hardlink/TOCTOU escapes; fetched file content is always treated as data placed in a
  delimited prompt section, never as instructions.
- **Secrets stay out of the repo** (`.env`, gitignored, token held only in memory and never leaked
  in errors).
- **No-egress is enforced, not just promised** — the local-model host is validated to be a
  loopback address, so even a mis-set environment variable can't quietly ship your tasks and files
  to a remote model. The guarantee lives in code, not in a README.
- **What changed since last time.** Each briefing writes a small snapshot of the task list and the
  next one diffs against it: new tasks, newly overdue ones, moved due dates, completed and vanished
  ones. The snapshot holds task names, so it lives outside the repo, owner-only, never committed; a
  corrupt snapshot costs the comparison, never the briefing.
- **Retries only where they are safe.** Reads get exactly one retry on a dropped connection; writes
  get none, because a request that failed in transit may still have been applied, and a blind retry
  could complete a task twice — tests pin that. A throttled request says "rate limit reached"
  instead of a bare HTTP 429.
- A focused test suite (148 tests; fixtures and mocks, zero network dependency) covers connector parsing,
  prioritisation, reference resolution, action dispatch, the local-model summary with its
  deterministic offline fallback, and — importantly — the confirm-gate's refusal to execute
  unconfirmed; the gate is pytest.

## Trade-offs & what I considered

- **Both paths work; v1 is feature-complete behind inputs only I can provide.** The prioritised
  briefing now runs through the local model (with a deterministic fallback when it's offline), and
  the allowlist-scoped filesystem reader is wired in — inert by default until a directory is
  explicitly allowed. What remains is genuinely external: an Entra app for the optional Microsoft
  365 source, and the hosting call (it stays unpublished by design). Honest in-progress, not a
  finished tool.
- **Natural language in, validated structure out.** `factotum do "complete my report"` lets the
  local model map the instruction onto one of the two supported actions — constrained to a strict
  JSON schema and checked against the task list just fetched, so a task id the model did not get
  from that list can never become a proposal. Several plausible matches are shown instead of
  guessed; with the model offline it asks for the explicit form rather than falling back to a
  cloud model. Index, id and name fragment still work without any model.
- **Reusable core, thin front end.** The logic lives independently of the CLI, so a later web UI
  would be a second front end rather than a rewrite — without over-building for it now.
