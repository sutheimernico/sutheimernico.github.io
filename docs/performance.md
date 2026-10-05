# Performance note — 2026-09-27

A measured pass on the landing ride (`/`) and one case study (`/projects/grid-scout/`) against
the production build (`astro preview`). Only measured problems were changed.

## What changed

| Commit | Change | Why (measured) |
|---|---|---|
| `perf(chrome)` | Scroll position is read in the `scroll` event and written in the frame; the progress hairline animates `transform: scaleX()` instead of `width` | The old handler read `scrollY`/`scrollHeight` inside rAF, after the Descent loop's style writes, which forced a synchronous style + layout pass on every scroll frame. `width` also re-laid out the bar every frame. |
| `perf(descent)` | Ride geometry (`secTop`, `secH`) is cached in `place()`, the scroll offset comes from the scroll event; the frame loop reads no layout | `getBoundingClientRect()` at the top of each frame ran after CSS animations had dirtied style and forced a recalc. |
| `perf(build)` | `build.inlineStylesheets: 'always'` | The one render-blocking request (the 48 kB / 14 kB gz stylesheet) sat between the HTML and first paint. Costs ~14 kB gz per HTML page; GitHub Pages caches assets for only 10 minutes anyway. |

## Before → after

**Lighthouse 13.5**, performance only, median of 3 runs; mobile = default emulation (4× CPU,
slow 4G, simulated), desktop = `--preset=desktop`.

| Page | Form | Score | FCP ms | LCP ms | TBT ms | CLS | Transfer |
|---|---|---|---|---|---|---|---|
| Landing | mobile | 98 → **99** | 1509 → **1358** | 2259 → **2106** | 0 → 0 | 0 → 0 | 160 → 159 KiB |
| Landing | desktop | 100 → 100 | 407 → **364** | 487 → **447** | 0 → 0 | 0 → 0 | 160 → 159 KiB |
| Case study | mobile | 100 → 100 | 1356 → 1356 | 1356 → 1356 | 0 → 0 | 0 → 0 | 157 → 156 KiB |
| Case study | desktop | 100 → 100 | 366 → 363 | 366 → 363 | 0 → 0 | 0.003 → 0 | 157 → 156 KiB |

**Ride scroll** (60 wheel steps through the ride, Chromium trace, median of 3 paired runs against
the old build served side by side). Forced = style/layout passes triggered synchronously from JS.

| Viewport | Forced style recalcs | Forced layouts | Style + layout ms per rendered frame |
|---|---|---|---|
| Desktop 1440 × 900 | 229 → **70** | 102 → **15** | 1.61 → **0.90** |
| Mobile 375 × 812, 4× CPU | 296 → **71** | 100 → **21** | 3.59 → 3.33 |

The remaining ~70 forced recalcs are the one scroll-position read per scroll event, which
any JS-driven scroll effect needs; the ~15–21 forced layouts are the HUD station flash
(`void offsetWidth` to restart its animation, once per station change).

**Unchanged and fine:** no horizontal scroll at 320 / 375 px on either page;
`prefers-reduced-motion` switches the ride to flat mode (only the caret blink keeps running).

## Not changed — needs a decision

- **Landing LCP is set by the hero letter boot.** The LCP element is the last letter of the
  name (`animation-delay: 0.576s`); about 0.75 s of the mobile LCP is element render delay from
  that entrance, not loading. Shortening it is a motion-design call.
- **React on the landing.** `client.js` is 58 kB gz, and Lighthouse counts ~33 kB of it unused. It
  loads at idle/visible for three islands (theme switcher, constellation, project index) and does
  not block anything. Removing it would mean rewriting those islands without React.

## Caveats

- The machine was under unrelated load (load average 5–10), so millisecond numbers are noisy;
  the forced-pass counts are the robust signal.
- Headless Chromium here has no GPU (software raster), so frame intervals are not a statement
  about real devices and are not reported.

## How to re-measure

Build, `npx astro preview`, then Lighthouse via `npx lighthouse <url> --only-categories=performance`
with `CHROME_PATH` pointed at Playwright's Chromium, and a Playwright trace
(`devtools.timeline` + `disabled-by-default-devtools.timeline.stack`) while wheel-scrolling the
ride. Count `UpdateLayoutTree` / `Layout` events that carry a JS stack trace.
