---
title: "Claude Code Setup"
order: 32
status: internal
year: "2026"
stack: ["Claude Code", "Skills", "Agents", "Hooks"]
summary: "My own Claude Code setup of skills, agents, rules and context engineering, built for quality: tests, reviews and code I actually understand."
role: "AI-assisted, not vibe-coded"
featured: false
domain: agents
context: personal
fieldNote: "An assistant that knows the repository conventions stops being a chat window and starts being a colleague who has read the wiki. The hard part is writing the wiki so precisely that it can be followed without asking."
---

## What it is

I work with Claude Code every day, at work and on private projects, and I treat the setup as an
engineering artefact of its own: skills for recurring workflows, specialised agents for review
and research, rules that encode conventions, and deliberately curated context.

## What it is for

- **Quality over speed.** Tests for new logic, review steps before anything ships, and a rule that
  I have to understand the code that lands in a repository. This is the opposite of vibe coding.
- **Context engineering.** Instead of re-explaining a project in every session, the conventions
  live in versioned files the assistant reads first.
- **Delegation.** Research and review run in sub-agents so that only conclusions come back, and
  implementation stays under my supervision.
