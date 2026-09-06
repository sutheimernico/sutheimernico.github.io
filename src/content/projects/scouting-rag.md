---
title: "Scouting RAG"
order: 5
status: research
year: "2026"
stack: ["Python", "RAG", "Qdrant", "BGE-M3", "Ollama", "ColQwen2"]
summary: "A cycle-gated comparison of RAG retrieval techniques on a football-scouting corpus — re-ranking earns its cost, contextual retrieval does not."
role: "one variable per cycle, verdicts published"
featured: true
domain: agents
context: personal
reviewed: false
fieldNote: "Regenerating the results table from the raw eval JSON produced an nDCG@10 of 1.02 — mathematically impossible, because the metric credited DCG to every retrieved chunk covering the same ground-truth passage without de-duplicating. It is written up rather than silently patched: the fix moves every cycle's numbers and needs a full re-run."
---

## What it is

A measured comparison study of retrieval techniques over a mixed football-scouting corpus —
283 prose analysis articles, seven season stat tables and 84 self-rendered stat sheets, about
**955,000 text tokens**. The deliverable is not "a RAG pipeline that runs" but a comparison table
with per-question-type deltas, cost and latency for every technique. Everything runs locally on
CPU, no paid APIs.

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
  documented as one.
- **Grounding is worth measuring, not assuming.** Closed book, the generator gets **0.00** of the
  post-cutoff numbers right; with naive retrieval, 0.72 (n = 18).
- **The bottleneck moved.** From cycle 3 on, retrieval kept improving while answer quality
  plateaued at 0.78 — the generator, not retrieval, is the end-to-end limit. That measurement is
  the documented reason the agentic and GraphRAG cycles were *declined* rather than built.
- 88 tests gate the harness, the metrics and the renderers.

## Trade-offs & what I considered

- **The visual cycle is inconclusive, and stays labelled that way.** Recall@5 of 0.15 (2 of 13) is a
  real number from a real run — but the ColQwen2 checkpoint loads with its language backbone
  randomly initialised (a `colpali_engine` × `transformers` module-naming drift, confirmed twice by
  inspecting the state dict). The run measured a broken model, not the technique, so the number is
  explicitly not published as a verdict on visual retrieval.
- **CPU-honest latency.** Re-ranking takes retrieval from 0.38 s to **29.6 s** per query (30
  cross-encoder passes without a GPU). Reported as measured, with the caveat that it is not
  production-representative.
- **The eval set's own weak points are on the record.** The golden set was annotated by an AI with
  a 20 % human review sample, and on a 13-item manual check the judge agreed with the strict reading
  only 7 times. Aggregates are usable; single verdicts are not.

<!-- sources: /home/nicosutheimer/private/scouting-rag/PROJECT.md (cycle table and verdicts, 59 golden queries and their types, chunking-agnostic ground truth, iron principles, n≈13-18, stack: Qdrant embedded, BGE-M3, rank_bm25, bge-reranker-v2-m3, ColQwen2, Ollama qwen2.5:7b / qwen2.5vl:7b / llama3.1:8b), README.md (deliverable framing, local CPU-only, no paid APIs), CORPUS.md (283 prose docs, 7 stat CSVs, 84 PNG stat sheets, 955,351 text tokens), results.md (Recall@5 0.60→0.67, semantic 0.87→1.00, MRR 0.52→0.63, failure@5 0.40→0.33, bootstrap 10,000 resamples and the cycle-3→4 CI [0.00,0.00], dense+rerank ≡ hybrid+rerank ablation, contextual cost ~6h for 2,127 chunks + ~100 min re-encode, closed-book number-hit 0.00 vs 0.72 at n=18, number-hit plateau 0.78 from cycle 3, latency 0.38s → 29.6s, cycle-5 Recall@5 0.15 (2/13) and the colpali_engine/transformers state-dict root cause, judge manual check 7/13 strict, nDCG@10 1.02 write-up), AUTOPILOT_LOG.md (88/88 tests green, 2026-07-02 cycle-5 run), docs/superpowers/plans/2026-07-21-close-the-study.md (nDCG bug location and fix scope, Precision@5 over-correction, golden-set 20% human review), git log first commit 2026-06-05 (year), git remote + gh repo view sutheimernico/RAG-Projekt → PRIVATE (no github link) -->
