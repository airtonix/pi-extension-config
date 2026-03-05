---
id: 1c2d3e4f
title: Typed migration contract in createConfigService
created_at: 2026-03-04T16:02:00+10:30
updated_at: 2026-03-05T23:23:00+10:30
status: done
epic_id: c4d82f1a
phase_id: 5a9e2c7b
priority: high
story_points: 5
test_coverage: full
---

# Typed migration contract in createConfigService

## User Story
As a maintainer, I want to provide typed migrations directly to `createConfigService` so config upgrades are explicit, deterministic, and reversible.

## Acceptance Criteria
- [x] AC1: `createConfigService("name", { defaults, parse, migrations, versionKey?, exposeVersion? })` is the canonical API shape.
- [x] AC2: `Migration<From, To>` requires `{ id, up(config: From): To, down(config: To): From }` and migrations are pure/immutable.
- [x] AC3: Migration order is array index; version is numeric (`0..n`); missing version defaults to baseline `0`.
- [x] AC4: Version key is configurable with default `__configVersion`; version remains persisted on disk.
- [x] AC5: Load flow is `raw -> migrate -> merge defaults -> parse`.
- [x] AC6: `configService.get()` hides version by default; `exposeVersion: true` exposes it.

## Context
The previous plan used abstract metadata language. The approved design is concrete and code-centric: typed migration functions in an ordered array passed into the config factory.

## Out of Scope
- Helper UX (`pitui.notify`, preview flag behavior).
- Detailed migration result payload fields.
- Test-only target-version execution API.

## Tasks
- [task-5a6b7c8d](./task-5a6b7c8d-define-migration-contract-registry-spec.md)

## Test Specification
### E2E Tests
| AC# | Criterion | Test file/case | Status |
|---|---|---|---|
| AC1 | Factory API contract accepted | `tests/e2e/settings-migrate.e2e.ts::factory-accepts-migrations-array` | planned |
| AC2 | Migration type requires id/up/down | `tests/e2e/settings-migrate.e2e.ts::migration-shape-contract` | planned |
| AC3 | Baseline 0 + index ordering | `tests/e2e/settings-migrate.e2e.ts::baseline-zero-index-order` | planned |
| AC4 | Configurable version key persisted | `tests/e2e/settings-migrate.e2e.ts::version-key-persistence` | planned |
| AC5 | Load flow ordering enforced | `tests/e2e/settings-migrate.e2e.ts::load-flow-ordering` | planned |
| AC6 | Version exposure toggle | `tests/e2e/settings-migrate.e2e.ts::expose-version-toggle` | planned |

### Unit Test Coverage (via Tasks)
- Task [5a6b7c8d]: typed migration contract and load pipeline checks → satisfies AC1–AC6.

## Notes
Ordering is structural (array index), not semantic (`id`). `id` is for observability/debugging.