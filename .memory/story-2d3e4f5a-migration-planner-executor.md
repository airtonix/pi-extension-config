---
id: 2d3e4f5a
title: Maintainer migration helpers and execution semantics
created_at: 2026-03-04T16:02:00+10:30
updated_at: 2026-03-05T22:59:00+10:30
status: done
epic_id: c4d82f1a
phase_id: 5a9e2c7b
priority: high
story_points: 8
test_coverage: full
---

# Maintainer migration helpers and execution semantics

## User Story
As a maintainer, I want convenience helpers for startup migration, JSON reporting, pitui notifications, and preview mode so user experience is policy-controlled but easy to wire.

## Acceptance Criteria
- [x] AC1: `runUpMigrationsOnSessionStart(...)` migrates to latest only and fails fast on migration error.
- [x] AC2: Internal `runMigrations({ targetVersion })` exists for tests/dev tooling (not required for normal startup path).
- [x] AC3: `getMigrationResultJson(result)` returns a detailed result payload (per-step status, timing, warnings, failure context).
- [x] AC4: `notifyMigrationResult(result, pitui)` provides concise human-readable outcome via `pitui.notify`.
- [x] AC5: `registerMigrationPreviewFlag(...)` prints preview plan and exits immediately.
- [x] AC6: Preview exit behavior is configurable (`previewExitMode: 'always-zero' | 'pending-nonzero'`, default `always-zero`).

## Context
Maintainer owns UX policy. Helpers should reduce boilerplate while preserving strict migration behavior.

## Out of Scope
- Interactive remediation flows.
- Automatic rollback on failure.
- Arbitrary target selection in startup convenience helper.

## Tasks
- [task-6b7c8d9e](./task-6b7c8d9e-define-planner-executor-spec.md)

## Test Specification
### E2E Tests
| AC# | Criterion | Test file/case | Status |
|---|---|---|---|
| AC1 | Startup migrates latest + fails fast | `tests/e2e/settings-migrate.e2e.ts::startup-latest-failfast` | planned |
| AC2 | Internal target-version path available | `tests/e2e/settings-migrate.e2e.ts::internal-target-version` | planned |
| AC3 | Detailed JSON result shape | `tests/e2e/settings-migrate.e2e.ts::detailed-result-json` | planned |
| AC4 | pitui notify output emitted | `tests/e2e/settings-migrate.e2e.ts::pitui-notify-summary` | planned |
| AC5 | Preview flag exits after plan | `tests/e2e/settings-migrate.e2e.ts::preview-exit-after-plan` | planned |
| AC6 | Preview exit mode configurable | `tests/e2e/settings-migrate.e2e.ts::preview-exit-mode` | planned |

### Unit Test Coverage (via Tasks)
- Task [6b7c8d9e]: helper behavior and result-contract checks → satisfies AC1–AC6.

## Notes
The startup helper intentionally excludes arbitrary target selection to avoid partial-upgrade drift.