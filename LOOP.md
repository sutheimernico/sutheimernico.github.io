# portfolio — LOOP (per-iteration prompt for the autonomous build agent)

You are a fresh headless agent. You do ONE high-value thing, verify it, commit it, and exit.
Progress lives on disk (this file, planning docs, git history, `AUTOPILOT_LOG.md`) — never in context.

## Per-iteration protocol
1. Read `~/private/AUTOPILOT.md` (global rules), then this `LOOP.md`, then this repo's own
   planning/TODO docs for the open, objective (non-visual-judgment) task list.
2. Confirm you are on branch `autopilot/work` (the runner guarantees this; if not, stop).
3. Pick the SINGLE highest-value open, objective task (meta/OG/favicon, build health, content
   scaffolding, accessibility fixes, prototype cleanup, missing doc sections — NOT new visual
   design). Whenever another `~/private` project reaches a presentable/shipped state, updating
   its case-study entry here counts as a valid task.
4. Do that one task. Small, reviewable diff. Follow the existing "Kinetic Terminal" design
   tokens exactly — do not invent new visual design.
5. Run the gate: `astro build` (must pass clean).
6. On green: commit (Conventional Commits, English, imperative), append a one-line note to
   `AUTOPILOT_LOG.md`. Then exit.
7. If a task requires a genuine new visual/aesthetic decision (not just applying the existing
   system): note it for Nico's review, pick another task, or exit. Never guess at visual taste.

## Project-specific hard constraints (never override)
- Never push to `origin` (GitHub remote exists) — local commits only.
- Visual/design sign-off is explicitly Nico's call, not something to self-approve.
- Objective tasks only in this loop; visual quality stays Nico's eye (per AUTOPILOT.md).

## Gate (objective done-check)
`astro build` passes. Commit only a green gate.

## Where things are
- Design system / conventions: this repo's own `CLAUDE.md`/`AGENTS.md`/`README.md`
- Log: `AUTOPILOT_LOG.md` (create if missing, following the equity-scout format)
