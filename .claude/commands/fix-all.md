# Fix All Issues - Multi-Agent Workflow

Automated workflow that dispatches multiple specialized agents in parallel to fix all validation issues and achieve 10/10 scores.

## Prerequisites

Run `/validate-all` first to identify current issues.

## Execution

This workflow uses multiple agents **IN PARALLEL** to fix issues across different domains.

### Phase 1: Analysis (Sequential)

First, run quick checks to identify what needs fixing:

```bash
# Collect current state
npm run build 2>&1 | grep -E "error|warning" | head -20
npm run lint 2>&1 | head -20
npm test -- --run 2>&1 | grep -E "FAIL|Error" | head -20
```

### Phase 2: Parallel Fixes

Launch these agents simultaneously to fix issues:

#### Agent 1: TypeScript Fixer (`javascript-typescript:typescript-pro`)
```
Fix all TypeScript issues in /Users/voitz/Projects/brokebot/src:

TASKS:
1. Find and fix all `as any` casts - replace with proper types or type guards
2. Find and fix unsafe URL param type assertions - add type guards
3. Replace index signatures `{ [key: string]: T }` with `Record<string, T>`
4. Remove trailing semicolons from function component exports
5. Fix any non-null assertions (!) that can be replaced with proper guards

EXCLUSIONS:
- Test files in src/testing/mocks/ can use `as unknown as T` for DOM mocks
- This is acceptable for mocking browser APIs

READ files before editing. Run `npm run build` to verify fixes.
```

#### Agent 2: React Patterns Fixer (`react-principles`)
```
Fix all React anti-patterns in /Users/voitz/Projects/brokebot/src:

TASKS:
1. Find useEffect used for derived state - convert to lazy useState or inline computation
2. Find missing cleanup functions in useEffect - add them
3. Find forwardRef usage - convert to ref prop (React 19)
4. Find useMemo/useCallback with empty deps for static data - move to module level
5. Ensure all event handlers use handle* prefix

EXCLUSIONS:
- src/components/ui/ - shadcn components should NOT be modified
- ErrorBoundary class component is required (no functional equivalent)

READ files before editing. Run `npm test -- --run` to verify fixes.
```

#### Agent 3: Test Fixer (`unit-testing:test-automator`)
```
Fix all test issues in /Users/voitz/Projects/brokebot/src:

TASKS:
1. Fix any failing tests - read source to understand expected behavior
2. Fix tests with `as any` casts - use proper factory functions
3. Fix tests missing proper async handling (act warnings)
4. Add missing aria-label queries where tests use generic getByRole
5. Ensure mocks match actual interfaces

APPROACH:
- Read the SOURCE file first to understand the interface
- Update test data to match the actual interface
- Use existing factory functions in src/testing/mocks/

Run `npm test -- --run` to verify all tests pass.
```

#### Agent 4: Accessibility Fixer (`react-component-architect`)
```
Fix accessibility issues in /Users/voitz/Projects/brokebot/src:

TASKS:
1. Add missing aria-labels to icon-only buttons
2. Add missing aria-describedby to dialogs without descriptions
3. Ensure interactive elements are keyboard accessible
4. Add role attributes where missing
5. Fix any semantic HTML issues (div with onClick -> button)

SCAN:
- src/features/*/components/
- src/components/ (except ui/)

READ files before editing. Check with screen reader mental model.
```

### Phase 3: Verification (Sequential)

After all agents complete, verify the fixes:

```bash
# Full verification
npm run build 2>&1 | head -20
npm run lint 2>&1 | head -20
npm test -- --run 2>&1 | tail -20

# Should see:
# - Build: 0 errors
# - Lint: 0 errors
# - Tests: All passing
```

### Phase 4: Final Report

Generate the final validation report:

```markdown
# Fix-All Completion Report

## Fixes Applied

### TypeScript
- [ ] Type assertions replaced with guards: N
- [ ] Index signatures modernized: N
- [ ] Trailing semicolons removed: N

### React Patterns
- [ ] useEffect anti-patterns fixed: N
- [ ] Event handler naming fixed: N
- [ ] forwardRef converted to ref prop: N

### Tests
- [ ] Failing tests fixed: N
- [ ] Test type safety improved: N
- [ ] Async handling fixed: N

### Accessibility
- [ ] aria-labels added: N
- [ ] Keyboard navigation fixed: N
- [ ] Semantic HTML improved: N

## Final Scores
| Category | Before | After |
|----------|--------|-------|
| React Patterns | X/10 | 10/10 |
| TypeScript | X/10 | 10/10 |
| Hooks | X/10 | 10/10 |
| Components | X/10 | 10/10 |
| Tests | X/10 | 10/10 |
| Build | ❌/✅ | ✅ |
| Lint | ❌/✅ | ✅ |

## Remaining Items (if any)
- None - all issues resolved
```

## Agents Used

| Agent | Domain | Purpose |
|-------|--------|---------|
| `javascript-typescript:typescript-pro` | TypeScript | Type safety fixes |
| `react-principles` | React | Pattern compliance |
| `unit-testing:test-automator` | Testing | Test fixes |
| `react-component-architect` | Components | Accessibility & architecture |

## Important Notes

1. **Do NOT modify shadcn/ui components** in `src/components/ui/` - they are intentionally structured as compound components
2. **Test mocks can use double casts** - `as unknown as T` is acceptable for DOM API mocks
3. **ErrorBoundary must remain a class** - React has no functional equivalent for error boundaries
4. **Run verification after each phase** - ensure fixes don't introduce new issues

## Quick Command

To run this workflow:
```
/fix-all
```

This will:
1. Analyze current issues
2. Dispatch 4 agents in parallel
3. Verify all fixes
4. Generate completion report
