---
id: 8d45ab54
title: Research File Watching and Event Patterns
created_at: 2026-02-17T17:26:00+10:30
updated_at: 2026-02-17T18:42:00+10:30
status: completed
epic_id: f72d1b89
start_criteria: Epic defined
end_criteria: Research questions answered, approach selected
---

# Research: File Watching and Event Patterns

## Overview

Research Bun's file watching capabilities and determine the best approach for deferred/lazy file watching that only activates when consumers register event handlers.

## Deliverables

- [x] Document Bun file watching options
- [x] Document deferred activation pattern
- [x] Recommend approach for event emitter pattern
- [x] Identify potential edge cases

## Tasks

- [x] [task-9f885cf7-research-bun-watchers.md](./task-9f885cf7-research-bun-watchers.md) - Research Bun File Watchers
- [x] [task-71cc916a-research-event-patterns.md](./task-71cc916a-research-event-patterns.md) - Research Deferred Event Emitter Patterns

## Research Output

- [research-8109f577-file-watching-patterns.md](./research-8109f577-file-watching-patterns.md) - Consolidated findings

## Dependencies

None - this is the first phase.

## Next Steps

Proceed to **Design Phase** to define the API surface and types:
- Define TypeScript interfaces for event subscription
- Design internal architecture for deferred watcher
- Create type definitions for export

## Recommendations Summary

1. **Use `fs.watch`** - Node.js compatible, simpler lifecycle than async iterator
2. **Use EventEmitter `newListener`/`removeListener`** - Built-in deferred activation pattern
3. **Debounce with 100ms delay** - Avoid rapid-fire reloads
4. **Return unsubscribe function from `on()`** - Ergonomic API pattern
