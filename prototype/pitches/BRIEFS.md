# Design pitch prototypes — briefs

**Question being answered:** which of five design directions should become portfolio v3?
Five throwaway, self-contained HTML prototypes (one per direction), switchable via
`index.html`. Built 2026-07-06 by subagents from these briefs. Winner gets a real spec;
losers get deleted.

## Shared rules (all prototypes)

- **One self-contained `.html` file** — inline CSS/JS. Only allowed external references:
  `./fonts-kinetic.css` (Martian Mono display / IBM Plex Mono body) or `./fonts-cinema.css`
  (Archivo + IBM Plex Mono). No CDNs, no frameworks, no build step.
- **Real content.** Read `src/content/projects/*.md` (8 projects) and use real titles,
  summaries, status, stack, role lines. Person: **NICO SUTHEIMER**, tagline
  _"I turn raw data into decisions."_, skills: Data & BI Engineer · Data Scientist ·
  ML Engineer · AI Engineer · Fullstack Engineer. UI copy in **English**.
- **Status badges:** production → accent "PRODUCTION"; in-progress/research → amber "WIP";
  internal → neutral "INTERNAL".
- **Kinetic Terminal tokens** (pitches 01, 02, 03, 05): bg `#0E0F0D`, panel `#141612`,
  line `#262a22`, ink `#E8EAE3`, muted `#8A9184`, accent `#45E08A`, amber `#D9A441`.
- **Motion discipline:** transform/opacity only, at most one shared rAF loop, easing and
  durations defined once as CSS custom properties. Full `prefers-reduced-motion` fallback:
  no camera moves/loops, all content statically readable.
- **Banned** (research-verified clichés): cursor followers, decorative parallax, preloader
  percent counters, free-typing fake CLI, Inter/Roboto/Space Grotesk, stock Tailwind
  palettes, purple gradients, centered-hero-three-cards.
- Desktop-first, but must not break at 390 px. Keyboard-reachable links, visible focus.
- Sections: hero → work/skills → contact (each direction interprets this its own way).

## 01 — Stratigraph (Descent 2.0) → `01-stratigraph.html`

**Start from `prototype/descent/variant-b.src.html`** — the scroll-driven camera dolly
(world transform, stations, HUD depth gauge, boot checks) already works there. Keep that
mechanic; rework the semantics:

- The descent goes **through the tech stack**: strata `SURFACE — UI/FRONTEND` →
  `API/SERVING` → `PIPELINE/DBT` → `WAREHOUSE/SQL` → `BEDROCK — AZURE/INFRA`. Faint dashed
  stratum boundaries with layer labels drift past as you descend.
- Skill stations live **inside their layer** (Fullstack near surface, Data & BI at
  warehouse depth, etc.); project panels nest under skills as before.
- HUD gauge shows **layer name + depth**: `DEPTH 0212M · API LAYER · STN 02`.
- Atmosphere: subtle glyph/dither texture darkening with depth (CSS gradients + a sparse
  glyph layer are fine — no WebGL needed here).
- Signature moment: boot checks → gauge calibrates → first dolly surge through the name.

## 02 — The Pipeline → `02-pipeline.html`

The tagline literally: **one raw event enters at the top and leaves as a decision.**

- A single persistent data token — a compact JSON line, amber, e.g.
  `{"ts":…,"sig":"0x4F","v":247.3,"src":"plant-07"}` — is pinned/sticky and **transforms at
  each scroll station**: INGEST (Airflow) → MODEL (dbt/SQL) → STORE (warehouse) → SERVE
  (FastAPI) → VISUALIZE (React chart) → DECIDE. At DECIDE it becomes a plain business
  sentence: `→ REORDER PART #4F — NOW.`
- Each station is a full-height scroll scene: station label, what happens to the token
  (show the actual transformation: JSON → SQL row → API response → chart bar), and the
  **projects that prove this skill** as compact evidence cards beside it.
- Implementation: scroll-driven (IntersectionObserver or scroll-linked rAF), the token
  morphs via crossfade/FLIP — no 3D needed. Terminal identity throughout.
- Optional: a "re-roll" control swapping between 2–3 curated example events.
- Signature moment: the moment the JSON line visibly sheds its braces and becomes a
  human sentence.

## 03 — Query Console → `03-query-console.html`

**The portfolio answers queries instead of making claims.**

- Hero: one huge, beautifully set query line that **types itself on load**:
  `SELECT * FROM nico.projects WHERE featured = true;` then shows an animated plan line
  (`SCAN → FILTER → SORT`) and materializes result cards with `n rows · 12 ms`.
- Navigation = **curated query chips** (no free typing!): by skill, by status, by year,
  `EXPLAIN nico.career` (renders a timeline), `SELECT * FROM nico.contact`.
- Results render as elegant rows/cards — typographic, NOT an admin dashboard: generous
  spacing, huge type, no sidebar chrome, no data-grid look.
- Detail teaser per project: expanding a row shows an `EXPLAIN ANALYZE`-style breakdown
  (what/how/why in three steps).
- Signature moment: the self-typing first query with its plan animation.

## 04 — Annual Report → `04-annual-report.html`

**The contrast pitch. BI applied to oneself — a printed data report (Feltron tradition).**

- Light paper ground `#F2EFE7`, ink `#22241E`, one restrained editorial accent (oxide red
  `#8A2F1E`), **Archivo** (from `./fonts-cinema.css`) as display grotesk, IBM Plex Mono for
  data labels. NO dark terminal styling — this one deliberately breaks the identity.
- Structure like a report: cover ("SUTHEIMER, N. — REPORT NO. 01"), a contents line,
  chapters: WORK (projects as numbered case entries with big figures), COMPETENCE (skills
  as a spread of large key figures + small bar/dot charts), CONTACT (colophon style).
- Any numbers/charts must be plausible and labelled `DEMO DATA` where invented (house rule).
- Motion: restrained scroll reveals only (fade/translate). The wow is typographic precision:
  a strict grid, huge numerals, hairline rules, tabular figures.
- Signature moment: the key-figures spread — giant numerals with fine chart miniatures.

## 05 — Glyph Field → `05-glyph-field.html`

**Kinetic Terminal at maximum: the whole stage is rendered from living mono glyphs.**

- A fullscreen **Canvas-2D glyph renderer** (no WebGL): a character grid (~10–14 px cells)
  driven by a noise field. The hero: glyph noise **condenses into "NICO SUTHEIMER"** over
  ~2 s (density mask from offscreen-rendered text), idles with subtle shimmer, and
  **disperses on first scroll**.
- Below/after the hero, content sections sit on the field: project cards whose borders and
  fills are drawn from glyph density; hovering a card locally excites the field. Cards
  themselves are real HTML text (readable, selectable) — the canvas is atmosphere + edges.
- Real accessible text everywhere (canvas is `aria-hidden`, content is real DOM).
- Cap the rAF work: one loop, cell grid sized to viewport, skip frames when hidden,
  static render under reduced motion.
- Signature moment: the condensation of the name out of noise.

## 06 — Descent × Pipeline (the fusion) → `06-descent-pipeline.html`

**Claude's recommended "Königsoption": one metaphor, one ride, one statement.**
Start from the finished `01-stratigraph.html` (the working strata ride) and integrate the
signature mechanic of `02-pipeline.html` (the transforming event token):

- A single amber **event token travels down with the camera** — docked as a compact HUD
  panel (e.g. lower right, above the gauge), always visible during the ride.
- At each stratum boundary the token **transforms into that layer's shape** (same
  progression as 02: raw JSON → API response → dbt row → warehouse row → infra/deploy line),
  with a brief highlight pulse on transform. The HUD gauge and the token tell the same
  story: depth = stack layer = what happens to the data there.
- At the deepest point / contact terminal the token **sheds its braces and becomes the
  decision sentence** — the ride's payoff, right where the visitor can act (contact).
- Everything else from 01 stays: strata labels, skill stations with nested projects,
  chambers, boot sequence, reduced-motion flat fallback (there the token renders as a
  static per-section sequence like 02's fallback).
- Label the token `SIMULATED EVENT` like 02 does (house rule: demo data marked).

## Verdict

_(to fill after Nico reviews: which direction won, what to steal from the others)_
