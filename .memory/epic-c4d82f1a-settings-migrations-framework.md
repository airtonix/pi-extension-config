---
id: c4d82f1a
title: Settings Migrations Framework
created_at: 2026-03-04T15:50:00+10:30
updated_at: 2026-03-04T15:50:00+10:30
status: planning
---

# Settings Migrations Framework

## Vision/Goal
Define and implement a deterministic, versioned settings migration framework for `pi-extension-config` so configuration evolution is safe, observable, and backward-aware.

## Success Criteria
- A single migration contract exists (version metadata, migration registry, execution model).
- Migration chain validation exists (no gaps, no duplicate versions, deterministic order).
- CLI/API migration path supports planning mode (`dry-run`) before apply.
- Settings migrations are idempotent or explicitly detect already-applied state.
- Tests cover forward migration, rollback boundaries (if supported), and invalid chain failures.

## Phases
- [phase-5a9e2c7b](./phase-5a9e2c7b-settings-migration-planning.md) — Planning contract and rollout design.
- Implementation phase (pending planning approval).
- Verification and documentation phase (pending implementation).

## Dependencies
- Existing config loading/writing behavior in this repo.
- Agreement on settings version field and compatibility policy.
- Test harness support for migration scenario coverage.
