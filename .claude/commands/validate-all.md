# Validate All - Master Workflow

Comprehensive validation workflow that runs all validators to ensure your project follows state-of-the-art practices.

## Overview

This workflow orchestrates multiple specialized validators to check:
- React 19 patterns and best practices
- TypeScript implementation quality
- Hook implementations
- Component architecture
- Testing patterns
- Performance considerations

## Execution

Run validators **IN PARALLEL** for maximum efficiency:

### Phase 1: Static Analysis (Parallel)

Launch these agents simultaneously:

#### 1. React Patterns Validator (`react-principles`)
```
Validate React patterns in /Users/voitz/Projects/brokebot/src against React 19 best practices:

CHECK FOR:
✅ CORRECT PATTERNS:
- Server Components usage where applicable
- useTransition for async state updates
- use() hook for data fetching (React 19)
- Proper Suspense boundaries
- No manual memoization where React Compiler handles it
- Event handler naming: handle* prefix
- Static data as module-level constants (not useMemo with empty deps)

❌ ANTI-PATTERNS TO FLAG:
- useCallback/useMemo with empty deps for static data
- forwardRef usage (deprecated in React 19, use ref prop directly)
- Legacy context patterns
- Class components
- String refs
- findDOMNode usage
- UNSAFE_* lifecycle methods
- defaultProps on function components (use default params)

SCAN:
- src/features/*/components/
- src/components/
- src/app/

Return: List of violations with file:line and suggested fix
```

#### 2. TypeScript Quality Validator (`typescript-pro`)
```
Validate TypeScript implementation quality in /Users/voitz/Projects/brokebot/src:

CHECK FOR:
✅ CORRECT PATTERNS:
- Strict type safety (no implicit any)
- Proper generic constraints
- Discriminated unions for state
- Type guards with `is` keyword
- `satisfies` for type checking without widening
- Const assertions where appropriate
- Proper module augmentation
- Zod schema inference (z.infer<typeof schema>)

❌ ANTI-PATTERNS TO FLAG:
- `as any` casts
- `as unknown as T` double casts
- `@ts-ignore` or `@ts-expect-error` without justification
- Non-null assertions (!) without good reason
- Type assertions that could be type guards
- `object` or `{}` types (should be `Record<string, unknown>`)
- Index signatures where Map would be better
- Overuse of enums (prefer const objects with `as const`)

SCAN: All .ts and .tsx files in src/

Return: Violations categorized by severity (critical/warning/info)
```

#### 3. Hooks Implementation Validator (`react-component-architect`)
```
Validate custom hook implementations in /Users/voitz/Projects/brokebot/src:

CHECK FOR:
✅ CORRECT PATTERNS:
- Single responsibility principle
- Proper cleanup in useEffect
- AbortController for fetch cancellation
- Stable references returned (using useCallback only when needed)
- Proper dependency arrays
- Custom hooks extract reusable logic
- Hooks return typed objects, not arrays (unless intentional tuple)
- Proper error boundaries integration

❌ ANTI-PATTERNS TO FLAG:
- useEffect for derived state (should be computed inline)
- Missing cleanup functions
- Stale closure issues
- Over-memoization (React Compiler handles this)
- Hooks with side effects in render
- Hooks that do too many things
- Missing AbortController for async operations
- Infinite loops from bad dependencies

SCAN:
- src/hooks/
- src/features/*/hooks/

Return: Per-hook analysis with recommendations
```

#### 4. Component Architecture Validator (`code-architect`)
```
Validate component architecture in /Users/voitz/Projects/brokebot/src:

CHECK FOR:
✅ CORRECT PATTERNS:
- Single responsibility components
- Composition over configuration
- Render props or children for flexibility
- Proper prop drilling avoidance (context or composition)
- Colocation of related code
- Proper loading/error/empty states
- Accessible components (aria-*, role)

❌ ANTI-PATTERNS TO FLAG:
- God components (>300 lines)
- Prop drilling >3 levels
- Business logic in presentational components
- Inline styles (should use Tailwind)
- Direct DOM manipulation
- Components with mixed concerns
- Missing error boundaries
- Missing loading states

SCAN:
- src/components/
- src/features/*/components/

Return: Component health report with refactoring suggestions
```

### Phase 2: Runtime Analysis

#### 5. Test Coverage Validator (`unit-testing:test-automator`)
```
Analyze test coverage and quality in /Users/voitz/Projects/brokebot:

CHECK FOR:
✅ CORRECT PATTERNS:
- Tests describe behavior, not implementation
- Proper async/await in tests
- User-centric testing (Testing Library)
- Proper mock isolation
- Factory functions for test data
- Edge case coverage
- Error state testing

❌ ANTI-PATTERNS TO FLAG:
- Testing implementation details
- Snapshot abuse
- Missing async handling (act warnings)
- Type assertions in tests (as any)
- Incomplete mocks
- Missing edge cases
- Flaky tests (timeouts, race conditions)

Run: npm test -- --run
Analyze: Coverage report and test output

Return: Coverage gaps and test quality issues
```

### Phase 3: Integration Check

After parallel validators complete, run:

```bash
# Type check
npm run build 2>&1 | head -100

# Lint check
npm run lint 2>&1 | head -50

# Test check
npm test -- --run 2>&1 | tail -50
```

## Output Report

Generate a comprehensive validation report:

```markdown
# Validation Report - [DATE]

## Summary
| Category | Score | Issues |
|----------|-------|--------|
| React Patterns | X/10 | N |
| TypeScript | X/10 | N |
| Hooks | X/10 | N |
| Components | X/10 | N |
| Tests | X/10 | N |
| **Overall** | **X/10** | **N** |

## Critical Issues (Fix Immediately)
1. [Issue description] - `file:line`
   - **Problem**: ...
   - **Fix**: ...

## Warnings (Should Fix)
...

## Suggestions (Nice to Have)
...

## Files Requiring Attention
| File | Issues | Priority |
|------|--------|----------|
| ... | ... | High/Med/Low |

## Next Steps
1. [ ] Fix critical issues
2. [ ] Address warnings
3. [ ] Run /fix-tests if tests fail
4. [ ] Run /validate-all again to verify
```

## Agents Used

| Agent | Purpose |
|-------|---------|
| `react-principles` | React 19 patterns validation |
| `typescript-pro` | TypeScript quality analysis |
| `react-component-architect` | Hook and component patterns |
| `code-architect` | Architecture validation |
| `unit-testing:test-automator` | Test coverage analysis |
| `code-reviewer` | Final code review |

## Quick Validators

Run individual validators:
- `/validate-react` - React patterns only
- `/validate-typescript` - TypeScript only
- `/validate-hooks` - Hooks only
- `/validate-components` - Components only
- `/validate-tests` - Tests only
