# AGENTS.md — Portfolio codebase operations

Read before changing code. Project facts, working method and locked decisions: `CLAUDE.md`.
Global personal rules: `~/.claude/CLAUDE.md`.

## Agent stance

- This is a static, content-driven **Astro** site. **Astro renders; React islands add
  interaction only where JS state/effects are needed** (current islands: `ThemeSwitcher`,
  `ColdBoot`, `HeroMercury`, `DataSpine`, `ProjectDeck`, `Constellation`). Default move: a new
  section is an `.astro` component; reach for a `.tsx` island only when it genuinely needs runtime JS.
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
- `npm run build` — static output to `dist/` (what Cloudflare Pages serves).
- `npx vitest run` — unit tests for `src/lib` + content schema.

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
