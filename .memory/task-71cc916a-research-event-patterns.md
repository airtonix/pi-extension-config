---
id: 71cc916a
title: Research Deferred Event Emitter Patterns
created_at: 2026-02-17T17:26:20+10:30
updated_at: 2026-02-17T18:42:00+10:30
status: completed
epic_id: f72d1b89
phase_id: 8d45ab54
assigned_to: session-1739781732
---

# Research Deferred Event Emitter Patterns

## Objective

Design a pattern where file watching is only activated when consumers register event handlers via `configService.on('change', ...)`, and deactivated when no listeners remain.

## Steps

- [x] Document standard EventEmitter pattern in TypeScript/Bun
- [x] Design lazy initialization pattern for watcher
- [x] Consider listener counting for start/stop lifecycle
- [x] Handle edge cases: multiple listeners, rapid on/off, cleanup
- [x] Consider `once()` variant for single-shot listeners

## Expected Outcome

A documented pattern for:
1. Tracking listener count
2. Starting watcher on first listener
3. Stopping watcher when listener count reaches zero
4. Thread-safe / async-safe considerations

## Actual Outcome

### EventEmitter in Bun

Bun fully supports Node.js EventEmitter:

```typescript
import { EventEmitter } from 'node:events';

const emitter = new EventEmitter();
emitter.on('change', handler);     // Add listener
emitter.off('change', handler);    // Remove listener
emitter.once('change', handler);   // Single-shot listener
emitter.listenerCount('change');   // Count listeners
```

### Built-in Lifecycle Events

EventEmitter emits special events we can leverage:

```typescript
emitter.on('newListener', (eventName, listener) => {
  // Fired BEFORE listener is added
  if (eventName === 'change' && emitter.listenerCount('change') === 0) {
    startWatcher();  // First listener being added
  }
});

emitter.on('removeListener', (eventName, listener) => {
  // Fired AFTER listener is removed
  if (eventName === 'change' && emitter.listenerCount('change') === 0) {
    stopWatcher();  // Last listener removed
  }
});
```

### Recommended Implementation Pattern

```typescript
import { EventEmitter } from 'node:events';
import { watch, type FSWatcher } from 'node:fs';

type ConfigChangeHandler<T> = (config: T) => void;

class DeferredConfigWatcher<T> extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private filePaths: string[];
  private debounceTimer: Timer | null = null;
  
  constructor(filePaths: string[]) {
    super();
    this.filePaths = filePaths;
    this.setupLifecycleHooks();
  }
  
  private setupLifecycleHooks(): void {
    this.on('newListener', (event) => {
      if (event === 'change' && this.listenerCount('change') === 0) {
        this.startWatching();
      }
    });
    
    this.on('removeListener', (event) => {
      if (event === 'change' && this.listenerCount('change') === 0) {
        this.stopWatching();
      }
    });
  }
  
  private startWatching(): void {
    // Watch all config file paths
    // Implementation watches each file
  }
  
  private stopWatching(): void {
    this.watcher?.close();
    this.watcher = null;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}
```

### API Design for ConfigService

```typescript
interface ConfigService<T> {
  readonly config: T;
  
  // Existing methods
  set(key: string, value: unknown, target?: 'home' | 'project'): Promise<void>;
  reload(): Promise<void>;
  save(target?: 'home' | 'project'): Promise<void>;
  
  // NEW: Event subscription
  on(event: 'change', handler: (config: T) => void): () => void;
  off(event: 'change', handler: (config: T) => void): void;
}
```

**Note:** The `on()` method returns an unsubscribe function for convenience.

### Edge Cases Handled

1. **Multiple listeners**: `listenerCount()` tracks accurately
2. **Rapid on/off**: `newListener`/`removeListener` events fire correctly
3. **`once()` listeners**: EventEmitter handles automatically, removeListener fires after single invocation
4. **Cleanup**: Provide explicit `destroy()` or rely on `off()` for all listeners

### Debouncing Strategy

```typescript
private handleFileChange(): void {
  if (this.debounceTimer) {
    clearTimeout(this.debounceTimer);
  }
  
  this.debounceTimer = setTimeout(async () => {
    this.debounceTimer = null;
    await this.reload();
    this.emit('change', this.config);
  }, 100); // 100ms debounce
}
```

### Thread Safety

JavaScript is single-threaded, so no explicit locking needed. However:
- File read operations should be atomic (read entire file, not partial)
- Debouncing ensures async reload completes before next change processed

## Lessons Learned

- EventEmitter's `newListener`/`removeListener` events are ideal for deferred initialization
- `listenerCount()` provides accurate tracking without manual bookkeeping
- Debouncing is essential to avoid rapid-fire reloads on file save operations
- Return unsubscribe function from `on()` for ergonomic API
