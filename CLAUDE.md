# Portfolio Website — Nico Sutheimer

Personal portfolio site. Design-first: a distinctive, custom-designed site with deliberate
motion — explicitly NOT generic AI design. Visual quality is the primary success criterion,
code quality the second.

Global personal rules (`~/.claude/CLAUDE.md`) apply. This file restates the project-specific
**working method** and **locked decisions** so they hold every turn. Operational guidance for
the codebase (stack, architecture, how to run/build/add a project) lives in `AGENTS.md` — read
it before touching code.

## Locked decisions (2026-06-13, design refreshed 2026-06-24)

- **Design**: "Kinetic Terminal" — dark warm black + a single phosphor-green accent (refined
  `#45E08A`, not stock neon `#33FF66`). Six switchable accent themes — **phosphor** (default),
  petrol, amethyst, solar, molten, daylight — plus an animated **"Shift" mode** that cross-fades
  through the dark palettes (opt-in since 2026-09-06: its per-frame palette writes cost too much
  next to the ride). **Landing = "Descent"** (Nico's choice 2026-07-02, rebuilt 2026-09-06 after
  the Kinetic-Terminal-only landing was rejected): the scroll-driven camera ride from
  `prototype/descent/variant-b.src.html` (branch `feat/descent-prototype`) with **projects as
  the stations**. Spec: `docs/superpowers/specs/2026-07-02-descent-portfolio-design.md`
  (skill-station level and chambers were NOT built — projects ride directly). Section styling
  below the ride still follows `prototype/variant-shift.html`.
- **Stack**: Astro + React islands + Tailwind v4 + TypeScript. Projects are an Astro content
  collection — adding a project means adding a Markdown file, not editing code (full how-to:
  "Adding a project" below). Each project also gets a detail page at `/projects/<slug>`.
- **Hosting** (revised 2026-07-04, Nico's call in the publish sweep): repo is **PUBLIC** and named
  `sutheimernico.github.io` → GitHub Pages **user site** at the domain root, deployed by
  `.github/workflows/pages.yml` (test → build → Pages) on every push to `main`. Commit emails were
  rewritten to the GitHub noreply address before the flip. Domain path stays:
  free `nico.is-a.dev` → optional `.dev` (~10 €/yr) via CNAME, no build changes needed.
  (Superseded: the 2026-06-13 decision was private repo + Cloudflare Pages — obsolete since the
  other portfolio repos went public anyway and a user site serves from the root.)
- **Content**: Claude drafts projects + bio (grounded in the bekumoo after-sales BI platform
  and `~/private/scouting-rag`), Nico corrects. ML/RAG projects may appear as `in-progress`.
- Plans: `docs/superpowers/plans/2026-06-13-portfolio-site.md` (scaffold + foundation) and
  `2026-06-24-portfolio-prototype-integration.md` (the built site — current source of truth for
  what's implemented; see its `## Implementation Notes`).

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

- Git hosting is **GitHub** (`github.com/sutheimernico`) — use `gh` (installed and authed),
  not `az repos`.
- Never commit directly to `main`. Topic branches `feat/<kebab-case>` / `fix/<kebab-case>` →
  PR into `main`. Conventional commits, English, imperative.
- Code, identifiers, comments, commit messages, docs: English.
- New logic ships with a Vitest test where testable (utils, transforms); visual work is
  browser-verified, not unit-tested for pixels.

## Adding a project (content collection)

Projects are an Astro **content collection** — the single source of truth for every project.
**One Markdown file = one project. Never hardcode a project list in a component.** Adding the
file is all it takes: the same entry automatically powers the scroll **Data Spine** (`#work`),
the **Project Deck** cards (`#projects`), and its own **detail page** at `/projects/<slug>`.
The build validates the front-matter against the zod schema in `src/lib/projectSchema.ts`
(wired into `src/content.config.ts`); a malformed file fails `npm run build` loudly.

**To add a project — create `src/content/projects/<slug>.md`** (the file name is the `<slug>`,
i.e. the URL and the entry id). Fill the front-matter, then write the body as a README:

```markdown
---
title: My New Project              # shown everywhere
order: 5                           # display order, ascending, across spine + deck + index
status: in-progress                # production | in-progress | research | internal
year: "2026"                       # quoted string
stack: ["Python", "FastAPI"]       # tech chips (first 4 shown on cards/rows)
summary: One line shown on the deck card, the spine panel and the index row.
role: what it is to you            # the italic tag line, e.g. "the backbone — bekumoo"
featured: false                    # true = flagship: also in the spine + deck (keep to ~6)
domain: ml                         # agents | ml | data | product — drives the index filter
context: personal                  # personal | work (work = "@ bekumoo" chip in the index)
reviewed: false                    # editorial flag only; Nico flips it after signing off
fieldNote: "One honest finding."   # OPTIONAL — rendered as an aside on the detail page
liveRepo: owner/repo               # OPTIONAL — public repo whose Actions history proves
                                   # the system runs itself; renders the live-proof line
# github: https://github.com/sutheimernico/my-repo   # OPTIONAL — set only when the repo is
                                                      # public; the detail page shows a
                                                      # GitHub button only if present
---

## What it is
A sentence or two on the problem and the outcome.

## Architecture
How it's structured — the moving parts and how they fit.

## Why it's built this way
The rationale: the decisions and what they buy you.

## Implementation
How it was actually built.

## Trade-offs & what I considered
Alternatives weighed, what was deliberately left out, and why.
```

- **`status`** drives the badge: `production`→"Production" (accent), `in-progress`/`research`→
  amber "WIP", `internal`→neutral. Stick to the four enum values or the build fails.
- **`order`** controls position in spine, deck and index (lowest first). Renumber siblings if needed.
  Convention: 1–9 flagships, 10–29 personal breadth, 30+ day-job entries.
- **`featured`** defaults to false. Only flagships opt in — they populate the spine and the deck;
  every project (featured or not) appears in the index table.
- **`domain`** + **`context`** feed the index filter chips and the detail-page meta.
- **`github`** is optional; leave it out until a real public URL exists — never invent one.
- The body is rendered as the detail-page README. The `##` sections above are the house style
  (structure → rationale → implementation → trade-offs), not "how to install".
- Content is **Claude drafts, Nico corrects** (see Locked decisions). Drafts are flagged with
  `reviewed: false` in the front-matter — **never** with a visible marker in the body (the old
  `_(draft — Nico to refine)_` convention rendered on the live site and is abolished). Every
  number in a body must be traceable: list the sources in an HTML comment at the end of the file.
  No invented metrics/KPIs/confidential numbers.
- No component edits, no route edits, no theme work needed — drop the file in and it's live.

## Design quality bar (every UI task)

- Use project skills `frontend-design`, `web-design-guidelines`, `emil-design-eng` for any UI
  work — the taste baseline, not optional.
- Every UI task executes against the locked direction (`prototype/variant-shift.html`) and the
  `## Implementation Notes` in `docs/superpowers/plans/2026-06-24-portfolio-prototype-integration.md`
  (the de-facto design spec until a formal one lands in `docs/superpowers/specs/`).
- Banned: default AI aesthetics — Inter/Roboto/Space Grotesk, stock Tailwind palettes,
  centered-hero-three-cards layouts, purple-gradient-on-dark, gradients as a depth crutch.
  (The **Amethyst** theme is a deliberate, desaturated violet Nico explicitly asked for — not the
  banned neon-purple-gradient cliché; keep it restrained.)
- Motion is part of the system: easing/durations/stagger defined once, reused; prefer CSS where
  it suffices; respect `prefers-reduced-motion`.

## Plan, spec & session docs

- Specs in `docs/superpowers/specs/`, plans in `docs/superpowers/plans/`, named
  `YYYY-MM-DD-<task>.md`. Both committed (private repo).
- Plan first → Nicos Go → implement → append `## Implementation Notes` (built, deviations and
  why, verification evidence).
- Session handoffs in `docs/sessions/`, named `YYYY-MM-DD_HHMM_<topic>.md`.
