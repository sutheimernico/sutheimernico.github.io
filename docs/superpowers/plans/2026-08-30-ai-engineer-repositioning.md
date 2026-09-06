# AI-Engineer Repositioning & Content Truth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Written:** 2026-08-30 (Review-Ops round 2, register: `~/private/REVIEW-OPS.md`). Based on two
reviews (tech/plan-delta + hiring-manager) against the repo and the LIVE site.

**Relationship to the existing plan:** `docs/superpowers/plans/2026-07-21-quick-wins-and-stratigraph.md`
Stage A is superseded by THIS plan (its still-valid tasks are folded in below with corrections —
the old plan contains factual errors, e.g. it claims scouting-rag has no content file; it does).
Stage B (Stratigraph rebuild, its tasks 8–12) remains a valid FOLLOW-UP plan to run after this
one; do not start it here.

**Goal:** Turn the live site from "Data & BI engineer with placeholder copy" into a truthful,
current "AI Engineer" application asset before Nico's Q4-2026 salary talk. Measured problems:
the `<title>`, meta description and hero eyebrow literally say "Data & BI" (zero "AI"/"ML");
`AboutSection.astro:19` renders "— prototype copy, grounded but placeholder" in production
since 04.07.; every one of the 8 project pages ends with a live-visible "_(draft — Nico to
refine)_" line; the contact e-mail is the employer address; equity-scout's case study is two
months behind reality; ml-lab (the purest AI evidence) is absent.

**Architecture:** Astro 6 SSG + React islands + Tailwind v4, content collections with Zod
schema (`src/lib/projectSchema.ts`). Adding/updating a case study = one markdown file, no code.
Tests: Vitest (32 green), build gate `npm run build`.

**Executor requirement:** load the repo-local skills before touching any UI/copy —
`emil-design-eng`, `frontend-design`, `web-design-guidelines` (under `portfolio/.claude/skills`).
Match the site's existing visual language; this plan changes CONTENT and positioning, not the
design system.

**Hard deployment guardrail:** the site deploys on push to `main`. The executor works on a NEW
branch `feat/ai-engineer-repositioning` cut from `main` (NOT from `feat/descent-prototype` —
that branch only carries design-reference prototypes and stays untouched), commits per task,
and opens NO merge to `main`. Going live is Nico's call (this is his public professional
identity). Everything must be verifiable via `npm run build` + local preview.

---

## Phase A — Remove what actively hurts (hours, highest impact)

### Task A1 — Reposition title/meta/hero to AI Engineer

- [ ] `src/components/HeroSection.astro` (eyebrow, line ~11), the `<title>` and meta
      description in the layout/`index.astro`: replace "Fullstack Engineer, Data & BI" framing.
      Default wording (Nico can veto before merge, do not ask now):
      title `Nico Sutheimer — AI Engineer`, eyebrow `AI Engineer · Backend & ML Systems`,
      meta description mentioning: builds and operates ML-backed systems end-to-end —
      evaluation harnesses, honest statistics gates, live paper-trading ops, RAG.
- [ ] Keep the day job to one line of context in the About copy, not the anchor.
- [ ] Acceptance: `grep -ri "Data & BI" src/` returns no hero/title/meta hits; build green.

### Task A2 — Delete the placeholder note, restructure About

- [ ] Remove the `placeholder-note` paragraph (`src/components/AboutSection.astro:19`).
- [ ] Rewrite the About copy with AI/ML work leading and bekumoo as one context line. Write it
      in Nico's existing site tone (read the current copy first); mark the file's frontmatter/
      comment with `draft: Claude 2026-08-30 — Nico review before merge` (COMMENT, not rendered).
- [ ] Acceptance: `curl`-equivalent local preview shows no "placeholder" string anywhere.

### Task A3 — Kill the live "draft" markers site-wide

Every `src/content/projects/*.md` ends with `_(draft — Nico to refine)_`, rendered publicly.

- [ ] Move the marker out of the rendered body: add `reviewed: boolean` (default false) to the
      Zod schema; strip the italic draft lines from all 8 content files; render NOTHING for
      unreviewed (the flag exists only so Nico can grep what he has not signed off).
- [ ] Update `CLAUDE.md` §content conventions to describe the new mechanism.
- [ ] Acceptance: `grep -r "Nico to refine" src/content/` empty; build green.

### Task A4 — Contact block honesty

- [ ] Remove the employer e-mail (`nico.sutheimer@bekumoo.de`) from
      `src/components/ContactSection.astro` — an application asset must not route replies
      through the current employer. Remove the dead `in/nico-sutheimer (soon)` span entirely
      (a half-finished channel reads worse than none). GitHub remains the contact channel.
- [ ] Leave an HTML comment `<!-- TODO(Nico): private e-mail + LinkedIn URL -->` at the spot.
- [ ] Acceptance: no `bekumoo` string anywhere in `src/`; no "(soon)" rendered.

### Task A5 — Quick technical wins carried over from the July plan (verified still valid)

- [ ] PR CI: add `pull_request` trigger running test+build (not deploy) in
      `.github/workflows/pages.yml` or a separate `ci.yml`.
- [ ] OG image: generate `og.png` (1200×630) from the existing `og.svg` (use `sharp` as a
      devDependency or any already-present tooling — check `package.json` first; if adding
      `sharp`, note it in the commit body), point `og:image` at the PNG with correct
      width/height meta. LinkedIn unfurls do not render SVG.
- [ ] Detail-page chrome: project detail pages (`/projects/<slug>/`) currently have no nav,
      no home link, no theme switcher one click deep. Reuse the existing header component from
      the index page.
- [ ] Acceptance: build green; detail page shows nav; `dist/og.png` exists and is referenced.

**Phase A gate:** `npm test` green (≥32), `npm run build` green, visual spot-check of index +
one detail page via local preview.

---

## Phase B — Content truth & the four-case narrative

Hiring-manager review verdict: sharpen to FOUR featured case studies — equity-scout, ml-lab,
grid-scout, scouting-rag. Everything else stays but recedes.

### Task B1 — equity-scout case study: rewrite to the live-ops honesty story

The live page still says "research, not a product / continuous loop is exploratory" — two
months behind reality. Rewrite (source of truth: read `~/private/equity-scout/README.md`,
`PLAN.md` status block, and `docs/research/` — verify every number you publish; do NOT invent):

- [ ] Framing (decided): NOT a trading pitch. The story is **"honesty gates against
      self-deception in an autonomously operating ML system"**: PBO/DSR hurdles, purged
      walk-forward, costs always on, live paper trading with measured fill slippage (1–3 bps),
      pre-registered lane kill-gates, documented negative findings (e.g. "no entry model ever
      beat its own 0.55 AUC gate", the dethroned measurement-artifact champion). Negative
      results are the FEATURE of this case study, not something to hide.
- [ ] Vocabulary rule: avoid "investieren/Handelssignal/returns you can expect"; use
      decision-support / signal evaluation / live ops language. State clearly it runs on a
      PAPER account.
- [ ] Mention the phone PWA/push stack and the 2,700+ test suite as engineering scope.
- [ ] Fold signal-trader-demo in: one sentence + repo link inside the equity-scout page;
      set signal-trader-demo's content file to `featured: false` with a later `order`.
- [ ] Acceptance: page renders; every number in the text has a source in the equity-scout repo
      (list the sources in an HTML comment at the bottom of the md file for Nico's review).

### Task B2 — ml-lab case study (content now, link later)

ml-lab is not on GitHub (no remote; it is not even a git repo — a folder with 3 sub-projects).
Publishing it is Needs-Nico. The case study does not have to wait:

- [ ] Check the schema: if `github` is required, make it optional in `projectSchema.ts`.
- [ ] Write `src/content/projects/ml-lab.md`, status `research`, featured, NO github link yet.
      Source of truth: `~/private/ml-lab/` READMEs and results. Story: "does a foundation model
      beat tuned gradient boosting — and where exactly does it flip?" Three controlled
      benchmarks: TabPFN vs LightGBM (TabPFN wins small data; LightGBM never catches up through
      5k rows), Chronos time-series with significance testing (20 windows), agentic eval with a
      quantified LLM-judge benchmark including an honest negative local-model run.
- [ ] Acceptance: page builds and renders; numbers traceable to ml-lab artifacts (same
      HTML-comment source list convention as B1).

### Task B3 — scouting-rag case study: expand from thin to interview-grade

- [ ] Expand the existing content file: RAG comparison study framing — retrieval variants,
      re-ranking, grounding/citations, judge-based eval, the nDCG-bug finding and what it
      changed. Feature it. Same source-verification rule (`~/private/scouting-rag/`).

### Task B4 — grid-scout: metrics refresh + LiveProof island

- [ ] Refresh the numbers on the existing page against grid-scout's current state (it runs
      daily via GitHub Actions since 04.07. — cite uptime/freshness honestly).
- [ ] Build the LiveProof island from the July plan: a small React island on the grid-scout
      card/page fetching the public GitHub Actions API (repo `sutheimernico/grid-scout`) at
      view time: last run status + timestamp, with an honest static fallback when the API is
      unreachable/rate-limited. No token, public API only.
- [ ] Order: grid-scout gets `order: 1` (it is the only live-verifiable system), equity-scout 2,
      ml-lab 3, scouting-rag 4; day-job entries (after-sales-bi, data-quality) move behind
      those, `featured: false`.

### Task B5 — breadth tiles for the newer local projects

- [ ] Add non-featured content files (status `research`/`internal`, no github link) for:
      planet-hopper (3D browser game, 80 tests, deterministic core), clip-scout (local-model
      video factory: TTS, trend detection, biography filter), decor-scout (CLIP-based
      furniture scout, AUC 0.90 from 75 personal votes). Two-paragraph pages, honest status
      lines. Source: each project's README/docs.
- [ ] Explicitly EXCLUDED (decided, do not add): wohnung-telgenbusch (private address/floor
      plans — never public per its project constraints), factotum (local-only constraint),
      match-scout / estate-scout / face-scout (optional later; not part of this plan to keep
      the narrative sharp).

### Task B6 — one screenshot per flagship

No image exists anywhere on the site. Cheapest credible proof:

- [ ] grid-scout: screenshot of the live public dashboard (playwright CLI against
      `https://sutheimernico.github.io/grid-scout`), light theme, 1600px wide, compressed
      (<300 KB, webp).
- [ ] equity-scout: screenshot of the local cockpit (dash on `http://localhost:8420`, token in
      the equity-scout `.env` — reading a private-project .env is allowed; NEVER print the
      token). Choose the Ergebnisse/Proof view (honesty framing), blur nothing but include no
      account identifiers; verify none are visible before committing the image.
- [ ] Embed via the content schema (add optional `image` + alt-text field if absent).
- [ ] Acceptance: images render on both pages, total page weight still lighthouse-sane.

**Phase B gate:** build + tests green; every new/changed content file carries the
source-comment block; `reviewed: false` on all of them (Nico signs off before merge).

---

## Phase C — Field notes, lightly (decided: no separate collection)

The July plan's Field-Notes collection is DESCOPED (hiring review: low impact vs. cost).

- [ ] Instead: add an optional `fieldNote` frontmatter string to the project schema, rendered
      as a styled aside on detail pages. Write one honest field note each for equity-scout
      ("11 behavioral signals, none predicts returns — what a negative result taught the
      system design") and ml-lab (the TabPFN flip point). Two asides, no new collection.

---

## Verification (before any "done" claim — superpowers:verification-before-completion)

1. `npm test` green (baseline 32, must not drop) and `npm run build` green.
2. Local preview walk: index, all four featured detail pages, one breadth tile — no
   "placeholder", no "draft", no "(soon)", no "bekumoo" anywhere rendered.
3. `grep -ri "bekumoo\|placeholder\|Nico to refine\|(soon)" src/ dist/` → only allowed hits
   (none in rendered output).
4. OG check: `dist/og.png` exists, referenced with width/height.
5. Post-execution: Outcome section appended to THIS file; old July plan updated with a
   supersession note on Stage A; branch pushed as `feat/ai-engineer-repositioning`, NO merge.

## Needs Nico (surface, don't do)

- **Merge & deploy decision** — the branch changes his public professional identity; he
  reviews wording (especially "AI Engineer" self-labeling and the About bio) and merges.
- Private contact e-mail + LinkedIn URL (Task A4 leaves a TODO comment).
- **ml-lab publish decision** (publish checklist: history secret-scan, noreply rewrite, MIT,
  backup bundle) — the case study ships without a repo link until then; add the link after.
- CV/resume PDF download (personal data; optional but cheap once he provides the file).
- Stage B of the July plan (Stratigraph rebuild) — separate go after this plan is live.

---

## Implementation Notes (2026-09-06, branch `feat/v2-motion-and-projects`)

Executed in one session together with a motion upgrade Nico asked for ("mach die noch
geiler mit Animationen") and a breadth pass over all private projects plus the day job.
Nothing merged to `main`; going live stays Nico's call.

### Phase A — done
- A1 title/meta/hero → `Nico Sutheimer — AI Engineer`, eyebrow `AI Engineer · Backend & ML
  Systems`, meta description per plan; `grep -ri "Data & BI" src/` → 0 hits (og.svg retitled too).
- A2 placeholder note removed; About rewritten from Nico's LinkedIn About text (English). The
  H2 is deliberately his own German sentence „Woher weiß ich, dass es funktioniert?" with an
  English sub-line — the one aesthetic risk on the page; Nico can veto.
- A3 draft markers: `reviewed: boolean` (default false) in the schema; all bodies stripped;
  `grep -r "Nico to refine" src/content/` → 0. Convention documented in CLAUDE.md.
- A4 contact: employer e-mail + "(soon)" LinkedIn removed; GitHub + site repo remain; TODO
  comment for private e-mail / LinkedIn URL.
- A5 CI `pull_request` workflow (`.github/workflows/ci.yml`), `public/og.png` rendered by
  `scripts/og.mjs` (sharp pinned as devDependency), detail pages carry `Nav` + `ThemeSwitcher`.

### Phase B — done (content drafted by Opus subagents from the real repos, all `reviewed: false`)
- B1 equity-scout rewritten to the honesty-gates story; signal-trader-demo folded in
  (`featured: false`, order 18).
- B2 `ml-lab.md` (research, featured, no repo link — publish decision still Needs Nico).
- B3 `scouting-rag.md` expanded.
- B4 grid-scout refreshed; `LiveProof` island + `liveRepo` schema field (public Actions API,
  honest fallback); order: grid-scout 1, equity-scout 2, hugin 3, ml-lab 4, scouting-rag 5,
  after-sales-bi 6. Flagship set = 6 (plan said 4; hugin — v1 complete the same day — and the
  day-job platform were added so the deck shows AI-agent depth and production context).
- B5 breadth tiles, more than planned: leitstand, estate-scout, clip-scout, decor-scout,
  job-scout, match-scout, face-scout, planet-hopper, reptic (Repz), showroom. Still excluded:
  wohnung-telgenbusch, tap-approve, pulse-scout, vol-scout, incremental-game, roadmap.
- B6 screenshots: NOT done (deferred — no image field yet; grid-scout has the live-proof line
  instead).
- New day-job entries per Nico's ask ("interne bekumoo SW"): `after-sales-bi.md` broadened to
  the full chain, `data-product-chain.md`, `engineering-agents.md`. Written from Nico's own
  LinkedIn draft and his assistant-skill descriptions only — the private-session guard blocks
  the company workspace, so no internal repo was read. **Confidentiality vetting is Needs Nico.**

### Phase C — done differently
`fieldNote` frontmatter string rendered as an aside on detail pages; the subagents wrote one
per project (not just two).

### Beyond the plan — motion upgrade
- Astro `<ClientRouter />`; `Nav`, `ThemeSwitcher` and the chrome divs are `transition:persist`;
  project titles morph via `view-transition-name: p-<slug>` (deck cards for featured, index
  rows for the rest, detail `h1`).
- `src/scripts/chrome.ts` on `astro:page-load`: reveal (edge-based IO — a ratio threshold
  never fired for the tall index on phones), stagger, decode headings, count-up, typed
  statement, magnetic buttons, nav active-section, cursor glow, progress bar.
- Cold boot once per tab session. Found + fixed: the ClientRouter swap wipes all `<html>`
  attributes (theme, booted flag, shift vars) → restore on `astro:after-swap` in the head
  script and in `ThemeSwitcher`.
- Hero: rotating typed statement (3 lines, first is the old tagline), stack ticker derived
  from the collection (`topStack`), staggered entrance keyed to the boot timing.
- New `ProjectIndex` island (filter chips by domain + `@ bekumoo`, LED status, staggered rows,
  count-up totals); schema gained `domain`, `context`, `reviewed`, `fieldNote`, `liveRepo`;
  `featured` now defaults to false.
- Deck: for >4 cards a "hand" layout (even spacing, left-to-right stacking) so titles stay
  visible; cursor tilt + glare on an inner wrapper.
- Constellation skills are now the 16 most frequent stack entries across projects.

### Verification
- `npm test` 46/46, `npm run build` 24 pages, `grep -ri "bekumoo.de\|placeholder\|Nico to
  refine\|(soon)\|Data &amp; BI" dist/` → 0 hits.
- Headless Chromium (playwright-cli) at 1440×900 and 390×844: hero, spine, deck, index, skills,
  about, contact, detail page, prev/next, live-proof (real run data), theme persistence and
  boot-once across client-side navigation, magnetic + tilt transforms. Console clean.
- Frontend review (subagent, against the built `dist/`): no bugs — view-transition names
  unique (22/22), chrome script deduped by module URL, after-swap restore correct, Nav's
  absolute hashes confirmed as scroll-only in Astro's router. Fixed from its should-fix list:
  `ProjectStatus` imported instead of a duplicated union in `ProjectDeck`; the index's
  `aria-live` moved from the whole list to a one-line "n of 22 shown" status node; TypeScript
  strictness now actually enforced — `@astrojs/check` + `typescript` as devDependencies,
  `npm run typecheck` (`astro check`) as a CI step (surfaced one missing module declaration for
  the variable-font import, added under `src/types/`). Left as-is: `aria-pressed` filter chips
  (valid pattern), un-cancellable rAF loops in decode/count-up (≤900 ms, harmless).

### Correction the same evening — landing rebuilt as Descent (v2.1)
Nico rejected the v2 landing: "eine ganz alte, ganz schlechte Version" — the Kinetic-Terminal
spine/deck layout he had already replaced in his mind with the **Descent camera ride** he chose
on 2026-07-02 (windows approaching left/right, zoom, fly-through). He also reported a half-empty
page (sections hidden behind a JS-gated `.reveal`), laggy animation, and wanted the contact mail
back. Done in response:
- `Descent.astro` + `scripts/descent.ts` + `lib/descent.ts` (+ tests) + `styles/descent.css`:
  the prototype-B mechanic ported with **all 26 projects as panels** (order = `order` field),
  entry/exit gates, depth markers, HUD gauge with clickable station dots, bootlog, role cycler,
  letter boot. Sticky viewport inside a tall section, so index/skills/about/contact follow.
  Loop sleeps when settled; perf probe adds `html.perf-lite` (no shadows/glow) on weak GPUs.
- Removed: DataSpine, ProjectDeck, HeroSection (typed line + ticker), ColdBoot overlay,
  HeroMercury, cursor glow, blurred ambient aurora, film grain, `deck.ts`. Shift mode is opt-in;
  phosphor is the default.
- Visibility no longer depends on JS anywhere: CSS scroll-driven reveals under `@supports`.
- Contact mail restored (Nico's call). Four more projects added (tap-approve, vol-scout,
  pulse-scout, incremental-game) → 26 entries. Nav: Work · Index · Skills · About · Contact.
- Verified headless: 28 pages build, typecheck 0, 54 tests; ride at 1440×900 and 390×844,
  reduced-motion flat mode, detail → back re-mounts the ride, scripted-scroll frame time
  avg ≈19 ms / p95 ≈33 ms on a software renderer (no GPU) — a real GPU sits at 60 fps.

### Needs Nico
- Merge/publish decision (public identity), wording veto (AI Engineer label, German H2, the
  hero role cycle), confidentiality check of the three bekumoo entries, `reviewed: true` pass.
- Private e-mail + LinkedIn URL for the contact block.
- Publish decisions for ml-lab / hugin / others (repo links), screenshots (B6), Stratigraph
  (Stage B of the July plan) remains a separate go.
