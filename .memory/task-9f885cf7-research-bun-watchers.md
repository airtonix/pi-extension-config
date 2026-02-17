---
id: 9f885cf7
title: Research Bun File Watchers
created_at: 2026-02-17T17:26:10+10:30
updated_at: 2026-02-17T18:42:00+10:30
status: completed
epic_id: f72d1b89
phase_id: 8d45ab54
assigned_to: session-1739781732
---

# Research Bun File Watchers

## Objective

Understand available file watching mechanisms in Bun and their characteristics for watching JSON config files.

## Steps

- [x] Research `Bun.file().watch()` or equivalent native API
- [x] Research Node.js `fs.watch` / `fs.watchFile` compatibility in Bun
- [x] Compare debouncing needs and event coalescing
- [x] Document start/stop lifecycle for watchers
- [x] Note any cross-platform considerations

## Expected Outcome

Clear documentation of how to watch files in Bun, including:
- API for starting/stopping watchers
- Event types emitted
- Performance characteristics
- Recommended approach for this project

## Actual Outcome

### Available APIs in Bun

Bun supports Node.js-compatible file watching via:

1. **`fs.watch(path, [options], [listener])`** - Callback-based, returns `FSWatcher`
2. **`fs/promises.watch(path, [options])`** - Async iterator-based

**Note:** Bun does NOT have a native `Bun.watch()` or `Bun.file().watch()` API.

### FSWatcher API (Recommended)

```typescript
import { watch } from 'node:fs';

const watcher = watch(filePath, (eventType, filename) => {
  // eventType: 'change' | 'rename'
  // filename: string | null
});

// Methods available:
// - watcher.close()  - Stop watching
// - watcher.ref()    - Keep event loop running
// - watcher.unref()  - Allow event loop to exit
// - watcher.start()  - Start watching
```

### Event Types

- `'change'` - File contents modified
- `'rename'` - File renamed, deleted, or created

### Async Iterator API

```typescript
import { watch } from 'node:fs/promises';

const ac = new AbortController();
const watcher = watch(filePath, { signal: ac.signal });

for await (const event of watcher) {
  // event.eventType: 'change' | 'rename'
  // event.filename: string | null
}

// Stop watching
ac.abort();
```

### Debouncing Considerations

File systems may emit multiple events for a single logical change. For config files:
- Write operations often trigger multiple `change` events
- Recommend debouncing with ~100ms delay
- Use `setTimeout` + clearing pattern

### Lifecycle

1. **Start**: `watch(path)` returns FSWatcher immediately
2. **Events**: Callback invoked on file changes
3. **Stop**: `watcher.close()` releases resources

### Cross-Platform Notes

- Works on Linux, macOS, and Windows via Bun
- Behavior is consistent with Node.js `fs.watch`
- Some platforms may have slight timing differences

### Recommendation

Use **`fs.watch`** (callback-based) for this project:
- Simpler lifecycle management with `.close()`
- Easier to integrate with EventEmitter pattern
- No need for AbortController complexity

## Lessons Learned

- Bun does not have native file watching; relies on Node.js compatibility
- `fs.watch` is well-supported and works identically to Node.js
- Debouncing is essential for config file changes to avoid multiple reloads
