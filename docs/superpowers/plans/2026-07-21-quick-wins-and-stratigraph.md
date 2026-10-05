# Plan: Quick Wins + Stratigraph Build — portfolio

**Date:** 2026-07-21 · **Status:** awaiting go · **Executor:** any capable agent (self-contained — no session context required)
**Before any UI work: load the repo's own skills** (`.claude/skills`: `emil-design-eng`, `frontend-design`, `web-design-guidelines`) — they encode the design bar this site is held to.

> **Supersession note (2026-09-06):** Stage A of this plan was superseded by
> `2026-08-30-ai-engineer-repositioning.md` and executed on branch `feat/v2-motion-and-projects`
> (see its Implementation Notes): Tasks 1–6 are done in revised form (Task 5 as the `LiveProof`
> island + `liveRepo` field; Task 6 covers far more projects), Task 7 (Field Notes collection)
> was descoped in favour of a per-project `fieldNote`. Stage B (Stratigraph) remains open and
> needs its own go.

## Context (verified 2026-07-21 by code review + live-site check)

Live at https://sutheimernico.github.io (Astro 6 SSG + React 19 islands + Tailwind v4, TS strict). Projects are a content collection (`src/content/projects/*.md`, zod schema in `src/lib/projectSchema.ts`) — one markdown file per project drives Data Spine, Project Deck and `/projects/<slug>`. Deploy: `.github/workflows/pages.yml` on push to `main` (npm test → build → Pages). Current local branch `feat/descent-prototype` holds 3 unpushed commits (prototype/docs only, 0 lines in `src/`).

**Live problems (visible to every recruiter today):**
- `src/components/AboutSection.astro` (~line 17–19) renders the literal text "— prototype copy, grounded but placeholder" on the production site.
- Detail pages `src/pages/projects/[slug].astro` lack `Nav`/`ThemeSwitcher` — theme/navigation continuity breaks one click deep.
- `public/og.svg` is the `og:image` (`src/layouts/Base.astro:17,39`) — LinkedIn/X/Slack unfurlers don't render SVG; previews will be broken exactly when Nico posts his LinkedIn link.
- CI has no `pull_request` trigger — tests run only after merge.
- The strongest proof in the whole portfolio — grid-scout demonstrably operating itself every 3h in public — is prose on slot 2/8 of a carousel; invisible in the 30-second scan.
- 7+ finished projects (planet-hopper, ml-lab ×3, estate-scout, face-scout, scouting-rag…) have no content file at all; the site shows a fraction of the real shipping velocity.

**The decided-but-unbuilt redesign:** On 2026-07-07, six pitch prototypes were compared; winner = **"01 Stratigraph"** — but the verdict lives only in `prototype/pitches/BRIEFS.md` (+ visual reference `prototype/pitches/01-stratigraph.html`, 1,492 lines self-contained). The official spec (`docs/superpowers/specs/2026-07-02-descent-portfolio-design.md`) still describes the older "Descent" iteration; no implementation plan, no `skills: string[]` schema field, no chamber route exists. Core idea: the landing page becomes a scroll-driven camera dolly through tech-stack strata (SURFACE/UI → API → PIPELINE/dbt → WAREHOUSE/SQL → BEDROCK/INFRA) with a HUD depth readout; skill stations (Data & BI, Data Scientist, ML, AI, Fullstack) sit at their native depth; three levels: Ride → Skill Chamber → Project Detail; `skills[]` on each project drives the mapping automatically.

## Goal

Two independently shippable stages: **(A)** kill every live trust-breaker and surface the live-operation proof — small PRs, land this week; **(B)** execute the Stratigraph rebuild the site has been waiting on for two weeks — spec rewrite first, then build, behind the same zero-friction content model.

## Execution rules

- Public repo + live site: every stage lands via PR (`gh`), never direct to `main`; merge = deploy, so each PR must leave the site shippable. Branches: `fix/quick-wins-*`, `feat/stratigraph-*`. Conventional Commits, English. Site copy stays English (established site language).
- Gates: `npm test && npm run build` locally before every PR (CI gains the PR trigger in Task 3 — until then local gates are the only pre-merge check).
- Content honesty: never invent metrics, quotes, or project claims; drafts that need Nico's voice are marked `_(draft — Nico to refine)_` (existing repo convention) — but **no visible placeholder markers on the rendered page** ever again (that's what Task 1 fixes; drafts are flagged in frontmatter/comments, not in rendered copy).
- The existing `feat/descent-prototype` branch (3 local commits, prototype/docs only): leave untouched; Stage B cherry-picks nothing from it — the prototype HTML is reference material, not source.

---

## Stage A — Quick wins (one or two small PRs)

### Task 1: Remove the live placeholder marker
**Files:** `src/components/AboutSection.astro`.
Delete the rendered "— prototype copy, grounded but placeholder" fragment. Keep the current bio text (it is grounded); move the draft flag into a code comment + frontmatter note. The bio rewrite itself stays Needs Nico.
**Accept:** string absent from built HTML (`grep` on `dist/`); page renders cleanly.

### Task 2: Detail-page chrome
**Files:** `src/pages/projects/[slug].astro` (pattern from `src/pages/index.astro`).
Add `<Nav />` and `<ThemeSwitcher client:idle />`. Verify theme persistence across index → detail → back.
**Accept:** manual check across 2 themes and both directions; no layout shift on detail pages.

### Task 3: CI gate on PRs
**Files:** `.github/workflows/pages.yml` (or a split `ci.yml`).
Add `pull_request` trigger running test+build only (no deploy). Keep deploy on `main` push unchanged.
**Accept:** PR for this very change shows the check running.

### Task 4: Raster OG image
**Files:** `public/og.png` (1200×630), `src/layouts/Base.astro`.
Render the existing `og.svg` design to PNG (one-off: `npx @resvg/resvg-js`/`sharp` script under `scripts/`, committed for regeneration). Point `og:image` at the PNG (absolute URL), keep SVG as favicon-ish asset if referenced elsewhere.
**Accept:** OG tags reference the PNG; dimensions correct; verified with a local unfurl-preview tool or manual meta inspection.

### Task 5: Flagship placement + live-operation proof
**Files:** `src/content/projects/grid-scout.md` (order/featured), the deck/spine components as minimally as possible, one new small island `src/components/LiveProof.tsx`.
- grid-scout to position 1 with featured visual weight (the schema already has `order` + `featured`).
- `LiveProof` island (client:idle): fetch the public GitHub API for the grid-scout pipeline workflow's latest run (`/repos/sutheimernico/grid-scout/actions/workflows/…/runs?per_page=1`, unauthenticated — fine at this traffic) and render "Self-operating pipeline · last run: 2h ago ✓" on the grid-scout card/hero area. **Honest failure mode:** on rate-limit/error render the static fact ("runs every 3h since 2026-07-04") — never a fake timestamp. No key, no backend.
**Accept:** vitest for the formatting + fallback logic (fetch mocked); visual check; API failure path shows the static line.

### Task 6: Content files for the missing finished projects
**Files:** new `src/content/projects/*.md` — `planet-hopper.md`, `ml-lab.md` (one entry covering the three showdowns), `estate-scout.md`, `face-scout.md`, `scouting-rag.md`.
Write them from the projects' actual READMEs (honest status values: `research`/`in-progress`/`private`; GitHub links only where public today). Summaries in the site's established voice; bodies distilled from real project docs — no invented numbers. Mark each as draft-for-Nico in frontmatter comments.
**Accept:** deck/spine render all entries correctly; every claim traceable to the source repo's README; Nico's PR review is the content gate.

### Task 7: Field Notes (small)
**Files:** new content collection `src/content/notes/` + zod schema, list page `/notes`, two seed notes.
Two short technical notes distilled from **existing** project prose (the grid-scout leakage-perturbation test; the honestly-flagged interval calibration). Minimal styling consistent with the site; linked from Nav.
**Accept:** build green; notes readable on mobile; each note links its source project.

---

## Stage B — Stratigraph (the decided rebuild)

### Task 8: Spec rewrite first
**Files:** `docs/superpowers/specs/2026-07-02-descent-portfolio-design.md` → update in place (append a dated revision section, don't rewrite history), sourcing the verdict from `prototype/pitches/BRIEFS.md` and the visual reference from `prototype/pitches/01-stratigraph.html`.
Pin down: strata list + depth mapping, HUD spec ("DEPTH 0212M · API LAYER · STN 02"), skill stations (Data & BI, Data Scientist, ML Engineer, AI Engineer, Fullstack) with their depths, three-level navigation (Ride → Chamber → Detail), `skills: string[]` semantics, perf-mode + `prefers-reduced-motion` behavior (static stratified layout, no dolly), and the open tagline question (**default until Nico decides: keep "I turn raw data into decisions"** — documented as revisitable, not blocking).
**Accept:** spec is self-sufficient for the build tasks below; BRIEFS.md verdict referenced, not duplicated.

### Task 9: Schema + skill config
**Files:** `src/lib/projectSchema.ts` (`skills: z.array(z.string()).default([])` with an enum of the five station ids), `src/lib/skills.ts` (station metadata: id, label, depth, blurb), all `src/content/projects/*.md` (tag each project's skills honestly — a project may map to several).
**Accept:** typecheck green; every project tagged; unknown skill id fails the build loudly.

### Task 10: The Ride
**Files:** new `src/components/stratigraph/` (Ride island, HUD, strata backdrop), `src/pages/index.astro` restructure.
Scroll-driven dolly through the strata with HUD depth readout; skill stations at their depths, each station listing its project count and leading to its chamber. Follow the prototype's visual language but implement idiomatically (Tailwind v4 tokens, existing theme system — all 6 themes must work). Perf mode: heuristic (`prefers-reduced-motion`, `navigator.hardwareConcurrency`, save-data) switches to the static layered layout; user-visible toggle in the HUD. Keep bundle honest: no new heavy deps (no GSAP/three — IntersectionObserver + rAF + CSS transforms suffice; the reference prototype proves it in vanilla).
**Accept:** vitest on the depth/progress math (pure functions); smooth on reduced settings; all sections (About/Contact) still reachable; Lighthouse-relevant basics hold (no CLS from the dolly).

### Task 11: Skill Chambers
**Files:** `src/pages/skills/[station].astro` + chamber components.
Per-station page: blurb, project cards filtered by `skills[]` (honest status badges), link into existing detail pages. View Transitions between Ride → Chamber → Detail (Astro's built-in — degrade gracefully where unsupported).
**Accept:** every station has ≥1 real project; navigation loop Ride↔Chamber↔Detail with preserved theme; keyboard navigable.

### Task 12: Cutover + a11y/QA pass
**Files:** index composition, Nav, README, screenshots.
Old linear sections that Stratigraph replaces get removed or folded in (About/Contact stay); run the `web-design-guidelines` skill checklist over the new surfaces; cross-theme sweep (6 themes × light/dark behaviors), mobile pass, `npm test && npm run build`.
**Accept:** no dead Nav links, no orphaned components (grep imports), a11y checklist findings fixed or documented; PR includes before/after screenshots for Nico's review.

---

## Verification before completion
1. Per stage: `npm test && npm run build` + local preview pass; Stage B additionally the a11y/QA sweep (Task 12).
2. Live checks after each merge: placeholder string gone, OG unfurl works, LiveProof renders real data, detail-page chrome present.
3. Append an **Outcome** section here per stage: shipped PRs, deviations, screenshots list, open items.

## Needs Nico (not agent-executable)
- Go per stage (A can ship this week; B is a multi-session build — sequence them A → B).
- PR reviews (public live site — his voice, his face to the world).
- Content pass: bio text, LinkedIn URL (replaces "(soon)"), tagline decision (default stands until then), veto/edit of the new project entries and field notes.
- Publish decisions for currently-private projects (ml-lab, planet-hopper, estate-scout…) — separate publish-checklist runs per repo; until then their entries stay linkless.
