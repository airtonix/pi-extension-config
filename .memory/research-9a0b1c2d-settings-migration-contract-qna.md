---
id: 9a0b1c2d
title: Settings migration contract Q&A decisions
created_at: 2026-03-05T21:52:00+10:30
updated_at: 2026-03-05T21:52:00+10:30
status: completed
epic_id: c4d82f1a
phase_id: 5a9e2c7b
---

# Settings migration contract Q&A decisions

## Research Questions
1. What is the exact migration contract shape expected by maintainer?
2. What runtime semantics are required for startup, preview, and failure behavior?
3. What reporting and documentation expectations must be encoded into stories/tasks?

## Summary
User-approved design is a typed migration array passed to `createConfigService`, with strict startup behavior and explicit maintainer helper APIs.

## Findings
### Verbatim Q&A Log
1. Question: "Should `from`/`to` be metadata or typed migration functions?"
   - User answer: typed migration functions via `type Migration<From,To> = { id, up(config:From):To, down(config:To):From }` and `createConfigService(..., { defaults, parse, migrations: [...] })`.
2. Question: version field strategy (A fixed key, B configurable key, C external tracking)
   - User answer: **B**.
3. Question: migration order strategy (A index, B id)
   - User answer: **A**.
4. Question: startup failure behavior (A fail fast, B read-only fallback, C skip)
   - User answer: **A**.
5. Question: `down` requirement (A required, B optional, C env-based)
   - User answer: **A**.
6. Question: missing version baseline (A assume 0, B assume latest, C heuristics)
   - User answer: **A**.
7. Question: load flow ordering explanation and choice
   - User answer: accepted **A** (`raw -> migrate -> merge defaults -> parse`).
8. Question: version visibility behavior
   - User answer: `exposeVersion` configurable (**C**), with internal persistence retained.
9. Question: migration purity
   - User answer: **A** (immutable/pure).
10. Question: validation strategy
    - User answer: **B** (final parse + optional per-migration validators).
11. Question: preview flag behavior
    - User answer: **A** (print plan and exit).
12. Question: preview exit code behavior
    - User answer: **C** (configurable; default always-zero).
13. Question: result payload detail level
    - User answer: **B** (detailed payload).
14. Question: startup target behavior
    - User answer: startup always latest; internal target support for tests only.

### Consolidated Approved Contract
- `createConfigService(name, { defaults, parse, migrations, versionKey?, exposeVersion? })`
- ordered `Migration<From,To>[]`, required `id/up/down`, pure functions
- array index determines version progression
- missing version defaults to `0`
- startup helper migrates to latest and fails fast
- preview helper prints plan and exits; exit mode configurable
- detailed migration result payload for JSON and notify output

## References
- User chat decisions in current planning session
- `.memory/story-1c2d3e4f-migration-contract-registry.md`
- `.memory/story-2d3e4f5a-migration-planner-executor.md`
- `.memory/story-3e4f5a6b-migration-test-strategy.md`
- `.memory/story-4f5a6b7c-migration-docs-release-guidance.md`
