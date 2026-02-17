---
id: b2c3d4e5
title: Design API Surface and Architecture
created_at: 2026-02-17T18:42:00+10:30
updated_at: 2026-02-17T18:42:00+10:30
status: todo
epic_id: f72d1b89
start_criteria: Research phase completed
end_criteria: API design approved, types defined, architecture documented
---

# Design: API Surface and Architecture

## Overview

Define the complete API surface, TypeScript types, and internal architecture for the event-driven ConfigService with deferred file watching.

## Deliverables

- [ ] Define TypeScript interfaces for event subscription
- [ ] Design internal class structure
- [ ] Document file watching integration points
- [ ] Create type definitions for export
- [ ] Identify implementation risks

## Tasks

_Tasks to be created after design decisions are made_

## Dependencies

- [phase-8d45ab54](./phase-8d45ab54-research-file-watching.md) - Research findings
- [research-8109f577](./research-8109f577-file-watching-patterns.md) - Consolidated research

## Key Design Decisions

Based on research, the design should:

1. **Extend existing ConfigService interface** with `on()` and `off()` methods
2. **Use EventEmitter internally** for listener management
3. **Implement deferred watching** using `newListener`/`removeListener` hooks
4. **Use `fs.watch`** for file change detection
5. **Debounce reloads** with 100ms delay

## Proposed Interface

```typescript
interface ConfigService<TConfig> {
  // Existing
  readonly config: TConfig;
  set(key: string, value: unknown, target?: 'home' | 'project'): Promise<void>;
  reload(): Promise<void>;
  save(target?: 'home' | 'project'): Promise<void>;
  
  // New
  on(event: 'change', handler: (config: TConfig) => void): () => void;
  off(event: 'change', handler: (config: TConfig) => void): void;
}
```

## Next Steps

After human review of design, proceed to Implementation Phase.
