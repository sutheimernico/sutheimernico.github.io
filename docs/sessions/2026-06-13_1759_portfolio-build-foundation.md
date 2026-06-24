# Session 2026-06-13 17:59 — Portfolio-Build: Fundament

## Kontext & Ziel
Aufbau der persönlichen Portfolio-Seite in `~/private/portfolio` (GitHub `sutheimernico/Portfolio`, **privat**). Design-first, bewusst kein generisches KI-Design, lebendige Animationen. Diese Session: von der Design-Entscheidung bis zum verifizierten technischen Fundament.

Voller Plan: `docs/superpowers/plans/2026-06-13-portfolio-site.md` (14 Tasks). Projekt-Memory: `~/.claude/projects/-home-nicosutheimer-private/memory/portfolio-project.md`. Arbeitsweise/Locked Decisions: `CLAUDE.md`; Code-Operatives: `AGENTS.md`.

## Ergebnis (was erledigt wurde)
Branch `feat/build-site` (von `main` abgezweigt, **lokal, noch nicht gepusht**). Commits:
- `77bcb5f` — CLAUDE.md (Subagent-Driven-Arbeitsweise + Locked Decisions) + AGENTS.md + Build-Plan, nach bekumoo-Schnitt.
- `a9ec953` — `prototype/variant-k.html` als visuelle Referenz in den Build-Branch geholt.
- `ae4fbee` — **Task 1**: Scaffold Astro 6.4 + React-Inseln + Tailwind v4 (`@tailwindcss/vite`) + Vitest; self-hosted Fonts (`@fontsource-variable/martian-mono`, `@fontsource/ibm-plex-mono`).
- `1c230d5` — **Task 2**: Theme-Token-System (`src/lib/themes.ts` + Test, `src/styles/global.css`) — 6 Themes, Phosphor-Default `#45E08A`.
- `f7de18e` — **Task 3**: getestete Pure-Logic `src/lib/{kinetic,scroll,format}.ts` (+ Tests).

**Verifikation:** `tsc --noEmit` exit 0 · Vitest **12/12** · `npm run build` exit 0. Tasks 1–3 je mit Spec-+Quality-Review-Subagent geprüft (beide Gates ✅; Mathe Zeile für Zeile gegen den Prototyp abgeglichen, keine Abweichung).

**Vorarbeit (frühere Sessions, andere Branches):** 12 Design-Prototypen auf `feat/design-prototypes` (`prototype/variant-a..l.html` + `index.html`-Switcher + `NOTES.md`). Variante K hat einen 6-Theme-Switcher. Kopie liegt auch in `C:\Users\NicoSutheimer\Downloads\portfolio-prototype\`.

## Entscheidungen
- **Design = Variante K „Kinetic Terminal"** — Nico fand sie am lebendigsten; dunkles Warm-Schwarz + Phosphor-Grün.
- **Grün = `#45E08A`** (statt Stock-Neon `#33FF66`) — weniger generisch, eigenständiger; per Token in einer Zeile tauschbar.
- **Stack = Astro + React-Inseln + Tailwind v4** — Projekte als Content Collections (neues Projekt = neue Markdown-Datei), minimales JS, ideal für statisches Hosting, React für Nicos Wachstum.
- **Repo bleibt privat** — daher GitHub Pages nicht gratis; Deploy auf **Cloudflare Pages** (Free-Tier deployt private Repos, keine Non-Commercial-Klausel, unbegrenzte Bandbreite).
- **Inhalte: Claude entwirft, Nico korrigiert** — gegroundet in bekumoo-BI + scouting-rag; ML/RAG-Vorhaben als `in-progress`.
- **Pure-Logic getestet (Vitest), Visuelles im Browser geprüft** — keine Pixel-Unit-Tests.

## Offene Fragen
- **Visuelle Verifikation:** Diese Umgebung hat kein Display (Playwright scheitert an fehlender `libasound.so.2`). Ab Task 4 ist **Nico der visuelle Prüfer** (`npm run dev` → localhost:4321 im Windows-Browser). Optional einmalig `sudo apt-get install -y libasound2t64`, dann könnte der Agent Screenshots machen.
- **Domain:** v1 läuft auf `*.pages.dev`. Danach gratis `nico.is-a.dev` (PR an `is-a-dev/register`) oder `.dev` für ~10 €/Jahr (Cloudflare Registrar). Noch nicht entschieden.
- **Gefällt das Grün `#45E08A` live?** — erst am Hero-Checkpoint sichtbar.
- `docs/sessions/` ist in diesem Repo **getrackt** (nicht gitignored) — bewusst so (privates Repo, Doku wird committed laut CLAUDE.md). Falls du Session-Docs doch lokal halten willst, sag Bescheid.

## To-dos
### Nico
1. Bei Gelegenheit das Fundament selbst ansehen: im Projektordner `npm install` (falls auf neuer Maschine), dann `npm run dev` und `http://localhost:4321` öffnen — aktuell nur eine „scaffold ok"-Platzhalterseite, das Echte kommt mit dem Hero.
2. Entscheiden, ob ich den Branch `feat/build-site` zu GitHub pushen soll (bisher nur lokal).
3. Später: Projekt-Texte + „Über mich" gegenlesen und korrigieren (ich entwerfe sie zuerst, markiere mit `<!-- VERIFY -->`).
4. Für den Live-Gang den Cloudflare-Pages-Schritt machen (Browser-OAuth, kann ich nicht für dich) — Anleitung steht im Plan, Task 13.

### Nächste Session (Agent)
- Subagent-Driven weiter ab **Task 4** (KineticName- + BootLine-Inseln), dann 5 (HUD + ThemeSwitcher), 6, … bis Hero zusammengebaut (Task 9) → erster sichtbarer Checkpoint für Nico.
- Pro Task: Implementer-Subagent mit vollem Task-Text + Kontext (Branch existiert, Prototyp-Referenz `prototype/variant-k.html` vorhanden, kein Display → tsc+build als strukturelles Gate), dann Spec-+Quality-Review.
- Visuelle Komponenten aus `prototype/variant-k.html` portieren — Verhalten identisch lassen; CSS in scoped `<style>` der jeweiligen Komponente, Selector-Spezifität beachten.
- LSP-„Cannot find module"-Diagnostics während TDD ignorieren (RED-Phase-Artefakte) — mit `tsc --noEmit` gegenprüfen.
- Offene Low-Severity-Notiz: `currentPanel` in `src/lib/scroll.ts` clamped negative Eingaben nicht (im echten Aufruf unerreichbar) — ggf. bei nächster Berührung von `scroll.ts` mit `Math.max(...,1)` härten.

## Einstieg für die nächste Session
Branch `feat/build-site` auschecken. Plan ist `docs/superpowers/plans/2026-06-13-portfolio-site.md`, Tasks 1–3 sind erledigt (Commits oben), weiter bei **Task 4**. Skill `subagent-driven-development` aufrufen, Implementer pro Task mit vollem Task-Text dispatchen (Prototyp-Referenz liegt unter `prototype/variant-k.html`). Gates: `npx tsc --noEmit`, `npx vitest run`, `npm run build`. Visuelle Bestätigung holt sich der Agent von Nico, sobald der Hero (Task 9) steht.
