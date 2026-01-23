# Validate Performance Patterns

Deep validation of performance patterns and optimizations.

## Context

This project uses:
- React 19 with React Compiler (automatic memoization)
- Vite for bundling
- Code splitting with React.lazy
- Tailwind CSS (tree-shaken)

## Execution

Launch the `application-performance:performance-engineer` agent:

```
Perform a comprehensive performance audit of /Users/voitz/Projects/brokebot/src

## Performance Checks

### 1. Bundle Size Analysis
Check for bundle bloat:

```bash
# Build and analyze
npm run build
du -sh dist/assets/*.js | sort -h
```

✅ GOOD:
- Code splitting per route
- Dynamic imports for heavy libs
- Tree-shaking working
- No duplicate dependencies

❌ BAD:
- Single large bundle
- Unused code included
- Moment.js (use date-fns/dayjs)
- Lodash full bundle (use lodash-es)

### 2. React Rendering Performance
Check for unnecessary re-renders:

✅ CORRECT (React Compiler Era):
- Let compiler handle memoization
- Stable object references naturally
- Keys on list items
- Proper component boundaries

❌ ANTI-PATTERNS:
- New objects/arrays in JSX
- Functions created in render (without compiler)
- Missing keys on lists
- Massive component trees

### 3. Data Fetching
Check fetching patterns:

✅ CORRECT:
- Parallel fetching where possible
- Caching (React Query, SWR)
- Optimistic updates
- Pagination for large lists
- Infinite scroll for feeds

❌ ANTI-PATTERNS:
- Waterfall fetching
- No caching
- Loading all data upfront
- N+1 queries

### 4. Image & Asset Optimization
Check asset handling:

✅ CORRECT:
- Lazy loading images
- Proper image sizes
- WebP/AVIF formats
- SVG for icons
- Font subsetting

❌ ANTI-PATTERNS:
- Large unoptimized images
- No lazy loading
- PNG for photos
- Loading all fonts

### 5. Code Splitting
Check splitting patterns:

✅ CORRECT:
- Route-based splitting
- Component lazy loading
- Dynamic imports for heavy features
- Preloading critical chunks

❌ ANTI-PATTERNS:
- No code splitting
- Splitting too granularly
- No preloading
- Synchronous imports for heavy libs

### 6. Memory Management
Check for memory leaks:

✅ CORRECT:
- Cleanup in useEffect
- AbortController for fetch
- Event listener cleanup
- Subscription cleanup

❌ ANTI-PATTERNS:
- No cleanup functions
- Stale closures holding refs
- Unbounded caches
- Global event listeners

### 7. Virtual Lists
For large lists, check:

✅ CORRECT:
- react-window or similar
- Proper item sizing
- Overscan for smooth scroll

❌ ANTI-PATTERNS:
- Rendering thousands of items
- No virtualization for large lists

### 8. Web Vitals
Target metrics:

| Metric | Target | What to Check |
|--------|--------|---------------|
| LCP | < 2.5s | Large images, fonts |
| FID | < 100ms | Heavy JS on load |
| CLS | < 0.1 | Layout shifts |
| INP | < 200ms | Interaction delays |

## Files to Scan

1. src/app/ - Entry points, code splitting
2. vite.config.ts - Bundle config
3. src/features/*/components/ - Large components
4. Heavy dependencies usage

## Output Format

### Bundle Analysis
| Chunk | Size | Contents | Optimization |
|-------|------|----------|--------------|
| main.js | XXkb | Core app | ✅/⚠️ |
| vendor.js | XXkb | Deps | ✅/⚠️ |

### Rendering Issues
| Component | Issue | Impact | Fix |
|-----------|-------|--------|-----|
| ... | ... | High/Med/Low | ... |

### Data Fetching Issues
| Location | Issue | Fix |
|----------|-------|-----|
| ... | ... | ... |

### Memory Leak Risks
| File | Risk | Mitigation |
|------|------|------------|
| ... | ... | ... |

### Recommendations (Priority Order)
1. [ ] High impact: ...
2. [ ] Medium impact: ...
3. [ ] Low impact: ...

### Summary
- Bundle size: XXX kb (gzipped)
- Code splitting: ✅/❌
- Memory management: ✅/❌
- Performance score: X/10
```

## Quick Checks

```bash
# Build size analysis
npm run build 2>&1 | tail -20

# Find large components that might need splitting
wc -l src/**/*.tsx | sort -rn | head -20

# Find potential memory leaks (useEffect without cleanup)
grep -rA5 "useEffect" src/ --include="*.tsx" | grep -B3 "^\s*}\s*,\s*\[" | grep -v "return"

# Find heavy imports
grep -rn "import.*from" src/ --include="*.ts" --include="*.tsx" | \
  grep -E "lodash[^-]|moment|date-fns|d3" | head -10

# Find inline object/array creation in JSX
grep -rn "={{" src/ --include="*.tsx" | head -20
```

## Performance Optimization Patterns

### Code Splitting
```typescript
// Route-based splitting
const ChatPage = lazy(() => import('./features/chat/chat-page'));

// Component-based splitting
const HeavyChart = lazy(() => import('./components/heavy-chart'));

// Preloading
const preloadChat = () => import('./features/chat/chat-page');
onMouseEnter={preloadChat}
```

### Virtualization for Large Lists
```typescript
import { FixedSizeList } from 'react-window';

function LargeList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
```

### Proper Cleanup
```typescript
useEffect(() => {
  const controller = new AbortController();
  const subscription = eventSource.subscribe(handler);

  fetchData(controller.signal);

  return () => {
    controller.abort();
    subscription.unsubscribe();
  };
}, []);
```
