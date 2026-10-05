---
title: "Scouting RAG"
order: 5
status: research
year: "2026"
stack: ["Python", "RAG", "Qdrant", "BGE-M3", "Ollama", "ColQwen2"]
summary: "A closed, cycle-gated comparison of RAG retrieval techniques on a football-scouting corpus — re-ranking earns its cost, contextual retrieval does not."
role: "one variable per cycle, verdicts published"
featured: true
github: https://github.com/sutheimernico/scouting-rag
domain: agents
context: personal
reviewed: false
fieldNote: "Regenerating the results table from the raw eval JSON produced an nDCG@10 of 1.02 — mathematically impossible, because the metric credited every retrieved chunk covering the same ground-truth passage. After the fix, rescored from the stored runs, only the re-ranked configurations dropped (about −0.03): re-ranking is exactly what pulls several chunks of one source into the top ten. No verdict changed — but one stated reason did, and the write-up says so."
---

## What it is

A measured comparison study of retrieval techniques over a mixed football-scouting corpus —
283 prose analysis articles, seven season stat tables and 84 self-rendered stat sheets, about
**955,000 text tokens**. The deliverable is not "a RAG pipeline that runs" but a comparison table
with per-question-type deltas, cost and latency for every technique. Everything runs locally on
CPU, no paid APIs. **The study is closed**: every text cycle has a verdict, the visual cycle is closed
without one, and two optional cycles were declined against triggers written down in advance.

## Architecture

- **Corpus and golden set first.** 59 hand-annotated queries typed `semantic | exact_match |
  multi_hop | visual` exist before any retrieval code. Ground truth is **chunking-agnostic** — a
  chunk counts as relevant if it overlaps an annotated passage — so changing the chunking strategy
  in a later cycle never invalidates the eval set.
- **One technique per cycle:** naive dense (BGE-M3 in an embedded Qdrant) → hybrid (BM25 + RRF) →
  cross-encoder re-ranking (`bge-reranker-v2-m3`) → contextual retrieval → visual late interaction
  (ColQwen2 MaxSim over the stat sheets).
- **Judge-free primary metrics** — Recall@5/10, Precision@5, MRR, nDCG@10 against the annotated
  ground truth, plus a paired percentile bootstrap (10,000 resamples) for confidence intervals.
- **A local judge as a secondary signal only** — `llama3.1:8b` for faithfulness and refusal,
  always reported next to its own measured test–retest noise; generation runs on `qwen2.5:7b`.

## Why it's built this way

The study exists to answer "which technique earns its cost", so the gates matter more than the
pipeline. Changes are never bundled — one variable per cycle, so a delta is attributable, and a
technique that cannot prove its delta is documented and dropped. Sample sizes are stated with every
claim (n ≈ 13–18 per question type, where one query moves a metric by 7–8 points) and phrased as
*indication*, not proof. Every table is generated from the raw eval JSON by a script, because the
hand-transcribed version had already drifted — regenerating it corrected Precision@5 in three rows.

## Implementation

- **Re-ranking is the recommended stack.** Global Recall@5 0.60 → **0.67**, the semantic regression
  hybrid had introduced fully healed (0.87 → 1.00), MRR 0.52 → 0.63; the bootstrap CI on the global
  delta excludes zero. An ablation showed **dense+rerank ≡ hybrid+rerank** on every metric — so the
  fusion is dropped when a re-ranker is present, one component less for the same quality.
- **Contextual retrieval: dropped.** About six hours of CPU context generation for 2,127 chunks plus
  100 minutes of re-encoding bought a bootstrap delta of exactly [0.00, 0.00]. A negative result,
  documented as one — and one whose stated reason had to change: before the nDCG fix, contextual
  looked 0.0030 *worse* under the re-ranker, after it 0.0021 *better*. Both are far below what 59
  queries can resolve, so the honest reading is "no measurable difference in either direction",
  not "measurably worse". The drop stands on cost alone.
- **Re-ranking survives the metric fix.** Its nDCG@10 gain over plain dense retrieval shrank by a
  third (0.5340 → 0.6157, +0.08) because part of it was the double-counting — and the keep/drop
  calls never rested on nDCG anyway, but on Recall@5, MRR and paired bootstrap intervals, which the
  bug did not touch.
- **Grounding is worth measuring, not assuming.** Closed book, the generator gets **0.00** of the
  post-cutoff numbers right; with naive retrieval, 0.72 (n = 18).
- **The bottleneck moved.** From cycle 3 on, retrieval kept improving while answer quality
  plateaued at 0.78 — the generator, not retrieval, is the end-to-end limit. That measurement is
  the documented reason the agentic and GraphRAG cycles were *declined* rather than built.
- 92 tests gate the harness, the metrics and the renderers, including regression tests for the
  de-duplicated nDCG.

## Trade-offs & what I considered

- **The visual cycle is inconclusive, and stays labelled that way.** Recall@5 of 0.15 (2 of 13) is a
  real number from a real run — but the ColQwen2 checkpoint loads with its language backbone
  randomly initialised (a `colpali_engine` × `transformers` module-naming drift, confirmed twice by
  inspecting the state dict). The run measured a broken model, not the technique, so the number is
  explicitly not published as a verdict on visual retrieval.
- **CPU-honest latency.** Re-ranking takes retrieval from 0.38 s to **29.6 s** per query (30
  cross-encoder passes without a GPU). Reported as measured, with the caveat that it is not
  production-representative.
- **The eval set's own weak points are on the record.** The golden set was written and annotated
  by the same AI that built the pipelines; a 20 % human review sample was prepared but never
  completed, so it counts as not independently reviewed. On a 13-item manual check the judge agreed
  with the strict reading only 7 times. Aggregates are usable; single verdicts are not.
- **A metric bug was published for weeks.** It is written up in the final synthesis rather than
  patched quietly — a study about honest measurement does not get to leave that out.
