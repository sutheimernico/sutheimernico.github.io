# AGENTS.md — Portfolio codebase operations

Read before changing code. Project facts, working method and locked decisions: `CLAUDE.md`.
Global personal rules: `~/.claude/CLAUDE.md`.

## Agent stance

- This is a static, content-driven **Astro** site. **Astro renders; React islands add
  interaction only where JS state/effects are needed** (current islands: `ThemeSwitcher`,
  `ProjectIndex`, `Constellation`, `LiveProof`). Default move: a new section is an `.astro`
  component; reach for a `.tsx` island only when it genuinely needs runtime JS.
- **The landing is the Descent ride** (`components/Descent.astro` + `scripts/descent.ts` +
  `lib/descent.ts` + `styles/descent.css`): a sticky viewport inside a tall section, the camera
  dollies through the hero, an entry gate, one panel per project (alternating left/right) and an
  exit gate; a HUD gauge reads the depth. Rules from the approved prototype: transform/opacity
  only in the per-frame loop, one scroll read per frame, no `filter: blur()` on 3D layers, no
  full-viewport blend-mode overlays, shadows capped; the loop sleeps when the camera has settled.
  Reduced motion / no 3D → `html.no-ride`: one viewport of hero, the index below lists everything.
  Geometry and fade bands are pure functions with tests — tune them there, not in the script.
- **Client-side routing is on** (`<ClientRouter />` in `Base.astro`): pages swap without a full
  load, index-row titles morph into the detail `h1` via matching `view-transition-name`s
  (`p-<slug>`), and `Nav`, the theme switcher and the progress bar are `transition:persist`ed.
  Consequence: page-level JS runs on `astro:page-load` (idempotent per page — `chrome.ts`,
  `descent.ts`) and tears down on `astro:before-swap`. The swap wipes every `<html>` attribute;
  theme restore runs again on `astro:after-swap`.
- **Nothing is hidden behind JS.** Scroll-entrance reveals (`.reveal`, index rows, About
  paragraphs, contact lines) are CSS scroll-driven animations under
  `@supports (animation-timeline: view())`; browsers without them show the content at once.
  `chrome.ts` only adds enhancements that degrade to plain content: `[data-stagger]`,
  `[data-decode]`, `[data-count]`, `[data-magnetic]`, the nav's active-section marker.
- **Theme default is phosphor (static).** Shift mode stays opt-in: its palette writes recalc
  styles page-wide, which is exactly the kind of cost the ride cannot afford.
- **Pure logic does not live in components.** Anything testable (kinetic-font math, theme
  resolution, scroll progress, counter formatting, content schema) lives in `src/lib/*.ts` and
  is unit-tested with Vitest. Components import from there.
- The approved prototype `prototype/variant-shift.html` is the **visual source of truth**
  (supersedes the earlier `variant-k.html`). Port its sections; don't reinvent the look.
  Behavior stays identical unless the plan says otherwise.
- Add a project = add a Markdown file to `src/content/projects/`. Never hard-code the list.

## Architecture to preserve

- Astro (static output) + `@astrojs/react` islands + Tailwind v4 (`@tailwindcss/vite`) + TS.
- Tokens are CSS custom properties on `html[data-theme]` in `src/styles/global.css`; six accent
  themes, phosphor default. **Never hard-code accent hexes in components** — use the vars.
- Self-hosted fonts via `@fontsource*` (no Google Fonts CDN in production).
- Layering: `src/lib/` = framework-agnostic, tested logic · `src/components/` = `.astro` shells
  + `.tsx` islands · `src/content/projects/` = the project collection · `src/pages/` = routes.
- Animate only `transform`/`opacity`; respect `prefers-reduced-motion` in every island.

## Run / build / test

- `npm run dev` — dev server (http://localhost:4321).
- `npm run build` — static output to `dist/` (what GitHub Pages serves).
- `npx vitest run` — unit tests for `src/lib` + content schema.
- `npm run typecheck` — `astro check` (TypeScript strict, enforced in CI alongside test + build).
- `node scripts/og.mjs` — re-render `public/og.png` from `public/og.svg` after editing the card.
- Visual checks: `npx astro preview` + `playwright-cli open http://localhost:4321/ --browser=chromium`
  (the default `chrome` channel is not installed on this machine).

## Best first edits

- **New project** → add `src/content/projects/<slug>.md`. Full step-by-step (front-matter
  fields, README body structure, optional `github`) is in `CLAUDE.md` → "Adding a project".
  Schema: `src/lib/projectSchema.ts`; collection wiring: `src/content.config.ts`.
- **New accent theme** → add a row to `THEMES` in `src/lib/themes.ts` + an `html[data-theme=…]`
  block in `global.css`.
- **New animated section** → `.astro` for static; `.tsx` island only if it needs JS; pure math
  goes to `src/lib/` with a Vitest test.
- **Tune the green / motion** → `src/styles/global.css` tokens; keep consistent with the design
  spec in `docs/superpowers/specs/`.
