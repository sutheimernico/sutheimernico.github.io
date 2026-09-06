---
title: "Tap Approve"
order: 24
status: in-progress
year: "2026"
stack: ["Python (stdlib only)", "Claude Code hooks", "Telegram Bot API", "pytest", "uv"]
summary: "A Claude Code permission hook that relays tool-approval prompts to a private Telegram bot — allow or deny from the phone, fail-closed."
role: "fail-closed by design, never run live"
featured: false
domain: agents
context: personal
reviewed: false
fieldNote: "45 tests green, ruff clean — and it has never been run against a real bot. A later code review also found the use case had moved: the directory tree it guards now runs without permission prompts at all, so the tool is code-complete for a situation that stopped existing."
---

## What it is

A local Claude Code `PermissionRequest` hook. When a tool call would otherwise open a permission
dialog on the laptop, the request goes to a private Telegram bot instead: the message shows the
tool and its input with `✅ Allow` / `❌ Deny` buttons, the tap comes back, and Claude Code applies
the decision. No server, no open port, no admin change.

Claude Code ships an official solution — the Channels permission relay — but it is gated by an
org-level setting that is off by default on Team/Enterprise accounts and can only be enabled
org-wide. A hook is a different, local mechanism that is not behind that gate.

## Architecture

One Python script, no dependencies (`dependencies = []`):

- **Guard** — hook stdin (`tool_name`, `tool_input`, `cwd`, …) is checked against a path allowlist.
  Outside the allowed root the hook emits nothing at all.
- **Ask** — `sendMessage` with an inline keyboard, carrying a short `request_id`.
- **Wait** — `getUpdates` long-polling, a 150 s budget inside the 180 s hook timeout.
- **Decide** — a verdict counts only from the pinned `chat_id` **and** the matching `request_id`;
  the decision JSON goes to stdout.

## Why it's built this way

Every failure path — timeout, offline, malformed update, broken config — exits 0 with empty stdout,
so the normal laptop prompt appears. No code path auto-allows: worst case is "walk to the laptop",
never "something ran without you". Single recipient, token only from a gitignored env file, and a
leaked token alone still cannot forge an approval, because the `request_id` gate is separate.

## Implementation

- Built test-first across seven tasks; **45 tests**, Telegram I/O injected or mocked, ruff clean.
- A dry-run harness drives the real `main()` through all nine failure-table scenarios against a fake
  transport and doubles as a test file, so a change can be sanity-checked without a bot.
- Re-reading the hook docs corrected two things the spec had wrong: the matcher for this event is a
  tool-name pattern, not the `Notification`-style event literal, and the managed policy that can
  disable user hooks entirely is `disableAllHooks`.

## Trade-offs & what I considered

- **Never wired up.** The one existential question — does `PermissionRequest` fire at all under a
  managed account's policy — is unanswered, because answering it needs a real bot and a live
  session. It is logged as such rather than assumed.
- **The use case moved.** The allowlisted tree later switched to a permission-bypass mode, so there
  are no prompts left to relay there. Re-pointing the allowed root at repos that still prompt is an
  env var, not a code change; the plan for it exists and is unexecuted.
- **Known defects, documented not hidden:** a Telegram flake *after* the tap can lose the verdict
  because the cosmetic API calls share a `try` with the decision print; a single transient error
  ends the poll instead of retrying inside the remaining budget; the HTTP wrappers have no failure
  tests of their own.

<!-- sources: /home/nicosutheimer/private/tap-approve/README.md (hook flow, 45 tests, ruff clean, dry-run scenarios, safety model, "MVP code complete, not yet wired up", org-gated Channels rationale), AUTOPILOT_LOG.md (TDD task sequence 2-7, hardening pass 34->45 tests, matcher correction, disableAllHooks, dry-run harness), docs/superpowers/specs/2026-06-30-tap-approve-design.md (PermissionRequest contract, fail-safe stdout rule, single-recipient/allowlist goals), docs/superpowers/plans/2026-07-21 re-targeting plan (150s poll budget inside 180s hook timeout, stdlib-only, verdict-loss bug, no retry in budget, untested HTTP wrappers, allowed-root env var, use case removed by bypass mode, pre-flight still open), git remote check: github.com/sutheimernico/tap-approve is PRIVATE -> no github field -->
