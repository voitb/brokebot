# Validate React Patterns

Deep validation of React patterns against React 19 state-of-the-art practices.

## Context

This project uses:
- React 19.2 with React Compiler (automatic memoization)
- React Router v7
- Radix UI primitives
- React Hook Form + Zod

## Execution

Launch the `react-principles` agent:

```
Perform a comprehensive React 19 best practices audit of /Users/voitz/Projects/brokebot/src

## React 19 Specific Checks

### 1. React Compiler Compatibility
The project uses babel-plugin-react-compiler. Check for:

✅ PATTERNS THAT WORK WELL:
- Pure components without manual memoization
- Stable object/array references in JSX
- Event handlers defined inline (compiler optimizes)
- Computed values inline (not in useMemo)

❌ PATTERNS THAT CONFLICT:
- Manual React.memo() wrapping (unnecessary)
- useCallback for simple handlers (unnecessary)
- useMemo for static data (should be module-level const)
- Refs to mutable objects that change during render

### 2. New React 19 Features
Check adoption of:
- `use()` hook for promise/context reading
- `useTransition` for non-blocking updates
- `useOptimistic` for optimistic UI
- `useFormStatus` for form state
- `useActionState` for server actions
- Direct ref prop (no forwardRef needed)
- Document metadata in components

### 3. Deprecated Patterns to Flag
- forwardRef (use ref prop directly in React 19)
- defaultProps (use default parameters)
- propTypes (use TypeScript)
- Legacy context API
- String refs
- findDOMNode
- ReactDOM.render (use createRoot)

### 4. Event Handling
Check for:
- handle* naming convention
- Proper event types (React.MouseEvent, etc.)
- No inline arrow functions for frequently rendered lists
- Proper form submission handling

### 5. State Management
Check for:
- Appropriate state location (local vs lifted vs context)
- No derived state in useState (compute inline)
- useReducer for complex state
- Proper context usage (not overused)

### 6. Effects
Check for:
- Effects only for synchronization with external systems
- No effects for derived data
- Proper cleanup functions
- AbortController for fetch operations
- Race condition handling

### 7. Suspense & Error Boundaries
Check for:
- Suspense boundaries for lazy components
- Error boundaries for graceful failure
- Loading states for async operations

## Files to Scan

Priority order:
1. src/app/ - Entry points, providers, routes
2. src/features/*/components/ - Feature components
3. src/components/ - Shared components
4. src/hooks/ - Check if hooks follow React rules

## Shadcn Component Exclusions

**Skip `src/components/ui/`** from React pattern validation except custom components.

Shadcn components may legitimately use:
- forwardRef (Radix UI requirement)
- Different patterns than project conventions

Only validate custom UI components: auto-size-textarea, copy-button, input-dialog, loading-dots, logo, provider-icons, route-loading-fallback, sidebar (custom), sonner, status-indicator, truncated-text

## Output Format

Return findings as:

### Critical (Must Fix)
| File:Line | Issue | React 19 Best Practice |
|-----------|-------|----------------------|
| ... | ... | ... |

### Warnings (Should Fix)
| File:Line | Issue | Recommendation |
|-----------|-------|----------------|
| ... | ... | ... |

### Opportunities (Could Improve)
| File:Line | Current | React 19 Alternative |
|-----------|---------|---------------------|
| ... | ... | ... |

### Summary
- Files scanned: N
- Critical issues: N
- Warnings: N
- React 19 adoption score: X/10
```

## Quick Grep Checks

Run these to find common issues:

```bash
# Find forwardRef usage (deprecated pattern)
grep -rn "forwardRef" src/ --include="*.tsx"

# Find React.memo usage (often unnecessary with Compiler)
grep -rn "React.memo\|memo(" src/ --include="*.tsx"

# Find defaultProps (should use default params)
grep -rn "defaultProps" src/ --include="*.tsx"

# Find useMemo with empty deps (should be module const)
grep -rn "useMemo.*\[\]" src/ --include="*.tsx" --include="*.ts"

# Find useCallback with empty deps (likely unnecessary)
grep -rn "useCallback.*\[\]" src/ --include="*.tsx" --include="*.ts"

# Find useEffect without cleanup for async
grep -rA5 "useEffect.*async" src/ --include="*.tsx" --include="*.ts"
```

## React 19 Migration Checklist

After validation, ensure:
- [ ] No forwardRef (use ref prop)
- [ ] No defaultProps (use default params)
- [ ] useTransition for async state
- [ ] Suspense boundaries for code splitting
- [ ] Error boundaries at feature level
- [ ] No unnecessary memoization
