---
id: 5a6b7c8d
title: Define typed migration contract for createConfigService
created_at: 2026-03-04T16:03:00+10:30
updated_at: 2026-03-05T23:23:00+10:30
status: done
epic_id: c4d82f1a
phase_id: 5a9e2c7b
story_id: 1c2d3e4f
assigned_to: session-20260304-154750
---

# Define typed migration contract for createConfigService

## Objective
Produce implementation-ready contract details for `Migration<From, To>[]` integration into `createConfigService`.

## Related Story
[story-1c2d3e4f](./story-1c2d3e4f-migration-contract-registry.md) — contributes to AC1–AC6.

## Steps
1. Define factory options: `defaults`, `parse`, `migrations`, optional `versionKey`, optional `exposeVersion`.
2. Define `Migration<From, To>` contract with required `id`, `up`, `down`; purity/immutability requirement.
3. Define ordering/version semantics: array-index order, numeric versions, missing version => `0`.
4. Define load pipeline: `raw -> migrate -> merge defaults -> parse`.
5. Define persisted version behavior and `exposeVersion` behavior for `get()`.

## Unit Tests
- `config-factory-contract.spec.ts`: validates accepted options and type constraints → supports AC1.
- `migration-shape.spec.ts`: validates required `id/up/down` and immutability expectations → supports AC2.
- `version-semantics.spec.ts`: validates baseline `0` and index-based ordering → supports AC3.
- `version-key.spec.ts`: validates configurable persisted key + default key behavior → supports AC4.
- `load-flow.spec.ts`: validates operation order and final parse behavior → supports AC5.
- `expose-version.spec.ts`: validates hidden-by-default + opt-in exposure → supports AC6.

## Expected Outcome
A precise contract spec for implementing the typed migration factory behavior.

## Actual Outcome
Implemented migration-aware `createConfigService` in `src/config.ts` with service-level coverage in `src/config.test.ts` for baseline ordering, version-key persistence/defaults, expose-version toggle, and load-flow ordering (`raw -> migrate -> merge defaults -> parse`).

## Lessons Learned
Concrete API contracts reduce ambiguous migration behavior.