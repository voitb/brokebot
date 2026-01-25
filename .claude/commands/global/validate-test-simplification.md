# Validate Test Simplification (Global)

Project-agnostic workflow to simplify over-engineered tests based on 2025/2026 best practices. Works with any TypeScript/React/Next.js project using Vitest or Jest.

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
- **DRY**: Use factories if project has them
- **No overengineering**: Delete > refactor > rewrite
- **No `as any`**: Fix types properly

---

## Research-Based Principles

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
| Simple getters/setters | ❌ NO | Tests language, not your code |
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

> "Your goal is not to have unit tests for every single piece of code. Your goal is to end up with a test suite where each test adds significant value."

### Testing Pyramid (Target Ratios)
| Type | Ratio | Speed | Confidence |
|------|-------|-------|------------|
| Unit | 70% | Fast (ms) | Function-level |
| Integration | 20% | Medium | Component interaction |
| E2E | 10% | Slow | User journeys |

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
// File 1: const mockUser = { id: "1", name: "Test" };
// File 2: const mockUser = { id: "1", name: "Test" };
// SHOULD BE: Factory in testing/mocks/factories.ts
```

### 9. Testing Trivial Code
```typescript
// RED FLAG: Testing one-liners with no logic
function getName(user) { return user.name; }

it("returns name", () => {
  expect(getName({ name: "Test" })).toBe("Test"); // Zero value
});
```

### 10. Tests for Constants/Config
```typescript
// RED FLAG: Testing static data
const CONFIG = { maxRetries: 3, timeout: 5000 };

it("has correct maxRetries", () => {
  expect(CONFIG.maxRetries).toBe(3); // Tests nothing useful
});
```

## Common Testing Mistakes to Detect

### Flaky Tests (Critical)

| Cause | Detection | Fix |
|-------|-----------|-----|
| Race conditions | Random failures in CI | Use `waitFor`, proper async/await |
| Time-dependent | Fails at midnight/DST | Use `vi.useFakeTimers()` |
| Order-dependent | Passes alone, fails in suite | Ensure test isolation |
| Network calls | Timeouts, random data | Use MSW mocks |
| Shared state | One test pollutes another | Reset in `beforeEach` |

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

### Slow Tests Detection

| Test Duration | Status | Action |
|--------------|--------|--------|
| < 50ms | ✅ Good | Keep |
| 50-200ms | ⚠️ Slow | Review - can it be faster? |
| > 200ms | ❌ Too slow | Refactor or move to integration |

## Execution - Multi-Agent Workflow

### Phase 1: Project Detection

First, detect project structure and test framework:

```bash
# Detect test framework
if [ -f "vitest.config.ts" ] || [ -f "vite.config.ts" ]; then
  echo "Framework: Vitest"
elif [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
  echo "Framework: Jest"
fi

# Find test file patterns
echo "Test files:"
find src -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | head -20

# Check for existing testing infrastructure
[ -d "src/testing" ] && echo "Has: src/testing/"
[ -d "__tests__" ] && echo "Has: __tests__/"
[ -d "tests" ] && echo "Has: tests/"
```

### Phase 2: Scan and Categorize

Collect test file metrics:

```bash
# Count lines per test file
find src -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | while read f; do
  echo "$(wc -l < "$f") $f"
done | sort -rn | head -30

# Find tests with excessive mocks (>5 vi.mock calls)
find src -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | while read f; do
  count=$(grep -c "vi.mock\|jest.mock" "$f" 2>/dev/null || echo 0)
  [ "$count" -gt 5 ] && echo "$count mocks: $f"
done

# Anti-pattern counts
echo "as any: $(grep -rn 'as any' src/ --include='*.test.ts*' 2>/dev/null | wc -l)"
echo "fireEvent: $(grep -rn 'fireEvent\.' src/ --include='*.test.tsx' 2>/dev/null | wc -l)"
echo "toMatchSnapshot: $(grep -rn 'toMatchSnapshot' src/ --include='*.test.ts*' 2>/dev/null | wc -l)"
echo "getByTestId: $(grep -rn 'getByTestId' src/ --include='*.test.tsx' 2>/dev/null | wc -l)"
```

### Phase 3: Parallel Analysis (Sub-Agents)

Launch **3-5 agents in parallel** to analyze different file batches:

#### Agent 1: Hook Tests (`unit-testing:test-automator`)
```
Analyze hook test files for over-engineering.

FILES TO ANALYZE:
- src/**/hooks/*.test.ts
- src/hooks/**/*.test.ts

CHECK FOR ANTI-PATTERNS:
1. Over-mocking (>5 mocks per file = RED FLAG)
2. Testing implementation details (internal state, private refs)
3. Excessive setup (>30 lines beforeEach)
4. Redundant assertions (same thing tested 3+ ways)
5. Testing React behavior (useEffect timing, re-render counts)
6. Tests >200 lines for simple hooks

OUTPUT FORMAT per file:
| File | Lines | Mocks | Issues | Simplification Potential |
|------|-------|-------|--------|------------------------|
```

#### Agent 2: Component Tests (`unit-testing:test-automator`)
```
Analyze component test files for over-engineering.

FILES TO ANALYZE:
- src/**/components/**/*.test.tsx
- src/components/**/*.test.tsx

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
```

#### Agent 3: Utility/Library Tests (`unit-testing:test-automator`)
```
Analyze utility and library test files.

FILES TO ANALYZE:
- src/lib/**/*.test.ts
- src/**/utils/*.test.ts
- src/utils/**/*.test.ts

CHECK FOR ANTI-PATTERNS:
1. Testing trivial functions (one-liners, simple wrappers)
2. Mocking the function being tested
3. Testing third-party library behavior
4. Excessive edge case coverage for unlikely scenarios
5. Tests that duplicate integration/e2e coverage
```

### Phase 4: Generate Report

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

## High Priority Simplifications
[List files with specific issues and recommendations]

## Medium Priority
[Table of files with moderate issues]

## Files That Are Well-Designed
[List of gold standard tests]
```

### Phase 5: Multi-Agent Fix Workflow (If User Accepts)

After report, ask user if they want automated fixes. Launch agents in parallel for different categories.

---

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

**Option 1: Separate tsconfig for tests (Recommended)**

Create `tsconfig.test.json`:
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

Add to `package.json`:
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:tests": "tsc --noEmit -p tsconfig.test.json",
    "typecheck:all": "npm run typecheck && npm run typecheck:tests"
  }
}
```

Run: `npm run typecheck:tests`

**Option 2: Vitest typecheck flag**

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

**Option 3: Direct tsc (if no separate config)**

```bash
# Type check entire src (including tests)
tsc --noEmit

# Or create temp tsconfig including tests
tsc --noEmit --project tsconfig.json --include "src/**/*.test.ts" "src/**/*.test.tsx"
```

### Detecting Test Type Check Config

```bash
# Check if project has separate test tsconfig
if [ -f "tsconfig.test.json" ]; then
  echo "✅ Has tsconfig.test.json"
  npm run typecheck:tests 2>&1 || echo "❌ Type errors in tests!"
elif grep -q "typecheck:tests" package.json 2>/dev/null; then
  echo "✅ Has typecheck:tests script"
  npm run typecheck:tests 2>&1 || echo "❌ Type errors in tests!"
else
  echo "⚠️ No separate test typecheck - using main tsconfig"
  tsc --noEmit 2>&1 | grep -E "\.test\.(ts|tsx):" || echo "✅ No type errors in tests"
fi
```

### If Errors Are Found

1. **Fix `as any` casts** - Use proper types or factory functions
2. **Add missing properties** - Update mock data to match interfaces
3. **Update factories** - Keep factories in sync with current types
4. **Never use `@ts-ignore`** - Fix the underlying type issue

---

## Final Verification Checklist

After completing all phases, verify:

- [ ] **Tests pass:** `npm test` or `vitest run`
- [ ] **Types pass:** `npm run typecheck:tests` or `tsc --noEmit` (CRITICAL!)
- [ ] **Coverage maintained:** `npm run test:coverage`
- [ ] **No `as any`:** `grep -rn 'as any' src/ --include='*.test.ts*' | wc -l` = 0
- [ ] **No `@ts-ignore`:** `grep -rn '@ts-ignore\|@ts-expect-error' src/ --include='*.test.ts*' | wc -l` = 0

---

## Simplification Templates

### Over-Mocked Hook → Behavior Test
```typescript
// BEFORE: 15 mocks, 100 lines
vi.mock("dep1"); vi.mock("dep2"); // ... 15 mocks
describe("useComplexHook", () => {
  it("sets internal state A", () => { ... });
  it("sets internal state B", () => { ... });
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
});

// AFTER: Testing behavior
it("shows loading indicator while fetching", async () => {
  render(<MyComponent />);
  await user.click(screen.getByRole("button", { name: /fetch/i }));
  expect(screen.getByRole("progressbar")).toBeInTheDocument();
});
```

---

## Sources

Best practices based on:
- [Kent C. Dodds - Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Software Testing Anti-patterns](https://blog.codepipes.com/testing/software-testing-antipatterns.html)
- [Vitest Best Practices](https://vitest.dev/guide/)
- [Vitest Testing Types](https://vitest.dev/guide/testing-types)
- [Vitest Typecheck Config](https://vitest.dev/config/typecheck)
- [TypeScript Type Testing](https://www.totaltypescript.com/how-to-test-your-types)
- [Unit Testing Principles](https://canro91.github.io/2022/10/17/UnitTestingPrinciplesPracticesTakeaways/)
