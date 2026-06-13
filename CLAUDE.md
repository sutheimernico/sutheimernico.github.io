# Portfolio Website — Nico Sutheimer

Personal portfolio site. Design-first: a distinctive, custom-designed site with deliberate
motion — explicitly NOT generic AI design. Visual quality is the primary success criterion,
code quality the second.

Global personal rules (`~/.claude/CLAUDE.md`) apply. This file restates the project-specific
**working method** and **locked decisions** so they hold every turn. Operational guidance for
the codebase (stack, architecture, how to run/build/add a project) lives in `AGENTS.md` — read
it before touching code.

## Locked decisions (2026-06-13)

- **Design**: prototype K "Kinetic Terminal" wins — dark warm black + phosphor-green accent
  (refined `#45E08A`, not stock neon `#33FF66`), six switchable accent themes. Visual source
  of truth: `prototype/variant-k.html` (throwaway, on branch `feat/design-prototypes`).
- **Stack**: Astro + React islands + Tailwind v4 + TypeScript. Projects as Astro content
  collections — adding a project means adding a Markdown file, not editing code.
- **Hosting**: repo stays **PRIVATE** → GitHub Pages is NOT free for private repos. Deploy on
  **Cloudflare Pages** (free, private-repo-friendly, no non-commercial clause). Domain path:
  `*.pages.dev` → free `nico.is-a.dev` → optional `.dev` (~10 €/yr, Cloudflare Registrar).
  **Never make the repo public without asking** — Nico chose private deliberately.
- **Content**: Claude drafts projects + bio (grounded in the bekumoo after-sales BI platform
  and `~/private/scouting-rag`), Nico corrects. ML/RAG projects may appear as `in-progress`.
- Full plan: `docs/superpowers/plans/2026-06-13-portfolio-site.md`.

## Wie Claude hier arbeitet

- **Orchestrierung**: Read / Recherche / Review / Sweeps → an Subagents delegieren (nur die
  Konklusion zurück, keine Roh-Dumps). Write / Build mit Abhängigkeiten → single-threaded
  inline, nicht fan-outen. Nur substanzielle Arbeit orchestrieren; Triviales inline.
- **Flow**: Trivial → direkt. Sonst Superpowers-Flow: `brainstorming` (unklarer Scope) →
  `writing-plans` (Plan vorlegen, auf Nicos Go warten) → **`subagent-driven-development`**
  (frischer Subagent pro Plan-Task, Review zwischen den Tasks) → `verification-before-completion`
  als Gate vor jeder Fertig-Meldung.
- **Review-Gates pro UI-Schritt**: nach jedem Umsetzungsschritt `design-reviewer` (visuelle
  Qualität, Motion, Spec-Treue) + globaler `frontend-reviewer` (React/TS-Korrektheit, a11y) auf
  den Diff; Funde sofort beheben.
- **Self-Review iterativ**: eigenen Diff nach jedem Arbeitsschritt kritisch gegenlesen
  (Korrektheit, Einfachheit, Repo-Konventionen) — nicht erst vor dem PR.
- **Verifikation**: visuelle Arbeit im Browser prüfen (`run`/`verify`), nicht pixelweise
  unit-testen; pure Logik (Kinetic-Mathe, Themes, Scroll, Content-Schema) per Vitest.

## Conventions

- Git hosting is **GitHub** (`github.com/sutheimernico`) — use `gh` (not installed yet; SSH
  push works), not `az repos`.
- Never commit directly to `main`. Topic branches `feat/<kebab-case>` / `fix/<kebab-case>` →
  PR into `main`. Conventional commits, English, imperative.
- Code, identifiers, comments, commit messages, docs: English.
- New logic ships with a Vitest test where testable (utils, transforms); visual work is
  browser-verified, not unit-tested for pixels.

## Design quality bar (every UI task)

- Use project skills `frontend-design`, `web-design-guidelines`, `emil-design-eng` for any UI
  work — the taste baseline, not optional.
- Every UI task executes against the locked direction (variant K) and, once written, the design
  spec in `docs/superpowers/specs/`.
- Banned: default AI aesthetics — Inter/Roboto/Space Grotesk, stock Tailwind palettes,
  centered-hero-three-cards layouts, purple-gradient-on-dark, gradients as a depth crutch.
- Motion is part of the system: easing/durations/stagger defined once, reused; prefer CSS where
  it suffices; respect `prefers-reduced-motion`.

## Plan, spec & session docs

- Specs in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`, named
  `YYYY-MM-DD-<task>.md`. Both committed (private repo).
- Plan first → Nicos Go → implement → append `## Implementation Notes` (built, deviations and
  why, verification evidence).
- Session handoffs in `docs/sessions/`, named `YYYY-MM-DD_HHMM_<topic>.md`.
