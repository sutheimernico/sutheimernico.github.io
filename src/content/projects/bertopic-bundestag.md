---
title: "Bundestag Topic Modelling"
order: 28
status: research
year: "2026"
stack: ["Python", "BERTopic", "UMAP", "HDBSCAN", "sentence-transformers", "pandas", "Jupyter"]
summary: "University project (Hochschule Osnabrück, March 2026): BERTopic topic modelling on Bundestag proceedings pulled from the DIP API, across two legislative periods."
role: "university project, exploratory analysis"
featured: false
github: https://github.com/sutheimernico/Big-Data-BERTopic
domain: ml
context: personal
reviewed: false
fieldNote: "The repository documents the pipeline thoroughly and ships the cached data and outputs, but states no headline numbers. The README itself calls the approach exploratory: topics are data-driven clusters, not official policy areas."
---

## What it is

A coursework project for a Big Data module at Hochschule Osnabrück (March 2026): structure a large
set of parliamentary proceedings (*Vorgänge*) automatically, show which topics dominate a
legislative period, and compare two periods — the 19th (2017-10-24 to 2021-10-26) and the 20th
(2021-10-26 to 2025-03-25). The data comes from the official DIP API of the Bundestag. The code
and outputs are public; documentation is in German.

## Architecture

A notebook pipeline in three blocks. **Collection:** proceedings are fetched from the DIP API with
cursor pagination, filtered by legislative period and date, and cached locally as Parquet, with the
cache keyed by resource, period and date range. **Modelling:** title, abstract and subject area are
joined into one text per proceeding, cleaned, embedded with the multilingual
`paraphrase-multilingual-MiniLM-L12-v2` model, reduced with UMAP, clustered with HDBSCAN and
described by BERTopic. **Evaluation and plots:** topic overviews, outlier rates, UMAP projections,
keyword shares per topic and monthly trends for selected themes (Corona, AI, the war in Ukraine).

## Why it's built this way

- **HDBSCAN, because the number of topics is unknown** in advance, and it can leave documents
  unassigned as outliers instead of forcing them into a cluster.
- **Two text variants:** one lightly cleaned for the embedding model, one token-based with stop
  words removed for the topic-word representation, since the two steps need different input.
- **Cache first.** Raw API responses are stored, so re-runs for the same periods need no API token.

## Implementation

- A grid search over UMAP neighbours (30, 40, 50) and components (3, 5, 7) and HDBSCAN minimum
  cluster size (250, 300, 350) runs before the final model; candidates are compared on a
  UMass-style coherence score and the outlier rate.
- Documents with fewer than four tokens after cleaning are dropped before clustering.
- Retry logic with waits handles HTTP 429 and 503 from the API.
- Themes across the two periods are matched by keyword overlap rather than by topic ID, because
  topic numbers are not comparable between separately trained models.

## Trade-offs & what I considered

- **Outliers are reported, not hidden.** A higher outlier rate can mean heterogeneous data, not a
  worse model; post-hoc outlier reduction is implemented but switched off.
- **Topics are interpretation, not fact.** Labels come from keywords, and the README says so.
- **Coursework scope.** It is an exploratory analysis with no external validation of the topics.
