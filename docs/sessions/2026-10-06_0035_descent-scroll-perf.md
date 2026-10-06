# Descent scroll performance — paused at 00:35, resume 02:00

Branch: `fix/descent-scroll-perf` (from main @ 42b8be8, no commits yet).
Ask (Nico): the zoom-in on scroll is not smooth → optimise, then self-review until clean.

## Measurement setup
- Preview: `npm run build && npx astro preview --host 0.0.0.0 --port 4321` (http://localhost:4321/).
- Driver: Windows-side Playwright, Edge, session `perf` (`scratchpad/pwp.sh`, scripts in
  `C:\Users\NicoSutheimer\AppData\Local\Temp\li-pw\*.js`: measure.js, trace.js, cold.js, who.js, ablate.js, warm.js, thr.js).
- Scripted scroll: 110 × wheel(110px) every 45 ms, rAF deltas → % frames > 25 ms.

## Findings so far
- Warm, 1280×720, default window: 0 % long frames — but first (cold) pass: max 350 ms, p99 50 ms,
  and the in-page perf probe flips `perf-lite` on.
- Fresh contexts at 1920×1000: 10–26 % frames > 25 ms (noisy; new windows may be occlusion-throttled →
  next measurements in the visible default window, with `Emulation.setCPUThrottlingRate 4`, see thr.js).
- Trace (who.js): `#document` repaints ~every frame (294×), `::after` (likely `.viewport::after` vignette)
  330×, `.hud-bot` 282×, theme switcher `.sw` 330× → root/viewport layers repaint each frame.
  Style recalc touches 61–79 elements per frame; one Layout per frame (depth digits).
- Running animations during the ride: `ledPulse` (animates **box-shadow**, infinite → main-thread paint),
  `blink`/`curOn` on 20+ panel cursors (also in `.gone` panels), scroll-driven `view()` reveals on
  ~35 elements (`.idx-row`, `.reveal`, `.about-copy p`), `breathe` on the About SVG.
- Single ablations (noLed / noScrollAnim / isoHud / noBlink / combined) did not clearly win in the noisy
  fresh-context runs → re-measure with throttling in the visible window before deciding.

## Candidate fixes (not yet applied)
1. `ledPulse`: opacity-only (static glow), no box-shadow keyframes.
2. Isolate HUD + vignette onto own layers (`.hud-bot`, `.viewport::after`) so per-frame depth digits don't
   repaint the full-screen gradient.
3. `descent.ts`: drop the forced reflow (`void stnEl.offsetWidth`) in the rAF loop (station flash via WAAPI).
4. Pause animations inside `.zp.gone` panels.
5. Investigate root `#document` repaint source (theme switcher / nav) and cold-start hitch (raster warm-up,
   fonts) — consider pre-rasterising panels during boot.
6. Feel: station "impulse" surge (170 px / 240 ms) may read as stutter — evaluate with Nico's eye.
Then: before/after numbers, frontend-reviewer + design-reviewer on the diff, PR, deploy summary.

## Outcome (02:00–03:00)

Commits on `fix/descent-scroll-perf`: `d0dbb37` (perf pass) and `bd285cb` (review fixes).

### What changed
- Faded stations are culled with `display:none` (they left layerization, pre-paint and hit-testing);
  the hero is exempt, because leaving `display:none` would replay its boot animation.
- HUD strip and vignette on their own layers; station flash without forced reflow; HUD label built as text.
- Stage hit-testing paused while the wheel is active (`.ride-sec.moving`, cleared 120 ms after the last scroll).
- Status leds pulse via opacity (no box-shadow keyframes); only the panel at the camera blinks its cursor;
  typed commands latch (`typed-done`) so they don't retype after culling.
- `content-visibility:auto` on the project index (content-box intrinsic sizes per breakpoint).

### Measurements (Edge on Nico's laptop, 1920×1000, scripted wheel scroll, same session, main vs branch)
| | main | branch |
|---|---|---|
| 4× CPU: main-thread per frame | 27.5–30.9 ms | 16.3–18.6 ms |
| 4× CPU: fps | 24–25 | 30–33 |
| 1× CPU: main-thread per frame | 3.1–3.5 ms | 2.2–2.4 ms |
| 1× CPU: frames > 25 ms | 0 % | 0 % |
| paint events per 60-notch run (separate runs, indicative) | 5207 | 941 |

Unthrottled and warm, both were already at full frame rate on this machine; the gain is headroom for a busy
CPU (autopilot jobs, Teams …) and weaker devices. Remaining per-frame cost is the ride itself (opacity writes
of ~13 visible stations, HUD digits layout, wheel hit-tests); further ablations showed no more cheap wins.

### Verified in the browser
Nav jumps #index/#skills/#about/#contact land within 0–5 px at 1440/1024/390; hero visible immediately after
scrolling back; panel clickable 200 ms after the wheel stops; no typed-command replay; build, 57 tests, typecheck green.

### Open (not part of this task)
- **Pre-existing, also live:** fresh-load hash links (`/#index` from detail pages' "back", deep links `/#about`)
  land near the top: the browser scrolls before `place()` stretches the ride to ~19 000 px. Fix: in `mount()`
  after `place()`, re-scroll to `location.hash` target if it is outside the ride (`behavior: 'instant'`).
- Feel: the station "impulse" surge (170 px / 240 ms) may itself read as a jolt — judge by eye.
- HUD text on its own layer: no pixel change in headless; quick look on Windows at 125 % recommended.
