# Remove Comments Workflow

Removes ALL comments from the codebase - JSDoc, multi-line, and unnecessary single-line comments. Only keeps single-line comments for truly non-obvious code.

## Execution

Run this workflow with parallel agents for different parts of the codebase.

---

## Rules

### REMOVE (Delete completely):
- All `/** JSDoc */` comments
- All `/* multi-line */` comments
- All `// TODO`, `// FIXME`, `// HACK`, `// XXX` comments
- All `// eslint-disable` comments (fix the issue instead or keep if truly necessary)
- All comments that explain WHAT code does (code should be self-documenting)
- All comments that restate the obvious
- All section dividers like `// ---- Section ----`
- All commented-out code

### KEEP (Only if truly necessary):
- `// WARNING:` or `// IMPORTANT:` for non-obvious gotchas
- Comments explaining WHY something unusual is done (not WHAT)
- Comments for regex patterns that are hard to read
- Comments for magic numbers that can't be extracted to constants
- License headers (if any)

### Examples

```typescript
// REMOVE - restates the obvious
// Check if user is logged in
if (user.isLoggedIn) { ... }

// REMOVE - JSDoc that just repeats function name
/**
 * Gets the user by ID
 * @param id - The user ID
 * @returns The user object
 */
function getUserById(id: string): User { ... }

// REMOVE - section divider
// ============ Handlers ============

// KEEP - explains WHY (non-obvious behavior)
// Safari doesn't support clipboard API in iframes
if (isIframe && isSafari) { ... }

// KEEP - magic number explanation
const DEBOUNCE_MS = 300; // Matches iOS keyboard animation duration
```

---

## Phase 1: Feature Components (Parallel)

### Task 1.1: Clean Chat Feature

```
Remove all comments from /Users/voitz/Projects/brokebot/src/features/chat/

Process ALL files in:
- src/features/chat/components/**/*.tsx
- src/features/chat/hooks/*.ts
- src/features/chat/utils/*.ts
- src/features/chat/lib/*.ts
- src/features/chat/constants/*.ts

For each file:
1. Read the file
2. Remove ALL JSDoc comments (/** ... */)
3. Remove ALL multi-line comments (/* ... */)
4. Remove single-line comments that:
   - Explain what code does (self-documenting)
   - Are section dividers
   - Are TODO/FIXME/HACK
   - Are commented-out code
5. KEEP only comments that explain non-obvious WHY
6. Write the cleaned file

Do NOT modify test files (*.test.ts, *.test.tsx)

After cleaning, verify: npm run build
```

**Agent**: `code-simplifier:code-simplifier`

### Task 1.2: Clean Settings Feature

```
Remove all comments from /Users/voitz/Projects/brokebot/src/features/settings/

Process ALL files in:
- src/features/settings/components/*.tsx
- src/features/settings/hooks/*.ts

Rules:
- Remove ALL JSDoc comments
- Remove ALL multi-line comments
- Remove obvious single-line comments
- KEEP only truly necessary WHY comments

Do NOT modify test files.

After cleaning, verify: npm run build
```

**Agent**: `code-simplifier:code-simplifier`

### Task 1.3: Clean Other Features

```
Remove all comments from /Users/voitz/Projects/brokebot/src/features/

Process files in:
- src/features/layout/**/*.ts
- src/features/layout/**/*.tsx
- src/features/onboarding/**/*.ts
- src/features/onboarding/**/*.tsx
- src/features/documents/**/*.ts
- src/features/documents/**/*.tsx
- src/features/welcome/**/*.ts
- src/features/welcome/**/*.tsx

Rules:
- Remove ALL JSDoc comments
- Remove ALL multi-line comments
- Remove obvious single-line comments
- KEEP only truly necessary WHY comments

Do NOT modify test files.

After cleaning, verify: npm run build
```

**Agent**: `code-simplifier:code-simplifier`

---

## Phase 2: Shared Code (Parallel)

### Task 2.1: Clean Components

```
Remove all comments from /Users/voitz/Projects/brokebot/src/components/

Process ALL files:
- src/components/**/*.tsx
- src/components/**/*.ts

EXCEPTION: Skip shadcn/ui components in src/components/ui/ that are clearly generated (they have specific patterns). Only clean custom components.

Rules:
- Remove ALL JSDoc comments
- Remove ALL multi-line comments
- Remove obvious single-line comments
- KEEP only truly necessary WHY comments

After cleaning, verify: npm run build
```

**Agent**: `code-simplifier:code-simplifier`

### Task 2.2: Clean Hooks and Lib

```
Remove all comments from /Users/voitz/Projects/brokebot/src/hooks/ and /Users/voitz/Projects/brokebot/src/lib/

Process:
- src/hooks/*.ts (not test files)
- src/lib/*.ts (not test files)
- src/lib/**/*.ts (not test files)

Rules:
- Remove ALL JSDoc comments
- Remove ALL multi-line comments
- Remove obvious single-line comments
- KEEP only truly necessary WHY comments

After cleaning, verify: npm run build
```

**Agent**: `code-simplifier:code-simplifier`

### Task 2.3: Clean App Directory

```
Remove all comments from /Users/voitz/Projects/brokebot/src/app/

Process:
- src/app/*.tsx
- src/app/*.ts
- src/app/providers/*.tsx
- src/app/modals/*.tsx
- src/app/pages/*.tsx

Rules:
- Remove ALL JSDoc comments
- Remove ALL multi-line comments
- Remove obvious single-line comments
- KEEP only truly necessary WHY comments

After cleaning, verify: npm run build
```

**Agent**: `code-simplifier:code-simplifier`

---

## Phase 3: Config and Types

### Task 3.1: Clean Config and Types

```
Remove all comments from config and type files in /Users/voitz/Projects/brokebot/src/

Process:
- src/config/*.ts
- src/types/*.ts
- src/types/**/*.ts

Rules:
- Remove ALL JSDoc comments (types should be self-documenting)
- Remove ALL multi-line comments
- Remove obvious single-line comments
- KEEP only truly necessary WHY comments

After cleaning, verify: npm run build
```

**Agent**: `code-simplifier:code-simplifier`

---

## Phase 4: Final Verification

### Task 4.1: Verify and Report

```
After all comment removal, run verification:

1. Build check:
npm run build

2. Test check:
npm test -- --run

3. Count remaining comments:
echo "=== Remaining comments ==="
grep -rn "^\s*//" src/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "node_modules" | wc -l

echo "=== Remaining JSDoc ==="
grep -rn "/\*\*" src/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "node_modules" | wc -l

echo "=== Sample of kept comments ==="
grep -rn "^\s*//" src/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "node_modules" | head -20

4. Report:
- Build: PASS/FAIL
- Tests: X passed
- Comments remaining: X single-line, X JSDoc
- Sample of kept comments (verify they're necessary)
```

**Agent**: `unit-testing:test-automator`

---

## Usage

Execute this workflow:
```
/remove-comments
```

## Notes

- Test files are NOT modified (comments in tests can be helpful)
- If build fails after removing comments, the agent should restore and investigate
- Prettier/ESLint may reformat after comment removal - this is expected
