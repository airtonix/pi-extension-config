---
id: 7c8d9e0f
title: Define migration fixture and validation matrix
created_at: 2026-03-04T16:03:00+10:30
updated_at: 2026-03-05T23:05:00+10:30
status: done
epic_id: c4d82f1a
phase_id: 5a9e2c7b
story_id: 3e4f5a6b
assigned_to: session-20260304-154750
---

# Define migration fixture and validation matrix

## Objective
Specify fixture coverage for typed migration chains, required `down`, optional per-step validators, and immutability checks.

## Related Story
[story-3e4f5a6b](./story-3e4f5a6b-migration-test-strategy.md) — contributes to AC1–AC5.

## Steps
1. Define fixtures for: no version key, intermediate version, latest version.
2. Define forward-migrate and repeated-run scenarios.
3. Define down-migrate scenarios and required `down` verification.
4. Define final parse validation + optional per-migration validator scenarios.
5. Define mutation-guard tests for `up/down` input immutability.

## Unit Tests
- `migration-fixtures.spec.ts`: fixture setup completeness → supports AC1.
- `up-repeat.spec.ts`: baseline migration and repeat/noop behavior → supports AC2.
- `down-required.spec.ts`: down contract and reverse path checks → supports AC3.
- `validator-strategy.spec.ts`: final + optional per-step validators → supports AC4.
- `immutability.spec.ts`: ensures migration functions do not mutate inputs → supports AC5.

## Expected Outcome
A complete test matrix for migration correctness and safety constraints.

## Actual Outcome
Implemented fixture/validation matrix tests in `src/migration-fixtures.test.ts`, `src/up-repeat.test.ts`, `src/down-required.test.ts`, `src/validator-strategy.test.ts`, and `src/immutability.test.ts`; then addressed review findings by adding non-cloneable immutability coverage, strict final-parse assertions, and fixture result payload assertions.

## Lessons Learned
Immutability and validator coverage are non-negotiable for migration trustworthiness.