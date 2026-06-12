# Portfolio Website — Nico Sutheimer

Personal portfolio site. Design-first project: the goal is a distinctive, custom-designed
site with deliberate animations — explicitly NOT generic AI design. Visual quality is the
primary success criterion, code quality the second.

## Status & open decisions

- **Stack**: not decided yet — to be settled in the first spec (`docs/superpowers/specs/`).
  Candidate default: Astro or Next.js static export + React + Tailwind + Motion/GSAP.
- **Design direction**: not decided yet — to be locked in a design spec before any UI code
  (visual direction, typography pairing, color system, motion language). Nico provides
  inspiration references; prototype 2–3 radically different variants before committing.
- **Deploy**: GitHub (like scouting-rag, NOT Azure DevOps). Target: GitHub Pages via
  GitHub Actions — finalize together with the stack decision.

## Conventions

- Git hosting is **GitHub** (`github.com/sutheimernico`) — use `gh`, not `az repos`.
- Never commit directly to `main`. Topic branches `feat/<kebab-case>` / `fix/<kebab-case>`
  → PR into `main`. Conventional commits, English, imperative.
- Code, identifiers, comments, commit messages, docs: English.
- New logic ships with tests where testable (utilities, data transforms); visual work is
  verified in the browser instead (`run`/`verify` skills), not unit-tested for pixels.

## Design quality bar (applies to every UI task)

- Use the project skills `frontend-design`, `web-design-guidelines`, and `emil-design-eng`
  for any UI/design work — they are the taste baseline, not optional.
- Every UI task executes against the locked design direction in the current design spec.
  No spec → no UI code; run brainstorming first.
- Banned: default AI aesthetics — Inter/Roboto/Space Grotesk, stock Tailwind palettes,
  centered-hero-three-feature-cards layouts, purple-gradient-on-dark clichés.
- Motion is part of the design system: define easing, duration scale, and stagger patterns
  once in the spec, reuse everywhere. Prefer CSS-only where it suffices; respect
  `prefers-reduced-motion`.

## Plan & implementation docs (every code task)

- Specs in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`,
  named `YYYY-MM-DD-<task>.md`. Both are committed (private repo).
- Workflow: brainstorm if scope is unclear → write plan → wait for Nico's approval
  → implement → append `## Implementation Notes` to the plan (what was built,
  deviations and why, verification evidence).
- Scale the doc to the task: small fix = a few lines of plan + outcome.
- Session handoffs in `docs/sessions/`, named `YYYY-MM-DD_HHMM_<topic>.md`.

## Subagents & review

- After each UI implementation step: project agent `design-reviewer` (visual quality,
  motion, distinctiveness) and global `frontend-reviewer` (React/TS correctness, a11y).
- Read/research/sweeps → delegate to subagents; build steps with dependencies →
  single-threaded inline.
