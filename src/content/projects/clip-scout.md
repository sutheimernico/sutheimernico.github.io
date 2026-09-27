---
title: "Clip Scout"
order: 13
status: production
year: "2026"
stack: ["Python", "Claude CLI", "edge-tts", "FFmpeg", "SQLite", "FastAPI"]
summary: "A daily pipeline that writes, narrates and renders German short-form videos from licensed imagery — and stops one step short of posting."
role: "semi-automatic on purpose"
featured: false
domain: agents
context: personal
reviewed: false
fieldNote: "The ledger has a `posted` state and no row has ever reached it. Every push now carries two buttons, posted or discarded, collected by polling without a webhook — and the ledger still holds zero confirmed posts. Until someone taps, everything after the video leaves the machine stays unmeasured."
---

## What it is

A short-video factory for two German TikTok channels. Every run picks a topic, writes a
persona-targeted script, sources real licensed imagery, synthesises a voiceover with word-level
timings, renders a subtitled 9:16 video of 61–115 seconds, runs hard QA gates, and delivers the
finished package to a phone. It never posts: **posting stays a manual two-minute step**, because
TikTok does not permit unaudited automated publishing and a banned account ends the project
before it starts. Two channels run on Windows scheduled tasks — astronomy at 07:12 and 18:00, a
trend channel at 15:00.

## Architecture

Stages, each a module behind a provider seam so tests never touch the network:
`topics` (news feeds, evergreen catalogue, ledger dedup) → `writer` (headless `claude -p`,
JSON-schema-validated script, a second pass as copy editor) → `assets` (NASA/ESA/Wikimedia
fetch with licence and credit tracked) → `voice` (edge-tts with word boundaries) → `render`
(static FFmpeg build, Ken-Burns shots, libass subtitles) → `qa` → `deliver` (token-gated FastAPI
page plus Telegram) → `ledger` (SQLite). Personas, target audience and image sources are
per-channel config, not global constants.

## Why it's built this way

Local and free only, and no TikTok automation of any kind — those two constraints decided most
of the design. Real, licensed imagery over generated visuals keeps the channel on the safe side
of monetisation rules; AI images are allowed only as a complement, never in the majority, and
disclosed in the caption. Everything expensive is a decision recorded with its reason: the
script model is the existing Claude seat because script quality is the success factor, and a
local CPU-only model would have been the cheaper wrong answer.

## Implementation

- **Root causes over patches.** German compounds came out mangled ("Punktgenau" → "Ponktgeno").
  The cause was the *multilingual* voice; switching to a monolingual German voice at +25 % rate
  removed the whole error class and emptied the pronunciation-fix table.
- **Assumptions get measured.** Subtitles were built as image overlays to avoid a suspected
  missing FFmpeg filter. The suspicion was checked, found false, and subtitles moved to libass —
  karaoke highlighting, real wrapping, one filter instead of one overlay per chunk.
- **Two defects only real runs could show.** German Wikipedia trends are mostly *people*, so a
  biography filter now runs fail-closed after a category query silently returned an error payload
  and filtered nothing. And Wikimedia answered every image request with 429 because the code
  requested unscaled originals instead of cached thumbnail sizes.
- **A triple re-send was one line.** A buffer video pushed to the phone kept its `buffered`
  status, so it was sent again — and the buffer piled up to 24 videos on one channel. Marking
  everything that reaches the phone as delivered fixed both at the cause. The plan's literal fix
  (skip evening production once the buffer is full) would have replaced about 24 evenings of
  fresh videos with three-week-old ones, and was deliberately not built.
- **Gates calibrated against logged evidence, not a formula.** The brightness gate had rejected
  17 evening renders in five weeks; replayed against those real verdicts, the new per-channel
  limits pass 11 of them, and the other 6 now go through a retry chain instead of ending the
  evening in silence.
- 306 tests plus ruff gate every commit (243 before the stabilisation round, which sits on a
  feature branch that is not merged yet); audio is normalised to a measured −15.0 LUFS with the
  music bed side-chain-ducked under the voice.

## Trade-offs & what I considered

- **Semi-automatic publishing** was chosen over browser automation. It costs two minutes a day
  and keeps the account alive.
- **Still publish-blind in practice.** The ways in exist now: the posted/discarded buttons, and an
  importer for the creator-studio CSV export that maps rows to videos by date and caption
  similarity and reports an ambiguous match instead of guessing. Neither has seen real input — no
  button has been pressed, and no real export was available to test the importer against. A known
  gap with a built path, not a solved problem.
- **Topic selection takes the first fitting candidate, not the best.** Scripts already get a
  jury; trend topics do not. It is documented as the largest quality lever and deliberately left
  open, because it is a design decision rather than a bug fix.

<!-- sources: /home/nicosutheimer/private/clip-scout/README.md, PROJECT.md (D1-D18, architecture, acceptance), PLAN.md (phases, H1-H2a), docs/sessions/2026-08-12_0032_tagesfutter-channel-and-throttling.md (243 tests, biography filter, Wikimedia 429, scheduled tasks 07:12/18:00/15:00, delivered_at gap), docs/adr/0004-libass-subtitles.md, state/clip_scout.db read-only on 2026-09-27 (0 rows with status 'posted'; post_state: 87 unknown-legacy + 1 NULL, no button press), branch feat/stabilize-and-measure @ 2bdda01 (not merged): docs/superpowers/plans/2026-08-30-stabilize-and-measure.md Outcome 2026-09-20 (306 passed / 1 skipped, baseline 243/1; A1 17 brightness rejections 08-12..09-18, 11 of 17 now pass, 6 to retry chain; A2 root cause status stayed 'buffered', astro held 24 buffered videos, BUFFER_TARGET deviation ~24 evenings; B1 inline buttons via getUpdates, no webhook; C1 CSV importer ±3 days + caption similarity ≥ 0.60, ambiguous reported, no real export tested) -->
