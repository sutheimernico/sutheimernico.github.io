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
fieldNote: "The taste model's AUC of 0.904 is leave-one-out on 69 votes with only 20 yes-cases — not the 75 and 24 the docs had claimed, because four yes-clicks were household appliances. A real overfitting risk: the vote loop that grows the anchor now exists, and a gate keeps the anchor frozen until 150 votes and an AUC of 0.85 are reached."
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

Scripts plus one small server: `scan.py` searches, judges fit, fetches images and scores taste
into a SQLite store; `rescore_fit.py` re-judges from stored ad text without hitting the site again;
the page builders render static HTML with four tabs (furniture, kitchen, fridge, buy-new) plus a
one-column phone build from the same data. A FastAPI app serves those pages with an index that
marks stale ones, and adds the two things a static page cannot: a vote button on every card and a
watch list for listings already contacted. `taste.py` embeds ad photos with `clip-ViT-B-32` and
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
- **The taste check is sampled by chance, not by the model.** Letting the light-biased anchor pick
  the test listings would have forced a "no difference" result by construction; instead a seeded
  random sample draws 12 light, 12 dark and 6 colour-neutral listings.
- **The canary had been right all along.** Its first composed message named a search job with 2 of
  6 broken pages since late August — a finding that had sat in a log nobody read.
- 289 tests plus ruff (195 before the buying-loop round); 10,058 listings and 114 runs in the store
  as of that round.

## Trade-offs & what I considered

- **No contact automation and no condition assessment.** CLIP sees style, not scratches, and the
  page says so. Requests are paced at 2.5 s, never parallel.
- **Rotating a shelf is not modelled.** A rotation heuristic would let everything "fit" somehow,
  so a piece that would only work lying down is left in the unknown block.
- **Not switched on yet.** The served page had been wired to an older output file for four weeks;
  that delivery is now repaired and verified page by page. The daily job and its alert are built
  — the alert fires only when a listing fits *and* looks right, because fit alone meant 248 hits on
  a single August scan day — but not registered, and the round lives on a feature branch that is
  not merged. That is why this is honestly "in progress" and not "production".
