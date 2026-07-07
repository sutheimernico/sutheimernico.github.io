# Session 2026-07-07 09:39 — Descent-Rettung & sechs Design-Pitch-Prototypen

## Kontext & Ziel

Nico vermisste einen „viel cooleren" Design-Stand (Kamerafahrt, Fenster links/rechts,
Reinzoomen). Befund: Der **Descent-Prototyp** vom 2026-07-02 lag ausschließlich im
flüchtigen Session-Scratchpad unter `/tmp` — nie committed, ein Reboot hätte ihn gelöscht.
Auftrag danach: Prototyp sichern, dann fünf Design-Richtungen für Portfolio v3 pitchen
und als klickbare Prototypen bauen (Subagents, Sonnet), autonom über Nacht fertigstellen.

## Ergebnis

- **Descent gerettet + committed**: `prototype/descent/` (variant-a/b/c + Quellen + Font-CSS),
  Commit `5a0684e` auf `feat/descent-prototype`. variant-b = finaler, approbierter Stand.
- **Web-Recherche** (3 Subagents): Awwwards/FWA-Gewinner 2024–26, Motion-Technik 2026,
  unkonventionelle Portfolio-Konzepte. Kernbefunde: (1) eine durchgezogene Metapher statt
  Sektionen, (2) die Site muss Kompetenz *tun statt behaupten* — „Portfolio als Datenprodukt"
  ist für ein BI-Profil eine echte Marktlücke, (3) ASCII/Dither-Shader = frische 2026-Technik,
  (4) Klischee-Sperrliste (Cursor-Follower, Parallax-Deko, tippbare Fake-CLI).
- **Pitch-Deck** (Artifact): https://claude.ai/code/artifact/e8948dfc-c201-4594-af42-cd24077b9993
- **Sechs Prototypen** in `prototype/pitches/` (Briefs: `BRIEFS.md`, Switcher: `index.html`),
  Commits `a88586e` (01–04 + Shell) und `902441a` (05–06):
  01 Stratigraph (Descent 2.0: Abstieg durch den Tech-Stack), 02 Pipeline (Event-Token wird
  scrollend zur Entscheidung), 03 Query Console, 04 Annual Report (Feltron-Kontrast),
  05 Glyph Field (Canvas-Glyphen-Renderer), 06 **Descent × Pipeline (Fusion, Empfehlung)**.
- **Review-Fixes** (alle per Headless-Screenshot verifiziert): 04 Randbeschriftungs-Overlap
  (`writing-mode` statt Rotation), 05 Namens-Lesbarkeit (Halo-Dämpfung ums Letterform-Band,
  Mask-Threshold 0.35, zweizeiliger Name auf allen Viewports, Tagline nach unten).
- Ein Builder-Batch starb am 2026-07-06 am Session-Limit (01 war unveränderte Kopie,
  02/05 fehlten) — am 07.07. neu gestartet, alle fertig.

## Entscheidungen

- **Pitches 1–3 datengetrieben, 4–5 bewusste Ausreißer** — Recherche-Befund „Site als Beweis"
  passt exakt auf Nicos Profil.
- **06 Fusion = Claude-Empfehlung** (validierte Descent-Basis + Pipeline-Signature), gebaut
  auf 01, Token-Dock im HUD ohne zweiten rAF-Loop.
- Prototypen als **self-contained HTML** nach Repo-Konvention (`prototype/`-Muster), nicht
  als Astro-Routen — Wegwerf-Charakter, kein Produktionscode.
- Builder-Modell Sonnet (Nicos Vorschlag), Review/Fixes durch Session-Modell.
- Nichts gepusht, nichts deployt — Branch ist lokal.

## Offene Fragen

- **Welche Richtung gewinnt?** (Nicos Call; Verdict-Platzhalter in `BRIEFS.md` ausfüllen.)
- `docs/sessions/` ist im Repo **nicht gitignored** und das Repo ist inzwischen **public** —
  bisherige Konvention committet Session-Docs; bei Merge landen sie auf GitHub. OK so?
- Skill→Layer-Zuordnung in 01/06 (ML→API, Data Scientist→Pipeline) ist Claude-Judgment,
  nicht abgestimmt.

## To-dos

### Nico

1. Auf `http://localhost:4323/pitches/` alle sechs Varianten durchklicken (Pfeiltasten ← →).
2. Favorit bestimmen (oder Kombination benennen: „X von A, Y von B").
3. Entscheiden, ob die Descent-Spec (`docs/superpowers/specs/2026-07-02-descent-portfolio-design.md`)
   auf die Gewinner-Richtung umgeschrieben werden soll.
4. Sagen, ob der Branch `feat/descent-prototype` gepusht / als PR geöffnet werden soll.

### Nächste Session (Agent)

- Verdict in `prototype/pitches/BRIEFS.md` eintragen, Verlierer-Prototypen löschen
  (Prototype-Skill-Regel: delete or absorb).
- Bei Gewinner-Entscheid: `writing-plans` für die echte Umsetzung (Spec-Update + Plan),
  danach `subagent-driven-development`.
- Memory `descent-prototype-location` aktualisieren (Pitches committed, Verdict).

## Einstieg für die nächste Session

Branch `feat/descent-prototype` (lokal, 3 Commits vor `origin/main`-Basis). Server:
`python3 -m http.server 4323` in `prototype/` (Pitches unter `/pitches/`), Astro-Dev auf 4321.
Erster Schritt: Nicos Verdict abholen → `BRIEFS.md` ausfüllen → bei klarem Gewinner direkt
`writing-plans` invoken. Screenshots der Review-Runden liegen (flüchtig!) im Session-Scratchpad
`shots-pitches/`.
