# Validate Hook Implementations

Deep validation of custom React hooks for correctness and best practices.

## Context

This project uses:
- React 19 with React Compiler
- Custom hooks in src/hooks/ and src/features/*/hooks/

## Execution

Launch the `react-component-architect` agent:

```
Perform a comprehensive hooks audit of /Users/voitz/Projects/brokebot/src

## Hook Quality Checks

### 1. Hook Rules Compliance
Verify React Rules of Hooks:

✅ CORRECT:
- Hooks called at top level
- Hooks called in same order every render
- Hooks only in function components or custom hooks
- Custom hooks start with "use"

❌ VIOLATIONS:
- Conditional hook calls
- Hooks in loops
- Hooks in nested functions
- Hooks in class components

### 2. Effect Best Practices
Check useEffect usage:

✅ CORRECT:
- Effects for external system sync only
- Proper cleanup functions
- AbortController for fetch operations
- Race condition handling
- Dependency arrays accurate

❌ ANTI-PATTERNS:
- Effects for derived state (compute inline instead)
- Missing cleanup for subscriptions
- Missing AbortController for async
- Stale closures (missing deps)
- Object/array deps that change every render
- Fetching in effects without proper handling

Example of correct async effect:
```typescript
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    try {
      const response = await fetch(url, { signal: controller.signal });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setError(error);
      }
    }
  }

  fetchData();
  return () => controller.abort();
}, [url]);
```

### 3. State Management in Hooks
Check state patterns:

✅ CORRECT:
- useState for simple values
- useReducer for complex state
- Proper initial state (not undefined when typed)
- Lazy initialization for expensive computations

❌ ANTI-PATTERNS:
- Derived state in useState (compute inline)
- Multiple related states that should be one object
- State that should be a ref
- State synchronized from props (controlled pattern)

### 4. Memoization (React Compiler Era)
With React Compiler, check:

✅ WHEN MEMOIZATION IS STILL USEFUL:
- Expensive computations (useMemo)
- Callbacks passed to optimized children (useCallback)
- Reference equality for effects dependencies

❌ UNNECESSARY WITH COMPILER:
- Memoizing simple computations
- useCallback for event handlers
- useMemo for object/array literals

### 5. Custom Hook Design
Check custom hook quality:

✅ GOOD DESIGN:
- Single responsibility
- Clear return type (object > tuple for multiple values)
- Proper typing with generics if needed
- Handles loading/error states
- Composable with other hooks

❌ POOR DESIGN:
- Hooks that do too many things
- Returning arrays with many values
- Missing error handling
- No loading state for async
- Side effects during render

### 6. Ref Usage
Check useRef patterns:

✅ CORRECT:
- DOM element refs (useRef<HTMLElement>(null))
- Mutable values that don't trigger re-render
- Previous value tracking

❌ INCORRECT:
- Refs for state that should trigger re-render
- Refs accessed during render (before commit)
- Missing cleanup for ref callbacks

## Files to Scan

1. src/hooks/ - All shared custom hooks
2. src/features/*/hooks/ - Feature-specific hooks
3. Check for hook-like functions not in hooks/ folders

## Output Format

### Hook-by-Hook Analysis

For each custom hook:

#### `useHookName` (file:line)
- **Purpose**: What it does
- **Correctness**: ✅/⚠️/❌
- **Issues Found**:
  - Issue 1
  - Issue 2
- **Recommendations**:
  - Recommendation 1

### Critical Issues
| Hook | File:Line | Issue | Fix |
|------|-----------|-------|-----|
| ... | ... | ... | ... |

### Warnings
| Hook | Issue | Recommendation |
|------|-------|----------------|
| ... | ... | ... |

### Summary
- Hooks analyzed: N
- Critical issues: N
- Warnings: N
- Hook quality score: X/10
```

## Quick Checks

```bash
# Find custom hooks
grep -rn "^export function use\|^export const use" src/ --include="*.ts" --include="*.tsx"

# Find useEffect without cleanup
grep -rA10 "useEffect(" src/hooks/ src/features/*/hooks/ --include="*.ts" --include="*.tsx" | grep -B5 "^--$" | grep -v "return"

# Find useEffect with async
grep -rn "useEffect.*async\|useEffect.*=>" src/ --include="*.ts" --include="*.tsx"

# Find hooks with large dependency arrays (potential issue)
grep -rn "useEffect.*\[.*,.*,.*,.*,.*\]" src/ --include="*.ts" --include="*.tsx"

# Find useState with object/array initial value (might need useMemo)
grep -rn "useState(\[" src/ --include="*.ts" --include="*.tsx"
grep -rn "useState({" src/ --include="*.ts" --include="*.tsx"
```

## Hook Refactoring Patterns

### Before: Effect for Derived State
```typescript
// ❌ BAD
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ GOOD
const fullName = `${firstName} ${lastName}`;
```

### Before: Missing Cleanup
```typescript
// ❌ BAD
useEffect(() => {
  const interval = setInterval(() => tick(), 1000);
}, []);

// ✅ GOOD
useEffect(() => {
  const interval = setInterval(() => tick(), 1000);
  return () => clearInterval(interval);
}, []);
```
