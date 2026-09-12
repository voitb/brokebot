# Validate Test Simplification (Project)

Comprehensive workflow to simplify over-engineered tests based on 2026 best practices. Uses multiple specialized agents to analyze all test files without bloating main context.

---

## EXECUTION RULES (READ FIRST - CRITICAL)

### One-Pass Principle
- Run this workflow **ONCE**
- Do NOT re-analyze after completion
- Do NOT "find more issues" iteratively
- Analyze ALL → Report ALL → Fix ALL → Verify → **DONE**

### Stopping Criteria
| Phase | Stop When |
|-------|-----------|
| Scan | Metrics collected (30s max) |
| Analyze | ALL files processed by subagents |
| Report | Summary shown, user asked |
| Fix | ALL issues fixed in ONE batch |
| Verify | Tests pass → **STOP** |

### Context Rules
| Action | Where |
|--------|-------|
| Read test files | Subagents ONLY |
| Analysis | Subagents (model=haiku) |
| Fixes | Subagents (model=sonnet) |
| Main context | Coordination + summaries ONLY |

### Anti-Patterns (DO NOT)
- ❌ Read test files in main context (use subagents)
- ❌ Re-analyze after first pass
- ❌ Fix files one-by-one (fix ALL at once)
- ❌ Say "let me check for more issues"
- ❌ Suggest "additional improvements" after done
- ❌ Overengineer the fixes (KISS - simplest solution)

### Code Quality for Fixes
When simplifying tests, apply:
- **KISS**: Simplest test that verifies behavior
- **DRY**: Use factories from `src/testing/mocks/`
- **No overengineering**: Delete > refactor > rewrite
- **No `as any`**: Fix types properly or use factories

---

## Research-Based Principles (2026)

### What TO Test
- **Behavior, not implementation** - Focus on what users see and do
- **Observable outcomes** - Rendered text, DOM changes, event results
- **Critical business logic** - Core functionality that matters
- **Edge cases** - Boundary conditions, error states
- **User flows** - Complete interaction paths

### What NOT to Test (Zero ROI)
- **Trivial code** - One-liners, simple getters/setters, parameterless constructors
- **Framework behavior** - Don't test that React re-renders or Vitest runs
- **Third-party libraries** - That's the library author's job
- **Auto-generated code** - Prisma clients, GraphQL codegen, etc.
- **Simple wrappers** - Functions that just call another function
- **Static content** - Constants, configuration objects
- **CSS/styling** - Visual regression tools are better suited

### Testing ROI Guidelines

| Code Type | Test? | Reason |
|-----------|-------|--------|
| Business logic / algorithms | ✅ YES | High value, catches real bugs |
| Data transformations | ✅ YES | Edge cases matter |
| Custom hooks with state | ✅ YES | Complex interactions |
| API error handling | ✅ YES | User-facing impact |
| Simple getters/setters | ❌ NO | Tests .NET/JS, not your code |
| Controllers/coordinators | ⚠️ Integration | Better tested end-to-end |
| One-liner utilities | ❌ NO | Zero value, test via integration |
| Constants/config | ❌ NO | No logic to test |

### The "Delete Test" Checklist

Before writing a test, ask:
1. **Does this test business logic?** If no → consider skipping
2. **Would a bug here impact users?** If no → lower priority
3. **Is this testing MY code or a framework?** Framework → skip
4. **Can this be caught by integration/e2e instead?** If yes → maybe skip unit test
5. **Is this a one-liner with no branches?** If yes → probably skip

> "Your goal is not to have unit tests for every single piece of code. Your goal is to end up with a test suite where each test adds significant value." - [Unit Testing Principles](https://canro91.github.io/2022/10/17/UnitTestingPrinciplesPracticesTakeaways/)

### Testing Pyramid (Target Ratios)
| Type | Ratio | Speed | Confidence |
|------|-------|-------|------------|
| Unit | 70% | Fast (ms) | Function-level |
| Integration | 20% | Medium | Component interaction |
| E2E | 10% | Slow | User journeys |

## Global Exclusions

### Shadcn/UI Components (Skip Entirely)
Standard shadcn components in `src/components/ui/`:
- alert-dialog, avatar, badge, breadcrumb, button, card, checkbox
- collapsible, command, dialog, drawer, dropdown-menu, form
- input, label, navigation-menu, popover, scroll-area, select
- separator, sheet, skeleton, switch, tabs, textarea, tooltip

### Custom Components (DO validate tests for)
- auto-size-textarea, copy-button, input-dialog, loading-dots
- logo, provider-icons, route-loading-fallback, sidebar (custom parts)
- sonner, status-indicator, truncated-text

## Test & Mock Organization

### Project Structure (This Codebase)
```
src/
├── testing/                    # Centralized test utilities
│   ├── setup.ts               # Vitest setup file
│   ├── utils.tsx              # Test render utilities
│   ├── db-helpers.ts          # Database test helpers
│   └── mocks/                 # Shared mock implementations
│       ├── factories.ts       # Test data factories (createMockUser, etc.)
│       ├── hooks.ts           # Mock hook implementations
│       ├── providers.ts       # Mock context providers
│       ├── modules.ts         # Module mocks (vi.mock targets)
│       ├── constants.ts       # Test constants
│       ├── dom-helpers.ts     # DOM-related mocks
│       ├── file-helpers.ts    # File API mocks
│       └── media.ts           # MediaRecorder, etc.
├── features/
│   └── chat/
│       ├── hooks/
│       │   ├── use-chat.ts
│       │   └── use-chat.test.ts    # Co-located test
│       └── components/
│           ├── chat-input.tsx
│           └── chat-input.test.tsx # Co-located test
```

### Mock Organization Rules

| Mock Type | Location | Example |
|-----------|----------|---------|
| **Shared mocks** (used by 3+ tests) | `src/testing/mocks/` | `createMockConversation()` |
| **Module mocks** (vi.mock targets) | `src/testing/mocks/modules.ts` | `mockNavigate` |
| **Test-specific mocks** | In the test file | `const mockOnClick = vi.fn()` |
| **Factory functions** | `src/testing/mocks/factories.ts` | `createMockModel()` |
| **Provider wrappers** | `src/testing/mocks/providers.ts` | `createMockModelProvider()` |

### Anti-Pattern: Inline Mock Duplication

```typescript
// ❌ BAD - Same mock defined in 10 test files
const mockUser = { id: "1", name: "Test", email: "test@test.com" };

// ✅ GOOD - Use factory from centralized location
import { createMockUser } from "@/testing/mocks/factories";
const mockUser = createMockUser({ name: "Custom Name" });
```

### When to Create Shared Mocks

Create in `src/testing/mocks/` when:
- Mock is used in **3+ test files**
- Mock requires **complex setup** (>5 lines)
- Mock needs to **match a real interface** exactly
- Mock is for a **core domain entity** (User, Conversation, Model)

Keep inline when:
- Mock is **test-specific** (unique to one scenario)
- Mock is **simple** (just `vi.fn()`)
- Mock is **temporary** (will be removed soon)

## Common Testing Mistakes to Detect

### Flaky Tests (Critical)
Tests that sometimes pass, sometimes fail. Usually caused by:

| Cause | Detection | Fix |
|-------|-----------|-----|
| Race conditions | Random failures in CI | Use `waitFor`, proper async/await |
| Time-dependent | Fails at midnight/DST | Use `vi.useFakeTimers()` |
| Order-dependent | Passes alone, fails in suite | Ensure test isolation |
| Network calls | Timeouts, random data | Use MSW mocks |
| Shared state | One test pollutes another | Reset in `beforeEach` |

```typescript
// ❌ Flaky - race condition
it("updates after click", () => {
  fireEvent.click(button);
  expect(screen.getByText("Updated")).toBeInTheDocument(); // May fail!
});

// ✅ Stable - waits for update
it("updates after click", async () => {
  await userEvent.click(button);
  await waitFor(() => {
    expect(screen.getByText("Updated")).toBeInTheDocument();
  });
});
```

### Async Testing Gotchas

**"act() warning"** = Test exits before React finishes updating

```typescript
// ❌ Causes act() warning
const { result } = renderHook(() => useAsyncHook());
expect(result.current.data).toBeDefined(); // Checked too early!

// ✅ Proper async handling
const { result } = renderHook(() => useAsyncHook());
await waitFor(() => {
  expect(result.current.data).toBeDefined();
});
```

**Fake timers for debounce/setTimeout:**
```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers(); // Always restore!
});

it("debounces search", async () => {
  await userEvent.type(input, "query");
  vi.advanceTimersByTime(300); // Skip debounce delay
  expect(mockSearch).toHaveBeenCalled();
});
```

### Slow Tests Detection

| Test Duration | Status | Action |
|--------------|--------|--------|
| < 50ms | ✅ Good | Keep |
| 50-200ms | ⚠️ Slow | Review - can it be faster? |
| > 200ms | ❌ Too slow | Refactor or move to integration |

```bash
# Find slow tests
npm test -- --run --reporter=verbose 2>&1 | grep -E "[0-9]{3,}ms"
```

**Common slow test causes:**
- Real network calls (use MSW)
- Large component trees (test smaller units)
- Unnecessary re-renders (simplify setup)
- Missing fake timers (real setTimeout waits)

### Test Naming Conventions

```typescript
// ❌ BAD - vague names
it("works", () => { ... });
it("handles edge case", () => { ... });
it("test 1", () => { ... });

// ✅ GOOD - describes behavior
it("returns null when user is not authenticated", () => { ... });
it("shows error message when API returns 500", () => { ... });
it("disables submit button while form is submitting", () => { ... });
```

**Pattern:** `it("[action] when [condition]")` or `it("[expected result] for [input]")`

### Edge Cases Checklist

For each function, consider testing:

| Category | Cases |
|----------|-------|
| **Empty/null** | `null`, `undefined`, `""`, `[]`, `{}` |
| **Boundaries** | 0, -1, MAX_INT, empty string |
| **Invalid input** | Wrong types, malformed data |
| **Error states** | Network failure, timeout, permission denied |
| **Concurrent** | Multiple rapid calls, race conditions |

**But don't over-test!** Only cover edge cases that:
1. Could realistically happen
2. Would cause user-visible bugs
3. Aren't already covered by TypeScript

### Network Mocking with MSW

**Best practice** - use MSW instead of vi.mock for API calls:

```typescript
// src/testing/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({ id: 1, name: 'Test' });
  }),
  http.get('/api/user', () => {
    return HttpResponse.error(); // Error case
  }),
];

// vitest.setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Why MSW > vi.mock for APIs:**
- Tests real fetch/axios code paths
- Easy error scenario testing
- Declarative, readable handlers
- Works in browser too (for e2e)

## Over-Engineering Anti-Patterns to Detect

### 1. The Mockery (Over-Mocking)
```typescript
// RED FLAG: More mocks than actual test logic
vi.mock("module1");
vi.mock("module2");
vi.mock("module3");
vi.mock("module4");
// ... 10+ mocks before any test
```

### 2. The Inspector (Testing Implementation)
```typescript
// RED FLAG: Testing internal state instead of behavior
expect(result.current.internalState).toBe(true);
expect(component.instance().privateMethod).toHaveBeenCalled();
```

### 3. Excessive Setup (>50 lines before tests)
```typescript
// RED FLAG: Setup longer than actual tests
beforeEach(() => {
  // 60+ lines of setup...
});
```

### 4. Redundant Assertions
```typescript
// RED FLAG: Testing the same thing multiple ways
expect(button).toBeInTheDocument();
expect(button).toBeTruthy();
expect(button).not.toBeNull();
expect(button).toBeDefined();
```

### 5. Testing React/Framework Behavior
```typescript
// RED FLAG: Testing that React works
it("re-renders when state changes", () => { ... });
it("calls useEffect on mount", () => { ... });
```

### 6. Snapshot Abuse
```typescript
// RED FLAG: Large component snapshots
expect(container).toMatchSnapshot(); // 500+ line snapshot
```

### 7. Magic Number Tests
```typescript
// RED FLAG: Tests that verify arbitrary implementation details
expect(result.current.retryCount).toBe(3);
expect(wrapper.find("div").length).toBe(7);
```

### 8. Duplicated Mock Data
```typescript
// RED FLAG: Same mock object copy-pasted across files
// File 1: const mockUser = { id: "1", name: "Test", email: "test@test.com" };
// File 2: const mockUser = { id: "1", name: "Test", email: "test@test.com" };
// File 3: const mockUser = { id: "1", name: "Test", email: "test@test.com" };

// SHOULD BE: Factory in src/testing/mocks/factories.ts
```

### 9. Testing Trivial Code
```typescript
// RED FLAG: Testing one-liners with no logic
function getName(user) { return user.name; }

it("returns name", () => {
  expect(getName({ name: "Test" })).toBe("Test"); // Zero value
});

// This test just verifies JavaScript property access works
```

### 10. Tests for Constants/Config
```typescript
// RED FLAG: Testing static data
const CONFIG = { maxRetries: 3, timeout: 5000 };

it("has correct maxRetries", () => {
  expect(CONFIG.maxRetries).toBe(3); // Tests nothing useful
});
```

## Execution - Multi-Agent Workflow

### Phase 1: Scan and Categorize (Main Thread)

First, collect test file metrics:

```bash
# Count lines per test file
for f in src/**/*.test.ts src/**/*.test.tsx; do
  [ -f "$f" ] && echo "$(wc -l < "$f") $f"
done | sort -rn | head -30

# Find tests with excessive mocks (>5 vi.mock calls)
for f in src/**/*.test.ts src/**/*.test.tsx; do
  [ -f "$f" ] && {
    count=$(grep -c "vi.mock" "$f" 2>/dev/null || echo 0)
    [ "$count" -gt 5 ] && echo "$count mocks: $f"
  }
done

# Find tests with `as any`
grep -rn "as any" src/ --include="*.test.ts" --include="*.test.tsx" | wc -l

# Find tests with snapshot abuse
grep -rn "toMatchSnapshot\|toMatchInlineSnapshot" src/ --include="*.test.ts*" | wc -l
```

### Phase 2: Parallel Analysis (Sub-Agents)

Launch **3-5 agents in parallel** to analyze different file batches:

#### Agent 1: Hook Tests (`unit-testing:test-automator`)
```
Analyze hook test files for over-engineering in .

FILES TO ANALYZE:
- src/hooks/**/*.test.ts
- src/features/**/hooks/*.test.ts

SKIP: src/components/ui/ (shadcn)

CHECK FOR ANTI-PATTERNS:
1. Over-mocking (>5 vi.mock per file = RED FLAG)
2. Testing implementation details (internal state, private refs)
3. Excessive setup (>30 lines beforeEach)
4. Redundant assertions (same thing tested 3+ ways)
5. Testing React behavior (useEffect timing, re-render counts)
6. Tests >200 lines for simple hooks

SIMPLIFICATION OPPORTUNITIES:
- Can multiple tests be combined into behavior-focused test?
- Are mocks testing mock behavior instead of real code?
- Is setup reusable via factory functions?
- Do tests survive refactoring?

OUTPUT FORMAT per file:
| File | Lines | Mocks | Issues | Simplification Potential |
|------|-------|-------|--------|------------------------|
| path | N | N | list | High/Medium/Low |

Specific recommendations for each High/Medium file.
```

#### Agent 2: Component Tests (`unit-testing:test-automator`)
```
Analyze component test files for over-engineering in .

FILES TO ANALYZE:
- src/features/**/components/**/*.test.tsx
- src/components/**/*.test.tsx (except ui/)

SKIP: src/components/ui/ (shadcn - no tests needed)

CHECK FOR ANTI-PATTERNS:
1. Testing styling/CSS details
2. Snapshot abuse (prefer explicit assertions)
3. Testing implementation details (state, internal methods)
4. Over-mocking providers (>3 Context providers mocked)
5. Tests that break on harmless refactors
6. fireEvent instead of userEvent
7. getByTestId overuse (should be last resort)

CORRECT PATTERNS TO VERIFY:
- User-centric queries (getByRole, getByLabelText, getByText)
- Testing what user sees/does
- waitFor for async operations
- userEvent.setup() pattern

OUTPUT FORMAT per file:
| File | Lines | Query Quality | Issues | Simplification |
|------|-------|--------------|--------|---------------|
| path | N | Good/Mixed/Poor | list | High/Med/Low |
```

#### Agent 3: Utility/Library Tests (`unit-testing:test-automator`)
```
Analyze utility and library test files in .

FILES TO ANALYZE:
- src/lib/**/*.test.ts
- src/features/**/lib/*.test.ts
- src/features/**/utils/*.test.ts

CHECK FOR ANTI-PATTERNS:
1. Testing trivial functions (one-liners, simple wrappers)
2. Mocking the function being tested
3. Testing third-party library behavior
4. Excessive edge case coverage for unlikely scenarios
5. Tests that duplicate integration/e2e coverage

SIMPLIFICATION CRITERIA:
- If function is <5 lines, does it need isolated unit tests?
- Can edge cases be covered by integration tests instead?
- Are tests testing the right abstraction level?

OUTPUT FORMAT:
| File | Lines | Functions Tested | Trivial Tests | Recommendation |
|------|-------|-----------------|--------------|----------------|
| path | N | N | N | Keep/Simplify/Remove |
```

#### Agent 4: Provider Tests (`unit-testing:test-automator`)
```
Analyze provider/context test files in .

FILES TO ANALYZE:
- src/app/providers/**/*.test.tsx
- Any file with Provider/Context in name

CHECK FOR:
1. Testing provider implementation details
2. Over-complex setup for simple contexts
3. Testing Context API behavior (React's job)
4. Mocking children instead of rendering real components

CORRECT PATTERN:
- Test through consumer components
- Test actual state changes visible to users
- Integration tests may be better than unit tests for providers

OUTPUT: Provider-specific analysis with simplification recommendations.
```

### Phase 3: Generate Report

After all agents complete, create a consolidated report.

## Output Report Format

```markdown
# Test Simplification Report - [DATE]

## Executive Summary
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Total test files | N | - | - |
| Total test lines | N | <10K | ⚠️/✅ |
| Over-engineered files | N | 0 | ⚠️/✅ |
| Files with >5 mocks | N | <5 | ⚠️/✅ |
| `as any` in tests | N | 0 | ⚠️/✅ |
| Snapshot tests | N | <10 | ⚠️/✅ |

## Testing Pyramid Analysis
| Type | Current | Target | Files |
|------|---------|--------|-------|
| Unit | N% | 70% | list |
| Integration | N% | 20% | list |
| E2E | N% | 10% | - |

## High Priority Simplifications

### 1. [File Path]
**Current:** X lines, Y mocks
**Issues:**
- Issue 1
- Issue 2

**Recommended Simplification:**
```typescript
// Before: 50 lines testing implementation
// After: 15 lines testing behavior
```

**Estimated reduction:** X lines → Y lines

### 2. [Next file...]

## Medium Priority

| File | Current Lines | Target Lines | Issue |
|------|--------------|--------------|-------|
| ... | ... | ... | ... |

## Low Priority (Optional)
- List of minor improvements

## Files That Are Well-Designed
These tests follow best practices - no changes needed:
- file1.test.ts - Good behavior testing
- file2.test.tsx - Appropriate mocking

## Excluded Files (Shadcn)
- src/components/ui/* - No tests required

## When to Use E2E Instead

These unit tests might be better as E2E/integration:
| Test | Reason | Recommendation |
|------|--------|---------------|
| ... | Tests full user flow | Move to Playwright |
| ... | Tests API integration | Keep as integration |

## Next Steps
1. [ ] Fix High Priority files first
2. [ ] Run `/validate-tests` after changes
3. [ ] Run full test suite to verify no regressions
4. [ ] Consider adding E2E for critical flows
```

## Quick Commands

### Run Full Simplification Analysis
```bash
# Get overview stats
echo "=== Test File Stats ==="
find src -name "*.test.ts*" | wc -l
wc -l src/**/*.test.ts* 2>/dev/null | tail -1

echo ""
echo "=== Files >300 lines (likely over-engineered) ==="
for f in src/**/*.test.ts src/**/*.test.tsx; do
  [ -f "$f" ] && {
    lines=$(wc -l < "$f")
    [ "$lines" -gt 300 ] && echo "$lines $f"
  }
done | sort -rn

echo ""
echo "=== Mock count per file ==="
for f in src/**/*.test.ts src/**/*.test.tsx; do
  [ -f "$f" ] && {
    count=$(grep -c "vi.mock" "$f" 2>/dev/null || echo 0)
    [ "$count" -gt 3 ] && echo "$count mocks: $f"
  }
done | sort -rn | head -10

echo ""
echo "=== Anti-pattern counts ==="
echo "as any: $(grep -rn 'as any' src/ --include='*.test.ts*' 2>/dev/null | wc -l)"
echo "fireEvent: $(grep -rn 'fireEvent\.' src/ --include='*.test.tsx' 2>/dev/null | wc -l)"
echo "toMatchSnapshot: $(grep -rn 'toMatchSnapshot' src/ --include='*.test.ts*' 2>/dev/null | wc -l)"
echo "getByTestId: $(grep -rn 'getByTestId' src/ --include='*.test.tsx' 2>/dev/null | wc -l)"

echo ""
echo "=== Mock organization issues ==="
# Find duplicated mock patterns (same object structure in multiple files)
echo "Files with inline mock objects (potential duplication):"
grep -rn "const mock.*= {" src/ --include='*.test.ts*' 2>/dev/null | cut -d: -f1 | sort | uniq -c | sort -rn | head -5

echo ""
echo "Tests NOT using factory functions (should use src/testing/mocks/factories):"
grep -rln "createMock" src/ --include='*.test.ts*' 2>/dev/null | wc -l
echo "test files use factories"

echo ""
echo "=== Trivial test detection ==="
# Find tests that might be testing trivial code
echo "Potential trivial tests (testing simple returns):"
grep -rn "expect.*\.toBe(" src/ --include='*.test.ts*' 2>/dev/null | grep -E "\.name\)|\.id\)|\.length\)" | wc -l
echo "simple property assertions found"

echo ""
echo "=== Flaky test indicators ==="
# Missing await before userEvent
echo "Missing await with userEvent (potential flaky):"
grep -rn "userEvent\." src/ --include='*.test.tsx' 2>/dev/null | grep -v "await " | grep -v "setup()" | wc -l

# Tests without waitFor for async operations
echo "Async hooks without waitFor:"
grep -rln "renderHook.*useAsync\|renderHook.*useFetch\|renderHook.*useQuery" src/ --include='*.test.ts*' 2>/dev/null | while read f; do
  grep -L "waitFor" "$f" 2>/dev/null
done | wc -l

echo ""
echo "=== Test isolation issues ==="
# Global variable mutations
echo "Global/module-level let (potential shared state):"
grep -rn "^let \|^var " src/ --include='*.test.ts*' 2>/dev/null | grep -v "inside describe" | wc -l

echo ""
echo "=== Slow test detection ==="
echo "Run this to find slow tests:"
echo "npm test -- --run --reporter=verbose 2>&1 | grep -E '[0-9]{3,}ms'"
```

## Simplification Templates

### Over-Mocked Hook → Behavior Test
```typescript
// BEFORE: 15 mocks, 100 lines
vi.mock("dep1"); vi.mock("dep2"); // ... 15 mocks
describe("useComplexHook", () => {
  it("sets internal state A", () => { ... });
  it("sets internal state B", () => { ... });
  it("calls internal method", () => { ... });
});

// AFTER: 2 mocks, 30 lines
vi.mock("@/api/client"); // Only mock external boundaries
describe("useComplexHook", () => {
  it("returns data when API succeeds", async () => {
    // Test observable output
  });
  it("handles errors gracefully", async () => {
    // Test error state visible to user
  });
});
```

### Implementation Test → Behavior Test
```typescript
// BEFORE: Testing implementation
it("updates loading state to true then false", () => {
  expect(result.current.isLoading).toBe(false);
  act(() => result.current.fetch());
  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
});

// AFTER: Testing behavior
it("shows loading indicator while fetching", async () => {
  render(<MyComponent />);
  await user.click(screen.getByRole("button", { name: /fetch/i }));
  expect(screen.getByRole("progressbar")).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
```

## Phase 6: Type Checking Validation (REQUIRED)

**CRITICAL:** Tests MUST pass TypeScript type checking. Many projects exclude tests from the main `tsconfig.json` for performance, but this creates a dangerous gap where type errors go unnoticed.

### Why Type Check Tests?

| Problem | Consequence |
|---------|-------------|
| Tests excluded from main tsconfig | Type errors in tests never caught during builds |
| `as any` casts to bypass types | Masks real type mismatches |
| Mock data missing properties | Runtime errors when interface changes |
| IDE shows errors but CI passes | False confidence in test quality |

### Type Check Commands

**This project uses separate tsconfig for tests:**

```bash
# Type check ONLY test files (excludes app code)
npm run typecheck:tests

# Full type check (app + tests)
npm run typecheck:all

# Alternative: Direct tsc with test config
tsc --noEmit -p tsconfig.test.json
```

### Setting Up Test Type Checking (For New Projects)

If your project doesn't have a separate test tsconfig, create one:

**tsconfig.test.json:**
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom", "node"],
    "noEmit": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx"
  ],
  "exclude": []
}
```

**package.json scripts:**
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit -p tsconfig.app.json",
    "typecheck:tests": "tsc --noEmit -p tsconfig.test.json",
    "typecheck:all": "npm run typecheck && npm run typecheck:tests"
  }
}
```

### Running Type Check After Simplification

After the Multi-Agent Fix Workflow completes, **ALWAYS run**:

```bash
npm run typecheck:tests
```

If errors are found:
1. Fix `as any` casts - use proper types or factories
2. Add missing properties to mock data
3. Update factories to match current interfaces
4. Never use `@ts-ignore` or `@ts-expect-error` in tests

### Type Check Integration with Vitest

Vitest can also run type checks using `--typecheck` flag:

```bash
# Run tests WITH type checking
vitest --typecheck

# Or enable in vitest.config.ts
export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json'
    }
  }
})
```

> **Note:** `--typecheck` runs `tsc --noEmit` alongside tests, catching type errors before tests even run.

---

## Final Verification Checklist

After completing all phases, verify:

- [ ] **Tests pass:** `npm test -- --run`
- [ ] **Types pass:** `npm run typecheck:tests` (CRITICAL!)
- [ ] **Coverage maintained:** `npm run test:coverage`
- [ ] **No `as any`:** `grep -rn 'as any' src/ --include='*.test.ts*' | wc -l` = 0
- [ ] **No `@ts-ignore`:** `grep -rn '@ts-ignore\|@ts-expect-error' src/ --include='*.test.ts*' | wc -l` = 0

---

## Sources

Best practices based on:
- [Kent C. Dodds - Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Testing in 2026 - Full Stack Strategies](https://www.nucamp.co/blog/testing-in-2026-jest-react-testing-library-and-full-stack-testing-strategies)
- [Software Testing Anti-patterns](https://blog.codepipes.com/testing/software-testing-antipatterns.html)
- [Vitest Best Practices](https://vitest.dev/guide/)
- [What Not to Unit Test](https://bytedev.medium.com/what-not-to-unit-test-a52332b4f153)
- [Unit Testing Principles, Practices, and Patterns](https://canro91.github.io/2022/10/17/UnitTestingPrinciplesPracticesTakeaways/)
- [On Testing Trivial Code](https://lostechies.com/derickbailey/2013/03/11/on-testing-trivia-code/)
- [Vitest Test File Organization](https://app.studyraid.com/en/read/11292/352301/test-file-organization-strategies)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking)
- [Vitest Testing Types](https://vitest.dev/guide/testing-types) - Type checking in tests
- [Vitest Typecheck Config](https://vitest.dev/config/typecheck) - Typecheck configuration options
- [TypeScript Type Testing](https://www.totaltypescript.com/how-to-test-your-types) - Testing types best practices

---

## Phase 4: Interactive Fix Prompt

After generating the report, **ASK THE USER**:

```
## Report Complete

Found [N] files requiring simplification.

Would you like me to run the **Multi-Agent Fix Workflow**?

This will launch specialized agents **outside main context** to fix all identified issues:
- `unit-testing:test-automator` - Rewrite over-engineered tests
- `code-simplifier:code-simplifier` - Simplify test code
- `unit-testing:debugger` - Fix any broken tests after simplification

**Options:**
1. **Yes, fix all** - Run agents on all High + Medium priority files
2. **Yes, High priority only** - Run agents only on critical files
3. **No, just show report** - I'll fix manually

Choose [1/2/3]:
```

---

## Phase 5: Multi-Agent Fix Workflow (If User Accepts)

Launch agents **IN PARALLEL** for different file categories. Each agent works independently without bloating main context.

### Agent Batch 1: Over-Mocked Hooks (Parallel)

For each hook test file with >10 mocks, launch `code-simplifier:code-simplifier`:

```
Simplify over-mocked hook test file: [FILE_PATH]

CONTEXT FROM REPORT:
- Current: [X] lines, [Y] mocks
- Issues: [list from report]

TASK:
1. Read the SOURCE hook file first to understand what it ACTUALLY does
2. Identify which mocks are testing mock behavior (remove these)
3. Keep only mocks for external boundaries (API, database, browser APIs)
4. Rewrite tests to focus on BEHAVIOR not implementation:
   - What does the user see/get when they use this hook?
   - What happens on success/error?
   - Don't test internal state transitions

CONSTRAINTS:
- Target: <100 lines for simple hooks, <200 for complex
- Max 3-5 mocks per file
- NO `as any` casts
- Use factory functions from src/testing/factories/
- Tests must pass after changes

OUTPUT: Simplified test file with explanation of changes made.
```

### Agent Batch 2: Over-Mocked Components (Parallel)

For each component test with >10 mocks, launch `unit-testing:test-automator`:

```
Simplify over-mocked component test: [FILE_PATH]

CONTEXT FROM REPORT:
- Current: [X] lines, [Y] mocks
- Issues: [list from report]

TASK:
1. Read the SOURCE component to understand user-visible behavior
2. Replace implementation tests with behavior tests:
   - Use getByRole, getByLabelText, getByText (not getByTestId)
   - Test what user sees, not internal state
   - Use userEvent.setup() pattern
3. Reduce mocks to external boundaries only
4. Remove redundant assertions

TESTING LIBRARY PRIORITIES:
1. getByRole - BEST (accessible)
2. getByLabelText - form fields
3. getByText - visible text
4. getByTestId - LAST RESORT only

OUTPUT: Simplified test file following Testing Library best practices.
```

### Agent Batch 3: Large Test Files (Sequential)

For files >500 lines, launch `code-simplifier:code-simplifier`:

```
Simplify large test file: [FILE_PATH]

CONTEXT FROM REPORT:
- Current: [X] lines
- Issues: [list from report]

TASK:
1. Identify test groups that can be MERGED (testing same behavior differently)
2. Identify tests that test IMPLEMENTATION (remove or rewrite)
3. Identify trivial tests (one-liners that don't add value)
4. Extract common setup to factory functions

MERGE CRITERIA:
- Multiple tests checking same outcome = merge into one
- Tests that break on refactor = rewrite to test behavior
- Setup >30 lines = extract to helper

TARGET: Reduce file by 40-60% while maintaining coverage of BEHAVIOR.

OUTPUT: Simplified test file with changelog of what was removed/merged.
```

### Agent Batch 4: Verification (After All Fixes)

Launch `unit-testing:debugger` to verify:

```
Verify test simplification results in .

TASKS:
1. Run full test suite:
   ```bash
   npm test -- --run 2>&1
   ```

2. If tests fail, identify which simplified tests broke and fix them

3. Run coverage check:
   ```bash
   npm run test:coverage 2>&1 | tail -30
   ```

4. Verify coverage didn't drop significantly (allow 5% variance)

5. Generate final verification report

OUTPUT FORMAT:
| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Test files | N | N | ✅ |
| Total lines | N | N | ⬇️ X% |
| Passing tests | N | N | ✅/❌ |
| Coverage | X% | X% | ✅/⚠️ |

List of any tests that needed post-fix adjustments.
```

---

## Fix Workflow Execution Order

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 5: FIX WORKFLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Launch IN PARALLEL (outside main context)         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │ code-simplifier │ │ test-automator  │ │ code-simplifier│ │
│  │ (Hook Tests)    │ │ (Component)     │ │ (Large Files) │ │
│  │ Files: 3-5      │ │ Files: 3-5      │ │ Files: 2-3    │ │
│  └────────┬────────┘ └────────┬────────┘ └───────┬───────┘ │
│           │                   │                   │         │
│           └───────────────────┼───────────────────┘         │
│                               ▼                             │
│  Step 2: Wait for all agents to complete                    │
│                               │                             │
│                               ▼                             │
│  Step 3: Launch verification agent                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ unit-testing:debugger                                │   │
│  │ - Run tests, fix failures, verify coverage          │   │
│  └─────────────────────────────────────────────────────┘   │
│                               │                             │
│                               ▼                             │
│  Step 4: Generate Final Report                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SIMPLIFICATION COMPLETE                              │   │
│  │ - Lines reduced: X → Y (Z% reduction)               │   │
│  │ - Mocks reduced: X → Y                              │   │
│  │ - All tests passing: ✅/❌                           │   │
│  │ - Coverage maintained: ✅/❌                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent Assignment Summary

| Agent | Task | Files Per Batch | Run Mode |
|-------|------|-----------------|----------|
| `code-simplifier:code-simplifier` | Simplify over-mocked hooks | 3-5 | Parallel |
| `unit-testing:test-automator` | Rewrite component tests | 3-5 | Parallel |
| `code-simplifier:code-simplifier` | Reduce large files | 2-3 | Parallel |
| `unit-testing:debugger` | Verify & fix failures | All | Sequential |

**Total agents per run:** 4-6 (3 parallel + 1 sequential verification)

**Context isolation:** Each agent receives only:
- The specific file to fix
- Relevant excerpt from the report
- Constraints and patterns to follow

**Main context remains clean** - only receives final summary.

---

---

## Latest Analysis Results (January 25, 2026)

### Hook Test Analysis Summary

| File | Lines | Mocks | Issues Found | Simplification Potential |
|------|-------|-------|--------------|-------------------------|
| `use-file-upload.test.ts` | 399 | 1 | Redundant file type tests, testing internal `processFile` | **HIGH** - Reduce to ~200 lines |
| `use-models.test.ts` | 398 | 1 | Over-testing abort behavior, React unmount tests | **HIGH** - Reduce to ~200 lines |
| `use-chat-input.test.ts` | 333 | 6 | **OVER-MOCKING (RED FLAG)**, implementation details | **HIGH** - Convert to integration or reduce to ~150 lines |
| `use-message-stream.test.ts` | 315 | 1 | Excessive cleanup tests, redundant abort handling | **MEDIUM** - Reduce to ~180 lines |
| `use-drag-drop.test.ts` | 258 | 0 | Over-testing internal drag counter state | **MEDIUM** - Reduce to ~120 lines |
| `use-smart-auto-scroll.test.ts` | 239 | 0 | Complex DOM mocking, testing browser APIs | **HIGH** - Convert to integration test |
| `use-speech-to-text.test.ts` | 218 | 1 | Good coverage, minor redundancy | **LOW** - Reduce to ~180 lines |
| `use-textarea-auto-resize.test.ts` | 179 | 0 | Over-testing constraint logic edge cases | **MEDIUM** - Reduce to ~100 lines |
| `use-model-selector.test.ts` | 172 | 0 | **GOLD STANDARD** - Excellent behavior testing | **NONE** ✓ |
| `use-conversation-backup.test.ts` | 175 | 1 | Good integration approach with real DB | **LOW** - Reduce to ~150 lines |
| `use-is-mobile.test.ts` | 134 | 0 | Over-testing matchMedia boundary conditions | **MEDIUM** - Reduce to ~60 lines |
| `use-mounted.test.ts` | 87 | 0 | **TRIVIAL** - Tests React ref behavior, not custom logic | **HIGH** - Consider deleting file |

### Critical Findings

#### 🔴 Immediate Action Required

**1. `use-chat-input.test.ts` (333 lines, 6 mocks)**
```typescript
// PROBLEMS:
vi.mock("@/hooks/use-conversations")           // Mock 1
vi.mock("@/hooks/use-conversation-id")         // Mock 2
vi.mock("@/app/providers/model-provider")      // Mock 3
vi.mock("./use-message-stream")                // Mock 4
vi.mock("../utils/chat-error-utils")           // Mock 5

// Tests mock behavior instead of real code:
❌ "clears message and resets loading state after submit"
❌ "prevents double-submit while loading"
❌ "prevents submit while generating"

// RECOMMENDATION: Convert to integration test
✅ Test with REAL dependencies, only mock external I/O
✅ Reduce to 3 behavioral tests (~150 lines)
```

**2. `use-file-upload.test.ts` (399 lines)**
```typescript
// REDUNDANT TESTS (all test same code path):
❌ "processes text files"
❌ "processes markdown files"
❌ "categorizes other file types"
// Combine into ONE:
✅ "processes supported file types"

// TRIVIAL TESTS:
❌ "generates unique ids for files" (tests UUID library)
❌ "processes multiple files concurrently" (no actual concurrency logic)

// TESTING INTERNALS:
❌ processFile() is not exported - why test it directly?

// TARGET: 399 → ~200 lines
```

**3. `use-models.test.ts` (398 lines)**
```typescript
// TESTING REACT BEHAVIOR (not our code):
❌ "ignores AbortError when unmounting"
❌ "does not update state after unmount"

// REDUNDANT (3 tests for number coercion):
❌ "formats valid context length"
❌ "handles undefined context length"
❌ "handles negative context length"
// Combine into ONE:
✅ "normalizes context length values"

// TRIVIAL:
❌ "extracts provider from model id" (just string.split('/')[0])

// TARGET: 398 → ~200 lines
```

**4. `use-smart-auto-scroll.test.ts` (239 lines)**
```typescript
// WRONG APPROACH - Heavy DOM mocking:
const mockViewport = createMockViewport({ scrollTop: 0, scrollHeight: 1000 })
const mockObserver = createMockMutationObserver()
scrollAreaElement.querySelector = vi.fn().mockReturnValue(mockViewport)
// ...50+ lines of mock setup

// RIGHT APPROACH - Integration test:
render(<ChatMessages isGenerating={true} />)
expect(viewport.scrollTop).toBe(viewport.scrollHeight)

// RECOMMENDATION: Move to integration test or accept lower unit coverage
```

**5. `use-mounted.test.ts` (87 lines)**
```typescript
// THE HOOK (3 lines):
export function useMounted() {
  const mounted = useRef(true)
  useEffect(() => () => { mounted.current = false }, [])
  return mounted
}

// THE TESTS (87 lines testing React's ref implementation):
❌ "returns true when component is mounted"       // Testing React
❌ "returns false after component unmounts"        // Testing React
❌ "ref is stable across renders"                  // Testing React
❌ "maintains mounted state through multiple rerenders" // Testing React
❌ "cleanup sets ref to false exactly once"        // Testing React

// RECOMMENDATION: DELETE THIS FILE
// Alternative: 1 integration test showing actual usage pattern
```

#### 🟡 Medium Priority

**6. `use-message-stream.test.ts` (315 → ~180 lines)**
- Combine 4 cleanup/reset tests into 1
- Remove iterator protocol testing (for-await-of is language feature)

**7. `use-drag-drop.test.ts` (258 → ~120 lines)**
- Remove internal `dragCounter` state tests
- Keep only: isDragOver behavior, file drop handling

**8. `use-is-mobile.test.ts` (134 → ~60 lines)**
- Combine boundary tests (767px, 768px, 769px) into 2 tests
- Remove matchMedia API behavior tests

**9. `use-textarea-auto-resize.test.ts` (179 → ~100 lines)**
- Combine constraint tests into single "enforces height constraints" test

#### 🟢 Low Priority

**10. `use-speech-to-text.test.ts` (218 → ~180 lines)**
- Good behavior testing
- Minor: Combine permission + transcription error tests

**11. `use-conversation-backup.test.ts` (175 → ~150 lines)**
- Good integration approach with real database
- Minor: Combine export/import state tests

#### ✅ Keep As-Is (Gold Standard)

**12. `use-model-selector.test.ts` (172 lines) ✓**
```typescript
// WHY IT'S EXCELLENT:
✅ Tests behavior, not implementation
✅ No mocks needed (pure logic)
✅ Clear test names
✅ Good edge case coverage
✅ Tests filtering, grouping, sorting (observable outcomes)

// ALL OTHER TESTS SHOULD ASPIRE TO THIS PATTERN
```

### Metrics Summary

| Metric | Current | Target | Reduction |
|--------|---------|--------|-----------|
| **Total lines** | ~3,000 | ~1,500 | **50%** |
| **Files >300 lines** | 4 | 0 | -4 |
| **Files with >5 mocks** | 1 | 0 | -1 |
| **Trivial test files** | 1 | 0 | -1 |
| **Gold standard files** | 1 | All | +100% |

### Anti-Pattern Summary

| Anti-Pattern | Files Affected | Severity |
|--------------|---------------|----------|
| **Over-mocking (>5 mocks)** | `use-chat-input.test.ts` | 🔴 Critical |
| **Testing React behavior** | `use-models.test.ts`, `use-mounted.test.ts`, `use-smart-auto-scroll.test.ts` | 🔴 Critical |
| **Testing implementation details** | `use-drag-drop.test.ts`, `use-file-upload.test.ts` | 🟡 Medium |
| **Redundant assertions** | `use-file-upload.test.ts`, `use-models.test.ts`, `use-is-mobile.test.ts` | 🟡 Medium |
| **Trivial tests** | `use-mounted.test.ts`, `use-file-upload.test.ts` | 🔴 Critical |

### Recommended Action Plan

1. **DELETE** `use-mounted.test.ts` (87 lines of zero value)
2. **REFACTOR** `use-chat-input.test.ts` to integration approach (333 → 150 lines)
3. **REDUCE** `use-file-upload.test.ts` by 50% (399 → 200 lines)
4. **REDUCE** `use-models.test.ts` by 50% (398 → 200 lines)
5. **CONVERT** `use-smart-auto-scroll.test.ts` to integration test
6. **SIMPLIFY** medium priority files (combined ~900 → ~500 lines)

**Total Expected Reduction:** ~3,000 → ~1,500 lines (50% reduction, same behavioral coverage)

---

## Workflow Completeness Checklist

This workflow covers all aspects of test quality:

### ✅ What to Test
- [x] Business logic & algorithms
- [x] Data transformations
- [x] Custom hooks with state
- [x] Error handling
- [x] Edge cases (with guidance on which ones matter)

### ✅ What NOT to Test
- [x] Trivial code (getters/setters)
- [x] Framework behavior
- [x] Third-party libraries
- [x] Constants/config
- [x] Simple wrappers

### ✅ Test Organization
- [x] Mock location rules (`src/testing/mocks/`)
- [x] Factory functions pattern
- [x] Co-location vs separate folders
- [x] When to create shared mocks

### ✅ Anti-Patterns Detection (10 patterns)
- [x] Over-mocking
- [x] Testing implementation details
- [x] Excessive setup
- [x] Redundant assertions
- [x] Testing framework behavior
- [x] Snapshot abuse
- [x] Magic numbers
- [x] Duplicated mock data
- [x] Testing trivial code
- [x] Testing constants

### ✅ Common Mistakes
- [x] Flaky tests (causes & fixes)
- [x] Async testing gotchas (act warnings, fake timers)
- [x] Slow tests detection
- [x] Test naming conventions
- [x] Edge cases checklist
- [x] MSW for network mocking

### ✅ Testing Pyramid
- [x] Unit (70%) - when to use
- [x] Integration (20%) - when to use
- [x] E2E (10%) - when to use

### ✅ Exclusions
- [x] Shadcn components list
- [x] Custom components that DO need tests

### ✅ Automation
- [x] Quick detection commands
- [x] Multi-agent analysis (4 parallel agents)
- [x] Interactive fix prompt
- [x] Multi-agent fix workflow (3-5 parallel + verification)
- [x] Final report generation

### ✅ Templates & Examples
- [x] Over-mocked hook → behavior test
- [x] Implementation test → behavior test
- [x] Proper async patterns
- [x] Fake timers usage
- [x] MSW setup

### ✅ Sources
- [x] 10 authoritative sources cited
