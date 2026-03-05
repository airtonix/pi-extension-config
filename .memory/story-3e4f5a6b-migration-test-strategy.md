---
id: 3e4f5a6b
title: Migration validation strategy and fixtures
created_at: 2026-03-04T16:02:00+10:30
updated_at: 2026-03-05T23:05:00+10:30
status: done
epic_id: c4d82f1a
phase_id: 5a9e2c7b
priority: medium
story_points: 5
test_coverage: full
---

# Migration validation strategy and fixtures

## User Story
As a maintainer, I want fixture-backed migration validation so changes across versions stay correct and observable.

## Acceptance Criteria
- [x] AC1: Fixture matrix covers missing version, intermediate version, and latest version states.
- [x] AC2: Tests verify up-migration to latest from baseline `0` and repeated-run behavior.
- [x] AC3: Tests verify required `down` functions and down-path correctness for reversible flows.
- [x] AC4: Validation strategy supports final `parse` + optional per-migration runtime validators.
- [x] AC5: Tests verify immutable migration behavior (input object not mutated).

## Context
Given typed function migrations, test coverage must protect ordering, purity, and validation guarantees.

## Out of Scope
- Performance benchmarking.
- Migration authoring UX/editor tooling.

## Tasks
- [task-7c8d9e0f](./task-7c8d9e0f-define-test-matrix-fixtures.md)

## Test Specification
### E2E Tests
| AC# | Criterion | Test file/case | Status |
|---|---|---|---|
| AC1 | Fixture matrix completeness | `tests/e2e/settings-migrate.e2e.ts::fixture-matrix` | planned |
| AC2 | Baseline and repeat behavior | `tests/e2e/settings-migrate.e2e.ts::baseline-and-repeat` | planned |
| AC3 | Down migration contract | `tests/e2e/settings-migrate.e2e.ts::down-contract` | planned |
| AC4 | Validator behavior | `tests/e2e/settings-migrate.e2e.ts::final-and-step-validation` | planned |
| AC5 | Immutability preserved | `tests/e2e/settings-migrate.e2e.ts::migration-immutability` | planned |

### Unit Test Coverage (via Tasks)
- Task [7c8d9e0f]: fixture builders and validation/immutability checks → satisfies AC1–AC5.

## Notes
Prefer deterministic fixtures and explicit failure assertions for each invalid path.