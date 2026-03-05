---
id: 8d9e0f1a
title: Define docs and release guidance for migration helpers
created_at: 2026-03-04T16:03:00+10:30
updated_at: 2026-03-05T23:05:00+10:30
status: done
epic_id: c4d82f1a
phase_id: 5a9e2c7b
story_id: 4f5a6b7c
assigned_to: session-20260304-154750
---

# Define docs and release guidance for migration helpers

## Objective
Capture maintainer-facing and user-facing documentation requirements for the approved typed migration model and helper semantics.

## Related Story
[story-4f5a6b7c](./story-4f5a6b7c-migration-docs-release-guidance.md) — contributes to AC1–AC4.

## Steps
1. Document migration model (`Migration<From,To>[]`, index ordering, baseline `0`).
2. Document version key and exposure semantics (`versionKey`, `exposeVersion`).
3. Document startup helper behavior and preview flag semantics.
4. Document detailed result payload and notify summary expectations.

## Unit Tests
- `docs-model.spec.ts`: verifies migration model sections exist and are accurate → supports AC1.
- `docs-version.spec.ts`: verifies version key/exposure documentation → supports AC2.
- `docs-helpers.spec.ts`: verifies startup/preview behavior documentation → supports AC3.
- `docs-reporting.spec.ts`: verifies JSON + notify reporting docs → supports AC4.

## Expected Outcome
Implementation-ready docs/release guidance aligned to approved runtime behavior.

## Actual Outcome
Completed docs updates in `README.md` and `RELEASE.md` covering migration model semantics, `versionKey`/`exposeVersion`, startup + preview behavior (`previewExitMode`), and JSON/notify reporting guidance.

## Lessons Learned
Docs are part of migration correctness; ambiguous docs create operational failures.