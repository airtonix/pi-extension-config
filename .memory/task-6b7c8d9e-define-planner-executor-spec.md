---
id: 6b7c8d9e
title: Define maintainer helper and execution contracts
created_at: 2026-03-04T16:03:00+10:30
updated_at: 2026-03-05T22:59:00+10:30
status: done
epic_id: c4d82f1a
phase_id: 5a9e2c7b
story_id: 2d3e4f5a
assigned_to: session-20260304-154750
---

# Define maintainer helper and execution contracts

## Objective
Define implementation-ready behavior for startup migration helper, preview mode, JSON output, and notification output.

## Related Story
[story-2d3e4f5a](./story-2d3e4f5a-migration-planner-executor.md) — contributes to AC1–AC6.

## Steps
1. Define `runUpMigrationsOnSessionStart` behavior: latest-only + fail-fast.
2. Define internal `runMigrations({ targetVersion })` behavior for tests/dev-only.
3. Define detailed `MigrationResult` payload contract for JSON.
4. Define `notifyMigrationResult(result, pitui)` summary rules.
5. Define preview flag behavior: print plan + immediate exit.
6. Define preview exit mode option defaults and non-default behavior.

## Unit Tests
- `startup-helper.spec.ts`: latest-only and fail-fast behavior → supports AC1.
- `internal-target.spec.ts`: target-version path available for tests/dev → supports AC2.
- `result-json.spec.ts`: detailed payload contract and fields → supports AC3.
- `notify-output.spec.ts`: pitui notification summary correctness → supports AC4.
- `preview-flag.spec.ts`: preview prints plan and exits → supports AC5.
- `preview-exit-mode.spec.ts`: exit mode options and defaults → supports AC6.

## Expected Outcome
Implementation-ready helper and execution semantics contract.

## Actual Outcome
Implemented in `src/migrations.ts` with unit coverage in `src/migrations.test.ts` and `src/index.test.ts`.

## Lessons Learned
Maintainer helpers must be strict by default and flexible only where explicitly intended.