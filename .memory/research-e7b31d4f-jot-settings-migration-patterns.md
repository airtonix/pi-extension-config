---
id: e7b31d4f
title: Jot settings migration patterns for reuse
created_at: 2026-03-04T15:50:00+10:30
updated_at: 2026-03-04T15:50:00+10:30
status: completed
epic_id: c4d82f1a
phase_id: 5a9e2c7b
---

# Jot settings migration patterns for reuse

## Research Questions
1. Which migration patterns in `zenobi-us/jot` are directly reusable for settings migrations?
2. Which safeguards are mandatory to avoid data loss or schema drift?
3. What planning sequence should this repo adopt before coding migrations?

## Summary
`zenobi-us/jot` shows a strong migration planning pattern: code-owned migration definitions, explicit version contracts (`from`/`to`), linear chain validation, thin-command/fat-service execution, dry-run/idempotency guarantees, and persistence-first validation to prevent config-field loss.

## Findings
- **Pattern: code-only migrations**
  - Keep migrations in code, not user-editable config scripts.
  - Benefit: deterministic execution and auditable diffs.
- **Pattern: config stores version metadata only**
  - Persist migration state as a version field (e.g. `config_version`), not full history.
- **Pattern: explicit from/to contract per migration**
  - Each migration declares both source and target versions.
  - Prevents ambiguous upgrade paths.
- **Pattern: strict linear chain validation**
  - Reject gaps and duplicates before execution.
- **Pattern: dry-run first and idempotency**
  - Plan mode previews operations and detects already-applied state.
- **Pattern: service-layer migration engine**
  - Keep command/UI surface thin; migration logic in service layer.
- **Pattern: persistence-first vertical slice**
  - Validate load/save preserves new fields before full migration rollout.

## References
- `zenobi-us/jot` `.memory/task-8281af6b-notebook-migrate-versioned-framework.md`
- `zenobi-us/jot` `.memory/research-5a6b7c8d-workflow-integration-points.md`
- `zenobi-us/jot` `.memory/learning-w4k9f2m1-jot-workflows-epic-complete.md`
- `zenobi-us/jot` `.memory/epic-6e1f2a9c-cli-config-normalization-layer.md`
