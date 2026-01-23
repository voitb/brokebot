# Quick Check - Automated Validation

Fast automated checks that can run without agents. Use this for quick validation before commits.

## Execution

Run these checks in sequence:

### Step 1: Type Check
```bash
npm run build 2>&1 | head -50
```

If errors, note them for fixing.

### Step 2: Lint Check
```bash
npm run lint 2>&1 | head -50
```

If errors, note them for fixing.

### Step 3: Test Check
```bash
npm test -- --run 2>&1 | tail -30
```

Note pass/fail status.

### Step 4: Common Anti-Pattern Scan

Run these grep commands to find common issues:

```bash
echo "=== Checking for 'as any' casts ==="
grep -rn "as any" src/ --include="*.ts" --include="*.tsx" | grep -v ".test." | head -10

echo ""
echo "=== Checking for @ts-ignore ==="
grep -rn "@ts-ignore\|@ts-expect-error" src/ --include="*.ts" --include="*.tsx" | head -10

echo ""
echo "=== Checking for forwardRef (deprecated in React 19) ==="
grep -rn "forwardRef" src/ --include="*.tsx" | head -10

echo ""
echo "=== Checking for console.log ==="
grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx" | grep -v ".test." | head -10

echo ""
echo "=== Checking for TODO/FIXME ==="
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx" | head -10

echo ""
echo "=== Checking for inline styles ==="
grep -rn "style={{" src/ --include="*.tsx" | head -10

echo ""
echo "=== Checking for fireEvent in tests (should use userEvent) ==="
grep -rn "fireEvent\." src/ --include="*.test.tsx" | head -10
```

### Step 5: Structure Check

```bash
echo "=== Checking for files in wrong locations ==="

# CSS at root
ls src/*.css 2>/dev/null && echo "⚠️ CSS files at src/ root"

# Missing feature index.ts
for dir in src/features/*/; do
  [ ! -f "${dir}index.ts" ] && echo "⚠️ Missing: ${dir}index.ts"
done

# shared/ folder (should not exist)
[ -d "src/shared" ] && echo "⚠️ src/shared/ exists - should be migrated"

# pages/ at root (should be in app/)
[ -d "src/pages" ] && echo "⚠️ src/pages/ exists - should be in src/app/pages/"

# test/ instead of testing/
[ -d "src/test" ] && echo "⚠️ src/test/ exists - should be src/testing/"

echo "=== Structure check complete ==="
```

### Step 6: Import Violation Check

```bash
echo "=== Checking for import violations ==="

# Shared modules importing from features
echo "Checking components/ for feature imports..."
grep -rn "from ['\"]@/features" src/components/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -5

echo "Checking hooks/ for feature imports..."
grep -rn "from ['\"]@/features" src/hooks/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -5

echo "Checking lib/ for feature imports..."
grep -rn "from ['\"]@/features" src/lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -5

echo "=== Import check complete ==="
```

## Output Format

After running all checks, summarize:

```markdown
## Quick Check Results

| Check | Status | Issues |
|-------|--------|--------|
| Type Check | ✅/❌ | N errors |
| Lint | ✅/❌ | N errors |
| Tests | ✅/❌ | N failing |
| Anti-patterns | ✅/⚠️ | N found |
| Structure | ✅/⚠️ | N issues |
| Imports | ✅/⚠️ | N violations |

### Issues to Fix
1. [Issue from checks]
2. [Issue from checks]

### Recommended Next Steps
- [ ] Fix type errors
- [ ] Fix lint errors
- [ ] Run /fix-tests for test failures
- [ ] Run /validate-all for deep analysis
```

## Pre-Commit Checklist

Before committing, ensure:
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm test -- --run` passes
- [ ] No `as any` added
- [ ] No console.log added
- [ ] No TODO without ticket reference

## Quick Fix Commands

If issues found:

```bash
# Auto-fix lint issues
npm run lint -- --fix

# Run specific test file
npm test -- --run src/path/to/file.test.tsx

# Type check only (no build)
npx tsc --noEmit
```
