---
title: "Decor Scout"
order: 14
status: in-progress
year: "2026"
stack: ["Python", "CLIP", "sentence-transformers", "SQLite", "selectolax"]
summary: "A furniture scout for classified ads: one judgement for whether it fits, one for whether it looks right — never averaged into a single score."
role: "two judgements, never merged"
featured: false
domain: ml
context: personal
reviewed: false
fieldNote: "The taste model's AUC of 0.904 is leave-one-out on 75 votes with only 24 yes-cases — a real overfitting risk that has never been re-validated. The thumbs-up loop that would grow the anchor is still an empty table."
---

## What it is

A scout for second-hand furniture on a German classifieds site inside a 150 km radius in
north-west Germany. It answers two questions per listing and keeps them apart:
**does it fit** (measurements parsed out of the ad text, checked against the furnishing plan of
a specific flat) and **does it look right** (CLIP image similarity to the listings that were
personally voted up). A shelf that looks perfect but is 40 cm too wide sinks in the ranking — it
does not disappear. One JSON wish list is the single source of truth for the search jobs, the
price caps and the limits.

## Architecture

Scripts, not a service: `scan.py` searches, judges fit, fetches images and scores taste into a
SQLite store; `rescore_fit.py` re-judges from stored ad text without hitting the site again; the
page builders render static HTML with four tabs (furniture, kitchen, fridge, buy-new) plus a
one-column phone build from the same data. `taste.py` embeds ad photos with `clip-ViT-B-32` and
scores them against an anchor built from the votes. `passung.py` and a separate `kueche.py`
implement two different notions of "fits".

## Why it's built this way

- **Images, not text.** Taste is not in the headline — "sofa, must go" is the typical ad. CLIP
  runs locally; a vision LLM was rejected because the local option is CPU-only and the API option
  costs money.
- **Calibrated on real ad photos, not catalogue images.** Catalogue shots carry studio lighting
  that CLIP learns, and the anchor would then favour dealer stock.
- **Ranked per category.** Globally the top 15 were fitted kitchens every time, because white
  kitchen fronts look like white wardrobes.
- **A kitchen needs the opposite question.** Cabinets are modules: 60 cm too long costs nothing,
  too *short* is the expensive direction. So kitchens are judged in cabinet metres against a
  percentage of the target, not against a hard limit.

## Implementation

- The measurement parser knows labelled singles, labelled groups and bare groups. German bare
  triples follow two incompatible conventions, and both are common; only the first number is
  reliably the width. So the width stays fixed, the other two are swapped, both readings are
  tested, and a hit that survives under only one is flagged as "order guessed".
- Roughly **four in five ads state no measurements at all**. They are never discarded, only
  sorted into their own collapsed block.
- **A canary instead of silence:** a page that returns 200 with zero listings means the markup
  changed, and the run is reported as broken, never as "nothing found today".
- Three defects that only a counter-check exposed: the distance filter had always been inert (the
  regex required a word the site does not print); 872 listings were stamped with the search radius
  itself, including cities far outside it; and a pile-height limit silently discarded every rug,
  visible only in a sample of the *rejected* hits.
- 195 tests plus ruff; 10,058 listings and 114 runs in the store.

## Trade-offs & what I considered

- **No contact automation and no condition assessment.** CLIP sees style, not scratches, and the
  page says so. Requests are paced at 2.5 s, never parallel.
- **Rotating a shelf is not modelled.** A rotation heuristic would let everything "fit" somehow,
  so a piece that would only work lying down is left in the unknown block.
- **Nothing runs on a schedule yet.** All 114 scans were manual, no alert exists, and the served
  page was still wired to an older output file — the reason this is honestly "in progress" and
  not "production".

<!-- sources: /home/nicosutheimer/private/decor-scout/README.md (two judgements, measurement families, canary, kitchen cabinet metres, ~4 of 5 ads without measurements), docs/sessions/2026-08-10_0824_decor-scout-calibration-and-jobs.md (75 votes / 24 yes / AUC 0.904 leave-one-out, D1-D10, first scan), docs/sessions/2026-08-11_0012_massfenster-radius-und-tailnet.md (150 km, three defects, 41 tests at that point), docs/superpowers/plans/2026-08-30-ship-the-buying-loop.md (195 tests, 10,058 ads, 114 runs, votes table empty, stale served page, overfitting caveat), src/decor_scout/taste.py (clip-ViT-B-32) -->
