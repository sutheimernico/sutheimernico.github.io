---
title: "Scouting RAG"
order: 2
status: research
year: "2025"
stack: ["Python", "RAG", "LLM", "Vector DB"]
summary: "Grounded Q&A over scouting data — retrieval, re-ranking, and answers you can trust."
role: "in-progress experiment"
featured: true
# github: https://github.com/...   # fill in if/when public
---

## What it is

A retrieval-augmented assistant that answers questions over football scouting data. Ask it
about players, profiles, or patterns and it answers from the actual scouting corpus — with
citations — instead of from whatever the model happened to memorize. A personal research
project, in progress, written in Python.

## Architecture

A retrieval pipeline that grounds an LLM in real data rather than letting it free-associate:

- **Ingest & normalize** — scouting data is pulled in and conformed to a consistent shape so
  downstream steps don't have to special-case every source.
- **Embeddings** — normalized chunks are embedded into a vector space that captures meaning,
  not just keywords.
- **Vector retrieval** — a query fetches the candidate chunks most semantically relevant to
  the question.
- **Re-ranking** — candidates are reordered by a sharper relevance signal, so the strongest
  evidence reaches the model, not just the cheapest-to-retrieve.
- **Grounded answer** — the LLM answers *from* the retrieved context and cites it, so claims
  are checkable against a source.

## Why it's built this way

The point of the project is verifiability. A raw LLM will answer confidently whether or not it
knows — that's a non-starter for scouting decisions. Grounding the model in retrieved evidence
turns "trust me" into "here's where this came from." The two-stage retrieval (cheap vector
recall, then precise re-ranking) is the standard answer to RAG's core tension: cast a wide net
first, then be strict about what actually informs the answer.

## Implementation

- **Python** throughout — the natural home for the embedding and ML tooling.
- **Retrieval as the contract.** The LLM is deliberately the last and least-trusted step;
  most of the engineering is in getting the *right* context in front of it.
- **Citations by construction.** Answers carry the chunks they were built from, so a wrong
  answer is debuggable — you can see whether retrieval or the model failed.

## Trade-offs & what I considered

- **RAG over fine-tuning.** Fine-tuning bakes knowledge into weights and goes stale the moment
  the data changes; retrieval keeps the corpus as the source of truth, so updating the data
  updates the answers — no retraining.
- **Re-ranking adds latency and cost.** Accepted on purpose: in a scouting context, a slower
  but well-grounded answer beats a fast confident guess.
- **Chunking is the quiet hard problem.** Chunk too large and retrieval gets noisy; too small
  and you lose context. Still being tuned — this is research, not a finished product.

_(draft — Nico to refine)_
