# Portfolio Website

Personal portfolio site of Nico Sutheimer. Design-first: distinctive visual direction
("Kinetic Terminal" — dark warm black + phosphor-green accent, six switchable themes plus
an animated "Shift" mode), deliberate motion design, no generic template aesthetics.

## Status

Live at **https://sutheimernico.github.io/** — Astro + React islands landing page (cold boot,
hero, scroll-driven data spine, project deck, skill constellation, about/contact) plus a
per-project detail page at `/projects/<slug>`. Projects are an `astro:content` collection —
see `CLAUDE.md` → "Adding a project" for the how-to. Still open: visual/motion browser
verification pass and Nico's content pass (bio prose, LinkedIn handle).

## Stack

Astro 6 + React 19 islands + Tailwind v4 + TypeScript (strict) + Vitest. See `AGENTS.md` for
architecture, run/build/test commands, and where things live.

## Repo layout

```
src/
├── components/     # .astro shells + .tsx islands (see AGENTS.md)
├── content/        # projects content collection (one Markdown file = one project)
├── lib/            # framework-agnostic, unit-tested logic (themes, shift, scroll, ...)
├── pages/          # routes (index, /projects/[slug], 404)
└── styles/         # global.css — CSS custom-property design tokens per theme
prototype/          # variant-shift.html — the visual source of truth, ported not reinvented
docs/
├── superpowers/
│   ├── specs/      # design + feature specs (committed)
│   └── plans/      # implementation plans with appended Implementation Notes
└── sessions/       # session handoff docs
.claude/
├── agents/         # project subagents (design-reviewer)
└── skills/         # project-local design skills
```

## Deploy

GitHub Pages user site: the repo is **public** (decision revised 2026-07-04) and named
`sutheimernico.github.io`, so the site serves from the domain root. `.github/workflows/pages.yml`
runs tests, builds, and publishes on every push to `main`. A custom domain (`nico.is-a.dev` or a
paid `.dev`) can be layered on later via CNAME without touching the build.
