# Fix Test Types

Systematic workflow to find and fix TypeScript errors in test files.

---

## Execution

### Step 1: Run Type Check

```bash
npm run typecheck:tests 2>&1
```

### Step 2: Analyze Errors

For each error, determine the fix category:

| Error Type | Fix Approach |
|------------|--------------|
| Missing property | Add property to mock/test data |
| Type mismatch | Use factory function or fix mock type |
| Method doesn't exist (ES version) | Check tsconfig.test.json lib setting |
| Import error | Fix import path or add to tsconfig types |
| `as any` needed | Create proper typed mock instead |

### Step 3: Apply Fixes

**DO NOT use:**
- `as any` casts
- `@ts-ignore` or `@ts-expect-error`
- Type assertions that don't match reality

**DO use:**
- Factory functions from `src/testing/mocks/factories.ts`
- Properly typed mock implementations
- Complete test data matching interfaces

### Step 4: Verify

```bash
npm run typecheck:tests && npm test -- --run
```

---

## Common Fixes

### Missing Mock Properties

```typescript
// ❌ BAD - Missing required properties
const mockUser = { id: "1" };

// ✅ GOOD - Complete data
const mockUser: User = {
  id: "1",
  name: "Test",
  email: "test@example.com",
  createdAt: new Date(),
};

// ✅ BETTER - Use factory
import { createMockUser } from "@/testing/mocks/factories";
const mockUser = createMockUser({ id: "1" });
```

### ES Version Errors (findLast, etc.)

If you see errors like "Property 'findLast' does not exist", check:
1. `tsconfig.test.json` has `"lib": ["ES2023", "DOM", "DOM.Iterable"]`
2. Root `tsconfig.json` also uses ES2023

### Vi.mock Type Issues

```typescript
// ❌ BAD - Untyped mock
vi.mock("@/lib/api", () => ({ getUser: vi.fn() }));

// ✅ GOOD - Typed mock
vi.mock("@/lib/api", () => ({
  getUser: vi.fn<typeof import("@/lib/api").getUser>(),
}));
```

---

## Workflow

1. Run `npm run typecheck:tests`
2. Fix errors ONE file at a time
3. Re-run type check after each file
4. Run tests to ensure fixes don't break behavior
