# Full Codebase Audit - Comprehensive Project Health Check

A state-of-the-art codebase audit workflow that validates your project against 2026 React/TypeScript best practices, Bulletproof React architecture, and clean code principles.

## Research References

Based on 2026 best practices from:
- [React Compiler - No More useMemo/useCallback](https://certificates.dev/blog/react-compiler-no-more-usememo-and-usecallback)
- [React Fundamentals 2026](https://www.nucamp.co/blog/react-fundamentals-in-2026-components-hooks-react-compiler-and-modern-ui-development)
- [useEffectEvent Documentation](https://react.dev/reference/react/useEffectEvent)
- [Bulletproof React Architecture](https://github.com/alan2207/bulletproof-react)
- [TypeScript Best Practices 2026](https://johal.in/typescript-best-practices-for-large-scale-web-applications-in-2026/)
- [SOLID, KISS, DRY, YAGNI in React](https://www.gperrucci.com/en/blog/engineering/solid-clean-yagni-kiss)

## Core Principles Validated

| Principle | Description |
|-----------|-------------|
| **KISS** | Keep It Simple, Stupid - No over-engineering |
| **DRY** | Don't Repeat Yourself - But not at cost of readability |
| **YAGNI** | You Aren't Gonna Need It - No speculative features |
| **SRP** | Single Responsibility Principle - One reason to change |
| **React Compiler** | Auto-memoization - Manual hooks only when measured |
| **Bulletproof** | Feature-based, unidirectional code flow |

## Global Exclusions

### Shadcn/UI Components
All audit agents should **skip `src/components/ui/`** except these custom components:
- auto-size-textarea.tsx, copy-button/, input-dialog.tsx, loading-dots.tsx
- logo.tsx, provider-icons.tsx, route-loading-fallback.tsx, sidebar/ (custom)
- sonner.tsx, status-indicator.tsx, truncated-text.tsx

Standard shadcn components are library code - excluded from:
- Test coverage requirements
- React pattern validation
- TypeScript quality checks
- Component architecture checks
- Performance optimization suggestions

---

## Phase 1: Project Structure Analysis (Parallel)

Launch these agents **simultaneously**:

### Agent 1: `project-analyst` - Tech Stack Detection
```
Analyze . to detect:

1. TECH STACK INVENTORY
- All dependencies in package.json
- React version and compiler status
- Build tools (Vite, Webpack, etc.)
- State management solution
- Testing framework
- UI component library

2. STRUCTURE OVERVIEW
- List all top-level src/ directories
- Count files per directory
- Identify entry points

Output: JSON-formatted tech stack summary
```

### Agent 2: `code-archaeologist` - Deep Structure Exploration
```
Explore ./src and document:

1. DIRECTORY ANALYSIS
- Complete tree structure with file counts
- Purpose of each directory (inferred from contents)
- Barrel file (index.ts) presence per folder

2. ARCHITECTURAL PATTERNS
- Feature-based vs flat structure detection
- Component organization style
- Hook organization style
- Shared vs feature-specific code ratio

3. TECHNICAL DEBT INDICATORS
- Orphaned files (no imports)
- Circular dependencies
- Overly deep nesting (>4 levels)
- Mixed concerns in folders

Output: Structured exploration report
```

### Agent 3: `code-architect` - Bulletproof React Compliance
```
Audit ./src against Bulletproof React architecture:

EXPECTED STRUCTURE:
src/
├── app/                 # Routes, providers, entry point
├── assets/              # Static files (images, fonts, styles)
├── components/          # SHARED UI components ONLY
├── config/              # Global configuration
├── features/            # Feature modules (the heart)
│   └── [feature]/
│       ├── api/         # Feature API calls
│       ├── components/  # Feature-specific components
│       ├── hooks/       # Feature-specific hooks
│       ├── stores/      # Feature state (if needed)
│       ├── types/       # Feature types
│       ├── utils/       # Feature utilities
│       └── index.ts     # Public API (barrel)
├── hooks/               # SHARED hooks ONLY
├── lib/                 # Pre-configured libraries
├── stores/              # Global state
├── testing/             # Test utilities
├── types/               # SHARED types ONLY
└── utils/               # SHARED utilities ONLY

CHECK FOR VIOLATIONS:
❌ Components in wrong location (feature-specific in shared)
❌ Hooks in wrong location (feature-specific in shared)
❌ Cross-feature imports (feature A importing from feature B)
❌ Reverse imports (shared importing from features)
❌ Missing barrel files (index.ts)
❌ Mixed concerns (UI + business logic in same component)
❌ Deeply nested folders (>3 levels within feature)

Output: Compliance report with specific violations and fixes
```

---

## Phase 2: Code Quality Analysis (Parallel)

### Agent 4: `react-principles` - React 2026 Patterns
```
Audit ./src for React 2026 state-of-the-art:

## REACT COMPILER ERA CHECKS

✅ CORRECT (React Compiler handles optimization):
- Inline event handlers (compiler memoizes)
- Inline object/array literals (compiler detects stability)
- Computed values without useMemo
- Functions without useCallback

❌ UNNECESSARY MEMOIZATION (flag these):
- useMemo with [] deps for static data → use module const
- useCallback with [] deps for handlers → just inline it
- React.memo() everywhere → compiler does this
- useMemo for simple string concatenation

⚠️ WHEN MANUAL MEMOIZATION IS STILL NEEDED:
- Expensive computations (>1ms) with measured bottleneck
- Callbacks passed to libs that require stable refs
- useEffect deps that need reference equality
- Context values to prevent consumer re-renders

## useEffectEvent PATTERN (React 19.2+)

✅ USE useEffectEvent FOR:
- Callbacks in effects that need latest state
- Event handlers called from effects
- Avoiding stale closures without adding deps

❌ LEGACY PATTERN TO REPLACE:
// OLD: causes effect to re-run on every handler change
const handleClick = useCallback(() => { ... }, [dependency]);
useEffect(() => { element.addEventListener('click', handleClick); }, [handleClick]);

// NEW: stable reference, always has latest values
const onEvent = useEffectEvent(() => { ... });
useEffect(() => { element.addEventListener('click', onEvent); }, []);

## FILES TO SCAN
- All .tsx files in src/
- Priority: components/, features/*/components/

Output: Violations list with file:line and modernization suggestions
```

### Agent 5: `react-component-architect` - Hooks Deep Dive
```
Audit all custom hooks in ./src:

## HOOK QUALITY CHECKLIST

### Single Responsibility (SRP)
Each hook should do ONE thing well:
❌ useAuth that handles login, logout, token refresh, and profile fetch
✅ useAuth for auth state + useLogin + useLogout + useTokenRefresh

### Simplicity (KISS)
Hooks should be easy to understand at a glance:
❌ Complex hooks with 10+ useState calls
❌ Hooks with 100+ lines
❌ Deeply nested conditional logic
✅ Short, focused hooks (<50 lines ideal)
✅ Linear, predictable logic flow

### No Speculation (YAGNI)
Don't add features "just in case":
❌ Options objects with 10 configuration params
❌ Support for edge cases that don't exist
❌ Generic abstractions for single use case
✅ Minimal API surface
✅ Add complexity only when needed

### DRY Without Over-Abstraction
Balance reuse with readability:
❌ Premature abstraction for 2 similar hooks
❌ Generic hook that's harder to understand than duplication
✅ Extract only when 3+ instances exist
✅ Keep abstractions simple and obvious

## EFFECT BEST PRACTICES

✅ CORRECT:
- Cleanup functions for all subscriptions
- AbortController for fetch operations
- Race condition handling for async
- Dependencies that reflect actual values used

❌ ANTI-PATTERNS:
- useEffect for derived state (compute inline!)
- Missing cleanup for intervals/subscriptions
- Empty deps [] when values are actually used
- Object/array deps that change every render
- Async directly in useEffect callback

## SCAN LOCATIONS
1. src/hooks/
2. src/features/*/hooks/
3. Any use* functions outside hook folders

Output: Hook-by-hook analysis with quality scores and specific fixes
```

### Agent 6: `typescript-pro` - TypeScript Quality
```
Audit TypeScript implementation in ./src:

## TYPE SAFETY STANDARDS

✅ GOOD PATTERNS:
- Strict mode enabled (all flags)
- Discriminated unions for state machines
- Proper generic constraints
- Type guards with `is` keyword
- `satisfies` for type checking
- Zod inference (z.infer<typeof schema>)
- Const assertions for readonly data

❌ TYPE SMELL INDICATORS:
- `as any` - always a red flag
- `as unknown as T` - double cast smell
- `@ts-ignore` / `@ts-expect-error` - hiding problems
- Non-null assertion (!) without justification
- `object` or `{}` types (use Record<string, unknown>)
- Enum overuse (prefer const objects with as const)
- Index signatures where Map is better

## NAMING CONVENTIONS

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | chat-header.tsx |
| Components | PascalCase | ChatHeader |
| Hooks | use prefix | useChatInput |
| Functions | camelCase | handleSubmit |
| Async funcs | get/load/fetch | getUser, loadData |
| Booleans | is/has/should | isLoading, hasError |
| Constants | UPPER_SNAKE | MAX_FILE_SIZE |
| Types | PascalCase | UserConfig (no I prefix) |

Output: Categorized violations (critical/warning/info) with fixes
```

---

## Phase 3: Clean Code Principles (Parallel)

### Agent 7: `code-reviewer` - KISS/DRY/YAGNI/SRP Analysis
```
Audit ./src for clean code principles:

## KISS VIOLATIONS (Over-Engineering)

Look for:
❌ Abstraction for single use case
❌ Factory patterns where simple function works
❌ Multiple layers of indirection
❌ Configuration objects with 10+ options
❌ Generic helpers that obscure intent
❌ Class-based patterns in functional codebase
❌ Event emitter for local state changes

## DRY VIOLATIONS (But Not Over-DRY)

Look for:
❌ Copy-pasted code blocks (3+ instances)
❌ Similar functions that could be parameterized
❌ Repeated validation logic
❌ Duplicate type definitions

BUT ALSO:
❌ Premature DRY - abstraction harder to read than duplication
❌ Wrong abstraction - shared code that isn't actually the same concern

## YAGNI VIOLATIONS (Speculative Features)

Look for:
❌ Unused parameters "for future use"
❌ Configuration for hypothetical requirements
❌ Multiple export formats when one is used
❌ Commented-out code "in case we need it"
❌ TODO comments for features not in roadmap

## SRP VIOLATIONS (Mixed Concerns)

Look for:
❌ Components with UI + business logic + data fetching
❌ Hooks that manage multiple unrelated states
❌ Utils files with 20+ unrelated functions
❌ Single file with 500+ lines
❌ Functions with 5+ responsibilities

## FILE SIZE GUIDELINES

| Type | Ideal | Warning | Critical |
|------|-------|---------|----------|
| Component | <150 LOC | 150-300 | >300 |
| Hook | <50 LOC | 50-100 | >100 |
| Utility | <30 LOC | 30-50 | >50 |
| Test | <200 LOC | 200-400 | >400 |

Output: Principle-by-principle violations with severity and refactoring suggestions
```

### Agent 8: `performance-optimizer` - Performance Patterns
```
Audit ./src for performance anti-patterns:

## MEMOIZATION ANALYSIS

❌ UNNECESSARY (React Compiler handles):
- useCallback for simple event handlers
- useMemo for simple computations
- React.memo on most components
- useMemo with [] for constants

✅ STILL NEEDED (profile to confirm):
- Expensive computations (filter/sort large arrays)
- Callbacks passed to optimized 3rd party components
- Context providers to prevent cascade re-renders
- Reference equality for effect dependencies

## BUNDLE CONCERNS

Look for:
❌ Large imports not code-split
❌ Missing dynamic imports for routes
❌ Heavy dependencies for simple tasks
❌ moment.js (use date-fns or native Intl)
❌ lodash full import (use lodash-es tree-shaking)

## RENDER OPTIMIZATION

Look for:
❌ State updates in render (causes infinite loop)
❌ Object/array literals in JSX causing re-renders
❌ Missing keys or index keys in lists
❌ Prop drilling causing unnecessary re-renders

Output: Performance issues categorized by impact (high/medium/low)
```

---

## Phase 4: Integration Verification (Sequential)

After parallel phases complete, run these **sequentially**:

```bash
# 1. TypeScript compilation check
npm run build 2>&1 | head -100

# 2. ESLint with React Compiler rules
npm run lint 2>&1 | head -100

# 3. Test suite
npm test -- --run 2>&1 | tail -100

# 4. Check for import violations
# Cross-feature imports (bad)
grep -r "from ['\"]@/features/" src/features/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "/index" | head -20

# Shared importing from features (bad)
grep -r "from ['\"]@/features/" src/components/ src/hooks/ src/lib/ src/utils/ src/types/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -20
```

---

## Phase 5: Generate Report

Compile all agent outputs into a comprehensive report:

```markdown
# Full Codebase Audit Report - [DATE]

## Executive Summary

| Area | Score | Critical | Warnings |
|------|-------|----------|----------|
| Project Structure | X/10 | N | N |
| React Patterns | X/10 | N | N |
| Hooks Quality | X/10 | N | N |
| TypeScript | X/10 | N | N |
| Clean Code | X/10 | N | N |
| Performance | X/10 | N | N |
| **OVERALL** | **X/10** | **N** | **N** |

## Health Assessment

🟢 **Healthy** (8-10): Excellent practices, minor improvements
🟡 **Needs Work** (5-7): Significant issues, create improvement plan
🔴 **Critical** (0-4): Major refactoring required

## Top 5 Priority Issues

1. [Issue] - `file:line` - [Impact: High/Med/Low]
2. [Issue] - `file:line` - [Impact: High/Med/Low]
3. [Issue] - `file:line` - [Impact: High/Med/Low]
4. [Issue] - `file:line` - [Impact: High/Med/Low]
5. [Issue] - `file:line` - [Impact: High/Med/Low]

## Structure Compliance (Bulletproof React)

### Compliant ✅
- [x] Feature-based organization
- [x] Barrel files present
- ...

### Non-Compliant ❌
- [ ] Cross-feature imports found: N files
- [ ] Misplaced components: N files
- ...

## React 2026 Modernization

### Already Modern ✅
- [x] Using React Compiler
- [x] No forwardRef
- ...

### Needs Update ⚠️
- [ ] N instances of unnecessary useMemo
- [ ] N instances of unnecessary useCallback
- ...

## Hook Quality Summary

| Hook | File | Score | Issues |
|------|------|-------|--------|
| useX | path | X/10 | Issue |

## Clean Code Violations

### KISS Violations (Over-Engineering)
| File | Line | Description | Fix |
|------|------|-------------|-----|

### YAGNI Violations (Speculative)
| File | Line | Description | Fix |
|------|------|-------------|-----|

### SRP Violations (Mixed Concerns)
| File | Line | Description | Fix |
|------|------|-------------|-----|

## Recommended Action Plan

### Immediate (This Sprint)
1. [ ] Fix critical issues
2. [ ] Address security concerns

### Short-Term (This Month)
1. [ ] Modernize memoization patterns
2. [ ] Fix structure violations

### Long-Term (This Quarter)
1. [ ] Full Bulletproof React alignment
2. [ ] Comprehensive test coverage

## Follow-Up Commands

After fixing issues, validate with:
- `/quick-check` - Fast validation
- `/validate-all` - Full validation
- `/fix-tests` - If tests fail
```

---

## Agents Summary

| Phase | Agent | Purpose | Run Mode |
|-------|-------|---------|----------|
| 1 | `project-analyst` | Tech stack detection | Parallel |
| 1 | `code-archaeologist` | Deep structure exploration | Parallel |
| 1 | `code-architect` | Bulletproof compliance | Parallel |
| 2 | `react-principles` | React 2026 patterns | Parallel |
| 2 | `react-component-architect` | Hook quality | Parallel |
| 2 | `typescript-pro` | TypeScript quality | Parallel |
| 3 | `code-reviewer` | KISS/DRY/YAGNI/SRP | Parallel |
| 3 | `performance-optimizer` | Performance patterns | Parallel |
| 4 | `Bash` | Integration checks | Sequential |

---

## Quick Reference

### When useMemo IS Needed (React Compiler Era)
```typescript
// ✅ Expensive computation with measured bottleneck
const sorted = useMemo(() =>
  hugeArray.sort((a, b) => a.score - b.score),
  [hugeArray]
);

// ✅ Context value to prevent consumer re-renders
const contextValue = useMemo(() => ({ user, login, logout }), [user]);

// ✅ Reference equality for effect deps
const config = useMemo(() => ({ timeout: 5000, retry: 3 }), []);
useEffect(() => { initLibrary(config); }, [config]);
```

### When useMemo is NOT Needed
```typescript
// ❌ Static data - use module const
const OPTIONS = [{ value: 'a' }, { value: 'b' }]; // outside component

// ❌ Simple computation - compiler handles
const fullName = `${first} ${last}`; // just inline it

// ❌ Object literal in JSX - compiler handles
<Button style={{ color: 'red' }} /> // fine now
```

### useEffectEvent Pattern (React 19.2+)
```typescript
// ✅ Stable callback with latest values
const onVisit = useEffectEvent((url: string) => {
  logVisit(url, currentUser); // always has latest currentUser
});

useEffect(() => {
  onVisit(location.pathname);
}, [location.pathname]); // no need to add onVisit or currentUser
```
