---
id: 4f5a6b7c
title: Migration documentation and release guidance
created_at: 2026-03-04T16:02:00+10:30
updated_at: 2026-03-05T23:05:00+10:30
status: done
epic_id: c4d82f1a
phase_id: 5a9e2c7b
priority: medium
story_points: 3
test_coverage: partial
---

# Migration documentation and release guidance

## User Story
As a maintainer/user, I want clear migration behavior documentation so startup upgrades and preview semantics are predictable.

## Acceptance Criteria
- [x] AC1: Docs describe migration model (`Migration<From,To>[]`, index ordering, baseline `0`).
- [x] AC2: Docs explain version key behavior (`versionKey`, default `__configVersion`, persistence semantics).
- [x] AC3: Docs explain helper UX: startup latest-only, preview flag exit behavior, preview exit mode options.
- [x] AC4: Docs explain result reporting: JSON detailed payload and `pitui.notify` summary behavior.

## Context
The technical model is only useful if maintainers can implement it consistently and users understand upgrade effects.

## Out of Scope
- Localization.
- Rich media tutorials.

## Tasks
- [task-8d9e0f1a](./task-8d9e0f1a-define-docs-release-guidance.md)

## Test Specification
### E2E Tests
| AC# | Criterion | Test file/case | Status |
|---|---|---|---|
| AC1 | Core migration model documented | `tests/e2e/settings-migrate.e2e.ts::docs-migration-model` | planned |
| AC2 | Version key semantics documented | `tests/e2e/settings-migrate.e2e.ts::docs-version-key` | planned |
| AC3 | Helper UX documented | `tests/e2e/settings-migrate.e2e.ts::docs-helper-ux` | planned |
| AC4 | Reporting semantics documented | `tests/e2e/settings-migrate.e2e.ts::docs-reporting` | planned |

### Unit Test Coverage (via Tasks)
- Task [8d9e0f1a]: docs completeness checks against approved behavior contract → satisfies AC1–AC4.

## Notes
Docs must match runtime semantics exactly to avoid maintainer confusion.