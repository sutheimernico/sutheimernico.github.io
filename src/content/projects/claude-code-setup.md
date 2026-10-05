---
title: "Agentic Engineering Toolkit"
order: 32
status: internal
year: "2026"
stack: ["Claude Code", "Skills", "Hooks", "Python", "Azure DevOps"]
summary: "The AI-assistant skills, subagents and hooks that encode how work actually gets done on the bekumoo data platform — PRs, migrations, tickets, handoffs."
role: "the team's workflow, made executable"
featured: false
domain: agents
context: work
reviewed: false
fieldNote: "An assistant that knows the repository map, the PR rules and the migration routine stops being a chat window and starts being a colleague who has read the wiki. The hard part is writing the wiki so precisely that it can be followed without asking."
---

## What it is

A growing set of **skills, subagents and hooks** for the AI coding assistant I use every day at
bekumoo. Instead of re-explaining the platform in every session, the conventions live as
executable instructions: how a data product travels through four repositories, how a database
migration is created and verified, how a pull request is opened against the right branch, how
a ticket is checked against what the code actually does. It started as my own productivity
tooling and is the most concrete form of "AI integration" in my day job: not a model in a
product, but a model wired into the engineering workflow with guardrails.

## Architecture

- **Skills** — guided, step-by-step workflows the assistant loads on demand: a data-product
  workflow (see the delivery-chain entry), a migration workflow, a pull-request workflow for
  Azure DevOps with per-repository target branches and a review gate, a reconciliation
  workflow that compares a tracked task with plan documents, branches and pull-request state.
- **Subagents** — narrow reviewers (API design, frontend, security) that run against a diff and
  return findings, so the review pass is a fresh pair of eyes rather than the same context that
  wrote the code.
- **Hooks** — deterministic code around the model: a session-start hook that syncs every
  repository (fast-forward only, fetch-only when dirty) and reports what changed; a pre-push
  secret scan; permission rules that keep the assistant out of anything that costs money or
  touches production.
- **Journaling** — an end-of-day handoff that aggregates a working day's sessions into one
  document, and a morning briefing that reads it back together with calendar, tasks and repo
  state.

## Why it's built this way

The reliability of an assistant is mostly the reliability of its instructions. Skills are
written the way a good runbook is written — what to check, in which order, what "done" means —
because a vague skill produces a confident wrong answer. Hooks carry everything that must
happen every time regardless of what the model thinks: syncing, scanning, permission
boundaries. The model proposes; the hooks and the review gate decide. This is the same split I
use in the personal projects (deterministic code around a narrow model), applied to my own
workday.

## Implementation

- Skills are Markdown with explicit triggers, preconditions, and acceptance checks; the
  assistant is told when to prefer which skill when several overlap (create a PR vs. review a
  PR vs. review a working tree).
- The reconciliation skill treats "is this ticket done?" as an audit, not a yes/no question:
  it lists what the ticket asked for and what the repository state shows, and names the gaps.
- Hooks are small shell and Python scripts with no dependency on the model; they fail closed.
- Everything is versioned; the rules that turned out to matter are promoted from session
  notes into project instructions so they hold in every future session.

## Trade-offs & what I considered

- **Adoption starts with one person.** The toolkit encodes my workflow first; making it the
  team's means agreeing on the runbook, which is a people problem before it is a tooling one.
- **Instructions drift.** A skill written against last month's repository layout quietly goes
  stale; the session-start hook and the handoff journal exist partly to catch that.
- **Internal by nature.** Repository names, branch rules and identifiers stay inside the
  company; the public equivalent of this thinking is the agentic OS and the task assistant
  among the personal projects.

<!-- sources: the skills, agents and hooks Nico has built for his bekumoo working setup
(their names and descriptions as loaded in his assistant configuration: endpoint workflow,
migration workflow, PR workflow, task reconciliation, daily handoff/onboard, repo-sync and
secret-scan hooks, reviewer subagents). No internal repository was read; no identifiers,
branch names or people are mentioned. Nico must vet for confidentiality before merge. -->
