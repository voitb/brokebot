# Fix Failing Tests

Systematically fix all failing tests and code quality issues with proper solutions (NO `as any`, NO type assertions to bypass issues).

## Execution Process

### Step 1: Run All Quality Checks
Run all checks in sequence to identify issues:

```bash
# Type check app code
npm run typecheck 2>&1 | head -50

# Type check test files
npm run typecheck:tests 2>&1 | head -50

# Lint check
npm run lint 2>&1 | head -50

# Run tests
npm test -- --run 2>&1 | tail -30
```

### Step 2: Categorize Issues

**Type Errors** (from typecheck):
- Missing properties on interfaces
- Incorrect function signatures
- Module resolution issues

**Lint Errors** (from lint):
- `no-empty`: Empty block statements - add comment or logic
- `react-hooks/exhaustive-deps`: Missing hook dependencies
- Other ESLint rule violations

**Test Failures** (from test run):
- Type mismatches in test data
- Mock issues
- Runtime errors

### Step 3: Fix Priority Order

1. **Type errors first** - These block everything else
2. **Lint errors** - Fix actual errors (not warnings)
3. **Test failures** - Fix failing tests
4. **Lint warnings** - Address if time permits

### Step 4: Fix Strategy by Category

#### Type Errors
1. Read the source file to understand the CURRENT interface
2. Update code to match the interface EXACTLY
3. Check for missing imports or path alias issues

#### Empty Block Statements (`no-empty`)
Add a comment explaining why the block is intentionally empty:
```typescript
// WRONG
catch (error) {}

// RIGHT
catch {
  // Intentionally ignored - error handled elsewhere
}
```

#### Missing Hook Dependencies (`react-hooks/exhaustive-deps`)
Either add the dependency or use a ref:
```typescript
// Option 1: Add to dependency array (if safe)
useEffect(() => {
  onCallback();
}, [onCallback]);

// Option 2: Use ref for stable reference (if callback changes frequently)
const onCallbackRef = useRef(onCallback);
onCallbackRef.current = onCallback;
useEffect(() => {
  onCallbackRef.current();
}, []);
```

#### Test Type Mismatches
1. Read the source file to understand the CURRENT interface
2. Update test data to match the interface EXACTLY
3. Use proper type imports, not inline type assertions
4. If a property is required, ADD it to test data (don't cast)

**WRONG:**
```typescript
const mockData = { id: "1", name: "test" } as SomeType; // NO!
```

**RIGHT:**
```typescript
const mockData: SomeType = {
  id: "1",
  name: "test",
  requiredField: "value", // Add ALL required fields
  createdAt: new Date(),
};
```

#### Mock Issues
1. Read the actual implementation being mocked
2. Ensure mock returns match the real return types
3. Use `vi.fn()` with proper typed return values

### Step 5: Final Validation
After all fixes, run the full check:
```bash
npm run typecheck && npm run typecheck:tests && npm run lint && npm test -- --run
```

## Quality Rules

### DO:
- Read source files before fixing
- Match data to actual interfaces
- Create proper factory functions for test data
- Use `satisfies` for type checking without assertion
- Add missing required properties with sensible defaults

### DON'T:
- Use `as any` to bypass type errors
- Use `@ts-ignore` or `@ts-expect-error`
- Cast to types without verifying data matches
- Delete tests that are hard to fix
- Comment out failing assertions
- Disable ESLint rules without good reason

## Shadcn Component Exclusions

**Do NOT create tests** for standard shadcn/ui components:
- `src/components/ui/` contains 26 shadcn components - library code, no tests needed

**DO create tests** for custom UI components:
- auto-size-textarea, copy-button, input-dialog, loading-dots, logo
- provider-icons, route-loading-fallback, sidebar (custom parts)
- sonner, status-indicator, truncated-text

## Test Data Factory Pattern

Create factories in `src/testing/factories/` for reusable test data:

```typescript
// src/testing/factories/conversation.ts
import type { Conversation } from "@/lib/db";

export function createMockConversation(overrides?: Partial<Conversation>): Conversation {
  return {
    id: crypto.randomUUID(),
    title: "Test Conversation",
    messages: [],
    model: "test-model",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

## Common Mocks Reference

### localStorage Mock
```typescript
beforeEach(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    length: 0,
    key: vi.fn(),
  });
});
```

### matchMedia Mock
```typescript
beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
});
```

## Agents to Use

Launch these agents IN PARALLEL for different issues:

1. **general-purpose**: For analyzing and fixing individual files
2. **unit-testing:test-automator**: For comprehensive test strategy
3. **unit-testing:debugger**: For debugging specific test failures

## Output

After fixing all issues, report:

| Check | Status |
|-------|--------|
| Type errors (app) | X |
| Type errors (tests) | X |
| Lint errors | X |
| Lint warnings | X |
| Tests passing | X/Y |

**Fixed:** (list what was fixed)
**Remaining:** (if any, explain why)
