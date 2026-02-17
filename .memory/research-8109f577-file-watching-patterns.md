---
id: 8109f577
title: File Watching and Event Patterns Research
created_at: 2026-02-17T18:42:00+10:30
updated_at: 2026-02-17T18:42:00+10:30
status: completed
epic_id: f72d1b89
phase_id: 8d45ab54
---

# Research: File Watching and Event Patterns

## Research Questions

1. What file watching APIs are available in Bun?
2. How can we implement deferred/lazy file watching?
3. What's the best pattern for event emitter integration?

## Summary

Bun supports Node.js-compatible file watching via `fs.watch`. Combined with EventEmitter's `newListener`/`removeListener` events, we can implement a clean deferred file watching pattern that starts watching only when consumers subscribe to `change` events.

## Findings

### File Watching in Bun

**Recommended API**: `fs.watch` (callback-based)

```typescript
import { watch } from 'node:fs';

const watcher = watch(filePath, (eventType, filename) => {
  // Handle change
});

watcher.close(); // Stop watching
```

- Event types: `'change'` (content modified) and `'rename'` (file operations)
- Requires debouncing (~100ms) to coalesce rapid events
- Cross-platform compatible

### Deferred Activation Pattern

Leverage EventEmitter's built-in lifecycle events:

```typescript
class ConfigWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;

  constructor() {
    super();
    
    // Start watching on first listener
    this.on('newListener', (event) => {
      if (event === 'change' && this.listenerCount('change') === 0) {
        this.startWatching();
      }
    });
    
    // Stop watching when no listeners remain
    this.on('removeListener', (event) => {
      if (event === 'change' && this.listenerCount('change') === 0) {
        this.stopWatching();
      }
    });
  }
}
```

### Recommended API Surface

```typescript
interface ConfigService<T> {
  readonly config: T;
  set(key: string, value: unknown, target?: 'home' | 'project'): Promise<void>;
  reload(): Promise<void>;
  save(target?: 'home' | 'project'): Promise<void>;
  
  // NEW: Event methods
  on(event: 'change', handler: (config: T) => void): () => void;
  off(event: 'change', handler: (config: T) => void): void;
}
```

**Key Design Decisions:**
- `on()` returns an unsubscribe function for ergonomic cleanup
- Only `'change'` event supported initially (keep it simple)
- Debounce config reloads with 100ms delay

## References

- Node.js fs.watch documentation
- EventEmitter newListener/removeListener events
- Bun Node.js compatibility layer
