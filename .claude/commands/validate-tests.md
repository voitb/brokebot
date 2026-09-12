# Validate Test Implementation

Deep validation of test quality, coverage, and best practices.

## Context

This project uses:
- Vitest for test runner
- @testing-library/react for component testing
- @testing-library/user-event for interactions
- fake-indexeddb for Dexie mocking

## Testing Pyramid (2026 Best Practices)

### Target Ratios
| Type | Ratio | What to Test | Speed |
|------|-------|--------------|-------|
| **Unit** | 70% | Business logic, utils, hooks | Fast (ms) |
| **Integration** | 20% | Component interactions, API contracts | Medium (s) |
| **E2E** | 10% | Critical user journeys (3-5 flows) | Slow (min) |

### When to Write Unit Tests
- Pure functions with business logic
- Custom hooks with state management
- Utility functions with multiple edge cases
- Data transformations and validations

### When to Write Integration Tests
- Components that interact with APIs
- Provider/consumer relationships
- Multi-component workflows
- Database operations (Dexie/IndexedDB)

### When to Write E2E Tests (Playwright)
- Critical user flows only (login, checkout, core features)
- Multi-page journeys
- Real browser behavior needed
- **Limit to 3-5 critical flows** - expensive to maintain

### What NOT to Test (Unit Level)
- Implementation details (internal state, private methods)
- Third-party library behavior
- CSS/styling details
- React framework behavior (re-renders, lifecycle)
- Trivial one-liner functions

## Execution

Launch the `unit-testing:test-automator` agent:

```
Perform a comprehensive test audit of .

## Test Quality Checks

### 1. Test Coverage
Analyze coverage:

```bash
npm run test:coverage
```

Check:
- Statement coverage: Target > 80%
- Branch coverage: Target > 70%
- Function coverage: Target > 80%
- Uncovered critical paths

### 2. Testing Library Best Practices
Check for correct patterns:

✅ CORRECT:
- getByRole, getByLabelText, getByText (accessible queries)
- userEvent for interactions (not fireEvent)
- waitFor for async assertions
- screen object for queries
- Queries that reflect user behavior

❌ ANTI-PATTERNS:
- getByTestId overuse (last resort)
- fireEvent instead of userEvent
- Direct DOM queries (querySelector)
- Testing implementation details
- Snapshot abuse

### 3. Test Structure
Check test organization:

✅ CORRECT:
- describe blocks for grouping
- Descriptive test names
- Arrange-Act-Assert pattern
- beforeEach for setup
- afterEach for cleanup
- Single assertion focus

❌ INCORRECT:
- No describe blocks
- Vague test names ("it works")
- Multiple unrelated assertions
- Shared mutable state
- Missing cleanup

### 4. Mock Quality
Check mocking patterns:

✅ CORRECT:
- vi.fn() with proper return types
- vi.mock() at module level
- Mocks match real interfaces
- Mock cleanup in afterEach
- Partial mocks with vi.importActual

❌ INCORRECT:
- Incomplete mocks (missing methods)
- Mocks with `as any`
- Mocks that don't match interface
- No mock reset between tests
- Over-mocking (mock implementation details)

### 5. Async Testing
Check async patterns:

✅ CORRECT:
- await with userEvent
- waitFor for async state
- findBy* queries
- Proper promise handling
- Act warnings resolved

❌ INCORRECT:
- Missing await
- setTimeout in tests
- Race conditions
- act() warnings
- Flaky tests

### 6. Hook Testing
Check hook tests:

✅ CORRECT:
- renderHook from @testing-library/react
- waitFor for async hooks
- Wrapper for providers
- Result assertions

❌ INCORRECT:
- Testing hook implementation
- Missing provider wrapper
- Not handling async updates

### 7. Test Data
Check test data patterns:

✅ CORRECT:
- Factory functions for data
- Realistic test data
- Typed test data (no `as any`)
- Minimal data for test case

❌ INCORRECT:
- `as any` casts
- Incomplete mock data
- Magic values without context
- Shared mutable data

## Files to Scan

1. src/**/*.test.ts(x) - All test files
2. src/testing/ - Test utilities
3. src/testing/mocks/ - Mock implementations
4. src/testing/factories/ - Factory functions

## Shadcn Component Exclusions

**Coverage exclusions** - These are standard shadcn/ui components (no tests needed):
- alert-dialog, avatar, badge, breadcrumb, button, card, checkbox
- collapsible, command, dialog, drawer, dropdown-menu, form
- input, label, navigation-menu, popover, scroll-area, select
- separator, sheet, skeleton, switch, tabs, textarea, tooltip

**DO require tests** for custom UI components:
- auto-size-textarea.tsx, copy-button/, input-dialog.tsx
- loading-dots.tsx, logo.tsx, provider-icons.tsx
- route-loading-fallback.tsx, sidebar/ (custom parts), sonner.tsx
- status-indicator.tsx, truncated-text.tsx

When reporting coverage:
- Expect low coverage for `src/components/ui/` overall
- Focus on custom component coverage within that directory

## Output Format

### Coverage Report
| Category | Current | Target | Status |
|----------|---------|--------|--------|
| Statements | X% | 80% | ✅/❌ |
| Branches | X% | 70% | ✅/❌ |
| Functions | X% | 80% | ✅/❌ |

### Uncovered Critical Paths
| File | Uncovered Lines | Importance |
|------|-----------------|------------|
| ... | ... | High/Med/Low |

### Test Quality Issues
| Test File | Issue | Fix |
|-----------|-------|-----|
| ... | ... | ... |

### Mock Issues
| Mock | Issue | Correct Implementation |
|------|-------|----------------------|
| ... | ... | ... |

### Flaky Tests
| Test | Reason | Fix |
|------|--------|-----|
| ... | ... | ... |

### Summary
- Test files: N
- Total tests: N
- Passing: N
- Failing: N
- Coverage: X%
- Test quality score: X/10
```

## Run Tests and Analyze

```bash
# Run all tests
npm test -- --run 2>&1 | tee /tmp/test-output.txt

# Get coverage
npm run test:coverage 2>&1 | tail -50

# Find failing tests
grep -E "FAIL|Error:" /tmp/test-output.txt

# Find slow tests (>1s)
npm test -- --run --reporter=verbose 2>&1 | grep -E "[0-9]s\s+✓|[0-9]{2,}ms\s+✓"
```

## Quick Checks

```bash
# Find tests with `as any`
grep -rn "as any" src/ --include="*.test.ts" --include="*.test.tsx"

# Find fireEvent usage (should be userEvent)
grep -rn "fireEvent\." src/ --include="*.test.tsx"

# Find getByTestId overuse
grep -rn "getByTestId\|queryByTestId" src/ --include="*.test.tsx" | wc -l

# Find tests without describe blocks
for f in src/**/*.test.tsx; do grep -L "describe(" "$f" 2>/dev/null; done

# Find snapshot tests
grep -rn "toMatchSnapshot\|toMatchInlineSnapshot" src/ --include="*.test.tsx"
```

## Test Patterns Reference

### Component Test Template
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<MyComponent onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### Hook Test Template
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMyHook } from './use-my-hook';

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(null);
  });

  it('updates state async', async () => {
    const { result } = renderHook(() => useMyHook());

    await waitFor(() => {
      expect(result.current.value).toBeDefined();
    });
  });
});
```

## Over-Engineering Detection

### Red Flags (Run `/validate-test-simplification` if found)
- Test files >300 lines
- More than 5 `vi.mock()` calls per file
- Setup blocks >50 lines
- Tests that test implementation details instead of behavior
- Snapshot tests for large components

### Quick Detection Commands
```bash
# Find large test files
for f in src/**/*.test.ts*; do
  [ -f "$f" ] && [ $(wc -l < "$f") -gt 300 ] && wc -l "$f"
done | sort -rn

# Find over-mocked files
for f in src/**/*.test.ts*; do
  [ -f "$f" ] && {
    count=$(grep -c "vi.mock" "$f" 2>/dev/null || echo 0)
    [ "$count" -gt 5 ] && echo "$count mocks: $f"
  }
done
```

### Related Commands
- `/validate-test-simplification` - Deep analysis and simplification recommendations
- `/fix-tests` - Fix failing tests with proper patterns
