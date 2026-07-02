# Descent — portfolio redesign design spec

**Date:** 2026-07-02
**Status:** draft — awaiting Nico's review
**Supersedes visual direction of:** the current landing (Hero / DataSpine / ProjectDeck / About /
Contact stack). The `docs/superpowers/plans/2026-06-24-portfolio-prototype-integration.md` remains the
record of the *current* implementation; this spec defines what replaces its landing composition.

---

## 1. Context & locked direction

Nico reviewed three throwaway prototypes (A: current design optimized, B: "Descent" — a scroll-driven
3D camera ride in the Kinetic Terminal identity, C: "Lightfield" — a free-identity WebGL world) and
**chose variant B (Descent)**. Smoothness was iterated on the prototype (blur/paint removal, camera
Z-impulse crash-zoom, panel-fade-before-pass, grain drop) and approved.

Descent keeps the **locked Kinetic Terminal identity** — warm near-black `#0E0F0D`, phosphor green
`#45E08A`, Martian Mono display / IBM Plex Mono body, terminal chrome — and expresses it as **one
continuous scroll-driven camera dolly** through a 3D space: hero → skill stations at successive
depths (each nesting the projects that demonstrate it) → contact terminal, with a fixed HUD "depth
gauge" reading the camera position like an instrument.

The six accent themes + Shift mode from the current site are **retained** (theme switching stays).

## 2. What Nico asked for (this round)

1. **Hero role** is no longer the static "Data & BI Engineer". It anchors on **Fullstack Engineer**
   and **rotates through additional role hats** (ML Engineer, AI Engineer, Data Scientist, …) to
   signal breadth — "I can do a bit of everything".
2. **Skill-first, three-level structure.** What you scroll past in the ride are the **skills / roles**
   (ML Engineer, AI Engineer, Data Scientist, Fullstack Engineer, Data & BI Engineer) — **not** a flat
   project list. **Click a skill → one level deeper: the projects that demonstrate that skill**, each
   with a one-line description. **Click a project → a detail page** with the fuller write-up (what it
   is, how it's built, why) plus a **GitHub link**. Skills are the spine of the site; projects are the
   evidence hung under each skill.
3. **Auto-add:** creating a new project should add it **automatically** under the right skill(s) —
   ride + detail page — without touching component code.

### Positioning note (flagged, Nico decides)

Presenting "Fullstack / ML / AI / Data Scientist" all at once risks reading as overclaiming to senior
engineers/recruiters, given Nico's real profile (strong in data/BI/SQL/Python/Azure; frontend/React
and ML/RAG are growth areas). **Resolution adopted here:** the rotating roles are *substantiated by
real projects in the ride* — the ML/AI hats are backed by the RAG / signal-trader projects, which may
carry an honest `in-progress` / `research` badge. Breadth claimed **and** shown. Exact role labels are
draft (§5) for Nico to correct at review.

## 3. Scope

**In scope**

- Rebuild the **landing** as the Descent ride, **content-driven** from the existing `projects`
  collection (no hardcoded project list).
- Hero **role rotation**.
- Wire ride panels as **links into the existing detail pages**; morph the transition.
- Fix the detail-page gaps the review found (missing nav / theme switcher / entrance).
- A **performance mode** so the ride stays smooth on weak laptop GPUs.

**Reused as-is (already built, no rework beyond noted fixes)**

- The `projects` **content collection** + zod schema (`src/lib/projectSchema.ts`) — reused; the only
  addition is a `skills: string[]` tag (§7).
- The **detail page** route `src/pages/projects/[slug].astro` — already renders the markdown body as
  the write-up, with badge/year/stack/role and a GitHub button shown only when `github` is set.
- Theme system (`themes.ts`, `shift.ts`, `ThemeSwitcher`).

**Out of scope**

- No GitHub-repo auto-sync (see §7 — rejected in favor of the file workflow).
- No new content beyond wiring; project prose stays "Claude drafts, Nico corrects".
- Variants A and C are discarded (throwaway prototypes).

## 4. Information architecture

**Three levels**, skill-first, mapped onto the ride:

```
LANDING — the Descent ride (SKILLS)        SKILL → its projects        PROJECT detail
┌──────────────────────────────────┐       ┌─────────────────────┐     ┌────────────────────┐
│ STN 00  Hero: name + role cycle   │       │ projects that show  │     │ /projects/<slug>   │
│ ────────────────────────────────  │ click │ this skill, each a  │clic │ badge·year·title·  │
│ SKILL stations you dolly past:    │ skill │ one-liner + badge:  │ k   │ role·stack·GitHub  │
│   Data & BI Engineer              │ ────▶ │  · After-Sales BI   │ ──▶ │ ── write-up ────   │
│   Data Scientist                  │       │  · Data Quality …   │     │ what/architecture/ │
│   ML Engineer                     │       │ (a project can sit  │     │ why/implementation/│
│   AI Engineer                     │       │  under >1 skill)    │     │ trade-offs         │
│   Fullstack Engineer              │       └─────────────────────┘     └────────────────────┘
│ ────────────────────────────────  │        ← back to skill            ← back to work
│ STN nn  Contact terminal          │
└──────────────────────────────────┘
```

The ride **is** the skills level: the stations a visitor dollies past are the skills/roles. Each skill,
when opened, reveals the **projects that demonstrate it** (a project may appear under several skills —
Equity Scout under both Data Scientist and ML Engineer, etc.). Each project then opens its detail page.
The hero's rotating role line is the teaser; the ride is the walk through those same roles, each backed
by real work — breadth claimed **and** shown.

**How the skill → projects level is presented** (confirmed by Nico): a **dedicated deeper view per
skill** — a "skill chamber". Clicking/activating a skill station triggers a cinematic dive (the ride
recedes, the chamber comes forward) into a focused view of that skill's projects shown as cards. It is
its own routed state (`#/skill/<slug>`), not an inline expand — descending a level is explicit and
felt. Three levels total: ride (skills) → skill chamber (its projects) → project detail.

## 5. Hero & role rotation

- **Name** "NICO SUTHEIMER" (unchanged treatment: giant display type the camera dollies through).
- **Role line** replaces the static eyebrow with a **rotating role**, terminal-style (type-in / swap
  on a cursor, respecting the existing easing tokens). Anchor role shown first: **Fullstack Engineer**.
- **Draft role set** (Nico to correct): `Fullstack Engineer` · `Data & BI Engineer` · `ML Engineer` ·
  `AI Engineer` · `Data Scientist`. Order and membership are his call. **These same roles are the ride's
  skill stations** (§6) — the hero cycles them, the ride walks through them one by one.
- **Tagline:** current "I turn raw data into decisions." is data-centric and slightly undercuts the
  breadth message. Draft alternative to consider (Nico corrects): keep it, or broaden to something
  like _"I build the systems between raw data and the decision."_ — marked `_(draft — Nico to refine)_`.
- **Reduced motion / no-JS:** role line shows the anchor role (or a static comma-separated list); no
  rotation.

## 6. The ride as skills, with projects nested under them

- **Stations = skills.** The ride's panels are the skills/roles, generated from a small **skills config**
  (§7), each rendered as a terminal-style station: big skill name (display font), a one-line competency
  description, a `~/skills/<slug>` eyebrow, index `NN / total` (total = number of skills), and — nested
  and visually subordinate beneath a divider — the **projects that demonstrate it** as compact rows
  (project title + status badge + `summary` one-liner), each row a link into `/projects/<slug>`.
- **Projects are grouped under skills** by a `skills` tag on each project (§7). A project appears under
  every skill it lists. Within a skill, projects sort production-first, then by `order`.
- **Skill order** is curated in the skills config (draft: Data & BI Engineer → Data Scientist →
  ML Engineer → AI Engineer → Fullstack Engineer). Anchor skill (Fullstack) leads the hero rotation;
  ride order is separately curated.
- **Keyboard/AT access:** skill stations and the nested project rows are focusable; project rows are
  real `<a>` links; the reduced-motion flat fallback lists every skill with its projects as links.
- **Motion carries over from the approved prototype**, incl. the perf fixes in §9.

## 7. Content model & auto-add workflow

**Decision (Claude's call, as delegated): file-based content collection — extends the existing one.**

Two pieces:

1. **A small `skills` config** — the ride's stations. Each skill: `slug`, `name`, one-line `blurb`,
   `order`. This is a short curated list (skills change rarely), e.g. a `src/content/skills/` collection
   or a typed `src/lib/skills.ts`. Adding/renaming a skill = edit this one place.

2. **Projects gain a `skills` tag** (schema addition to `projectSchema.ts`): `skills: string[]` — the
   slugs of the skills a project demonstrates. This is the only schema change; it's what nests a
   project under its skill station(s).

Adding a project is still one action: **create `src/content/projects/<slug>.md`** with front-matter
(validated by zod) and a markdown body. Its `skills` tag slots it under the right skill station(s)
automatically; the same entry powers its `/projects/<slug>` detail page — **no component or route
edits**. Adding a project under an existing skill needs no config change at all.

```yaml
title: My New Project
order: 5                    # position within its skill group (production-first, then order)
status: in-progress         # production | in-progress | research | internal → badge + ordering
year: "2026"
stack: ["Python", "FastAPI"]
skills: ["ml-engineer", "ai-engineer"]   # NEW — which skill station(s) this sits under
summary: One line shown on the project row under each skill.
role: what it is to you      # the italic tag line
featured: true               # include on the landing ride
# github: https://github.com/sutheimernico/my-repo   # OPTIONAL — detail page shows the button only if set
```

Body = the detail write-up, house style: `## What it is` / `## Architecture` /
`## Why it's built this way` / `## Implementation` / `## Trade-offs & what I considered`.

**Why not GitHub auto-sync** (the option Nico floated): the detailed how/why write-up cannot be
auto-generated meaningfully — it is the point of the detail page and must be hand-written. Auto-sync
would also require a build-time token, selective exposure of private-repo metadata onto a public page,
and a mechanism to choose which repos appear. The file workflow already gives the "make a project → it
appears" outcome without those liabilities. A private repo simply needs one short markdown file when
Nico wants it on the site; the repo itself stays private.

**Build safety:** malformed front-matter fails `npm run build` loudly (zod). Unchanged.

## 8. Detail pages (reuse + fixes)

The route and styling exist. Required fixes (found in review):

- **Carry the site chrome:** the detail page currently has **no Nav and no ThemeSwitcher** — the theme
  and navigation continuity break when you land there. Add both so the chosen theme persists.
- **Entrance:** add a tasteful staggered entrance (header → stack → body) using existing motion tokens;
  respect reduced motion.
- **Back affordance** already present (`← back to work`) — keep; ensure it returns to the ride's
  project region, not a boot replay (§10).

## 9. Motion & performance

The approved prototype fixes are the baseline; the production build formalizes them:

- **Compositor-only animation:** transform/opacity only in the per-frame loop; one shared `rAF`; one
  scroll read per frame, zero layout reads.
- **Overdraw budget:** minimize stacked full-viewport semi-transparent layers. Film grain is **dropped**
  (was ~3% opacity, imperceptible, and the single most expensive overlay). Scanlines/vignette/tunnel
  glow kept (cheap gradients).
- **Panels fade before the camera plane** (don't composite huge-and-opaque at closest pass — the frame
  that re-rasterized large 3D-scaled text + shadow); shadow blur radius capped; far panels culled with
  hysteresis.
- **Crash-zoom = camera Z-impulse** (a transient forward surge on the already-animated `.world`
  transform), never a scale on the stage (which re-rasterizes every text layer).
- **Performance mode (new, for guaranteed smoothness):** on weak hardware, automatically trim the
  heaviest effects (grain already gone, further reduce shadows, cull more panels, reduce simultaneous
  depth layers). Trigger via one or more of: `prefers-reduced-motion`, low `devicePixelRatio`/coarse
  heuristics, or a short first-second FPS probe that flips a `perf-lite` class. Also offer it as a
  manual toggle. This is the honest answer to "is it just too heavy for my laptop" — a 3D text
  fly-through is inherently GPU-heavy; perf mode bounds the cost on any machine.
- **Reduced motion:** the ride collapses to a **flat, readable stacked page** — hero, full project
  list (all entries, as links), contact terminal — no pinned scroll, no 3D.

## 10. Navigation & transitions

- **Astro View Transitions (`astro:transitions`, in core — no new dependency):** ride → detail
  navigates as a directed transition (panel → detail header morph) instead of a hard reload. This also
  **fixes the boot-sequence replaying on every navigation** (the current hard-reload problem), since
  the client router preserves the document.
- The intro/boot sequence remains **session-gated** (plays once per session).

## 11. Accessibility

- Every skill and project reachable by keyboard: skill stations are focusable, nested project rows are
  real `<a>` links; a "skip to skills" affordance and the reduced-motion flat list (every skill with its
  projects) guarantee non-scroll access.
- Visible `:focus-visible`, `:active` feedback on all interactive elements (incl. touch), no horizontal
  page scroll at any viewport, responsive to 390px.
- Role rotation and all motion respect `prefers-reduced-motion`.
- Headline and role text are real text (not canvas); contact links are real anchors.

## 12. Testing / verification

- **Vitest** for pure logic: the skill-grouping + production-first sort (projects → skill stations),
  role-rotation timing/index math, and any camera/scroll mapping helpers (the project already tests
  `kinetic`, `scroll`, `shift`, `themes`, `deck`, `projectSchema`).
- **Browser-verified** for the visual/motion work (not pixel unit tests): entrance choreography,
  ride storyboard at several scroll depths, detail-page chrome + entrance, reduced-motion fallback,
  mobile at 390px, and a real-hardware smoothness check by Nico (perf mode).
- Build must stay green with a malformed-project fixture failing loudly (schema guard).

## 13. Open questions / draft copy for Nico (resolve at spec review)

1. **Exact skill/station set + order** (= the hero role set, §5 draft) and each skill's one-line blurb +
   which projects nest under it.
2. **Tagline:** keep "I turn raw data into decisions." or broaden it (§5).
3. **Role rotation style:** cycle one-at-a-time (type-in/swap) vs. show all as a static cluster.
   Recommendation: one-at-a-time swap — more distinctive, on-brand with the terminal cursor.
4. **`featured: false` in the ride:** include every project under its skill, or let `featured` gate the
   ride (all projects still reachable via detail pages)? Recommendation: include all for now.
5. ~~Skill → projects presentation~~ — **resolved:** dedicated "skill chamber" per role (a cinematic
   dive to `#/skill/<slug>` showing that skill's projects as cards), then project detail at
   `#/project/<slug>`. Three levels: ride → chamber → detail. Remaining sub-question: the chamber's
   exact visual treatment (card layout / dive style) — being validated in the prototype.

## 14. Out of scope (explicit)

- GitHub repo auto-sync; making the repo public; new deployment work (Cloudflare Pages target
  unchanged); rewriting the theme system; variants A/C.
