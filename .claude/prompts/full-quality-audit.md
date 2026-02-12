# Full Quality Audit - Brokebot

## Context

Brokebot is a privacy-first ChatGPT alternative built with:
- **React 19.2.3** with React Compiler (auto memoization)
- **TypeScript 5.8.3** (strict mode)
- **Vite 6.3.5** with React Compiler plugin
- **Dexie 4.0.11** (IndexedDB) with `useLiveQuery`
- **Tailwind CSS 4** + Shadcn/ui (Radix primitives)
- **react-router-dom 7.6** (client-side SPA)
- **WebLLM** for local browser-based LLM inference
- **OpenRouter API** for online models

Architecture: Feature-based (`src/features/{chat,settings,documents,onboarding}`), Context API for state, no Redux/Zustand, Dexie for persistence, encryption for API keys.

Scale: ~259 files, 64 custom hooks, 48 test files, 45+ components.

## Audit Instructions

Run a comprehensive quality audit of this project. Work through ALL sections below systematically. For each issue found, provide:
- **File path and line number**
- **Issue description** (what's wrong)
- **Why it matters** (impact)
- **Fix recommendation** (specific, actionable)
- **Severity**: 🔴 Critical | 🟡 Important | 🟢 Minor

### 1. React 19 Patterns Audit

Check ALL hooks and components against modern React 19 best practices:

**useEffect audit** (check every file with useEffect):
- Any useEffect that could be replaced with event handler?
- Any useEffect used for derived state (should be computed during render)?
- Any useEffect for data fetching without proper race condition handling?
- Any useEffect with missing/wrong dependency array?
- Any useEffect that should be useLayoutEffect (DOM measurements, visual updates)?
- Any useEffect for syncing external stores (should use useSyncExternalStore)?
- Any useEffect for subscriptions without proper cleanup?
- Specifically audit: `use-models.ts`, `use-user-config.ts`, `model-provider.tsx`, `web-llm-provider.tsx`, `use-smart-auto-scroll.ts`, `use-speech-to-text.ts`

**State management audit**:
- Any useState that could be derived/computed instead?
- Any setState called during render (anti-pattern)?
- Proper use of useOptimistic, useTransition, useDeferredValue?
- Any state that should be a ref instead?
- Any unnecessary state that causes extra re-renders?

**React Compiler compatibility**:
- Any patterns that break React Compiler assumptions?
- Any mutation of props, state, or values returned from hooks?
- Verify zero `useCallback`/`useMemo` usage is appropriate (React Compiler handles it)
- Any side effects during render (not in useEffect)?

**Modern API usage**:
- `useEffectEvent` used correctly? (stable callbacks for effects)
- `useSyncExternalStore` where appropriate? (external subscriptions)
- `useOptimistic` for optimistic updates?
- `startTransition` for non-urgent updates?
- `useDeferredValue` for expensive computations?
- Any `forwardRef` that should use ref as prop (React 19)?

### 2. Over-Engineering Audit

Look for unnecessary complexity:

**Unnecessary abstractions**:
- Hooks that are used only once (should be inlined?)
- Wrapper components that add no value
- Barrel files (index.ts) that re-export a single item unnecessarily
- Helper functions that are called once
- Over-abstracted utility functions

**Unnecessary patterns**:
- Over-defensive error handling in trusted code paths
- Extra validation where TypeScript already guarantees types
- Unnecessary try/catch blocks
- Over-complicated state machines for simple state
- Context providers that could be simplified

**Code that does too much**:
- Hooks with too many responsibilities (should be split?)
- Components with mixed concerns
- Files over 200 lines that should be split
- Overly generic interfaces/types

### 3. TypeScript Quality

**Type safety**:
- Any `as any`, `as unknown`, `@ts-ignore`, `@ts-expect-error`?
- Any overly broad types (Record<string, any>, Function, object)?
- Any missing return types on exported functions?
- Proper discriminated unions where applicable?
- Zod schemas matching TypeScript interfaces?

**Type design**:
- Types that are too broad or too narrow?
- Redundant type definitions?
- Proper use of generics (not over/under-used)?

### 4. Performance Audit

**Rendering performance**:
- Components that re-render unnecessarily?
- Large context values causing tree re-renders?
- Missing keys or unstable keys in lists?
- Expensive computations during render that should be deferred?

**Bundle & loading**:
- Lazy loading used appropriately?
- Large imports that could be code-split?
- Dynamic imports where beneficial?

**Data patterns**:
- Dexie queries efficient? Proper indexing?
- Any N+1 query patterns?
- Unnecessary data transformations on every render?

### 5. Testing Quality

**Coverage gaps**:
- Critical paths without tests?
- Edge cases not covered?
- Error states not tested?

**Test quality**:
- Any `as any` in test code?
- Tests testing implementation vs behavior?
- Proper mock cleanup between tests?
- Test data factories used consistently?

### 6. Security Review

Since this handles API keys and user data:
- API key encryption implementation correct?
- Any XSS vectors in markdown rendering?
- Any sensitive data in localStorage (should be encrypted in IndexedDB)?
- Input sanitization for file uploads?
- Content Security Policy considerations?

### 7. Code Quality & Consistency

**Naming**:
- Consistent with kebab-case files, PascalCase components, camelCase functions?
- Boolean vars with is/has/should prefix?
- Async functions with get/load/fetch prefix?

**File organization**:
- Co-located tests with source?
- Consistent directory structure across features?
- Any orphaned/dead code?

**Comments & documentation**:
- AI-slop comments (obvious comments, over-documentation)?
- Missing comments where logic IS complex?

## Output Format

Organize findings by section. For each section provide:
1. **Score** (1-10)
2. **Summary** (2-3 sentences)
3. **Issues found** (table with file, issue, severity, fix)
4. **Quick wins** (easy fixes that improve quality immediately)

End with:
- **Overall score** (1-10)
- **Top 5 priority fixes** (highest impact improvements)
- **Architecture recommendations** (if any structural changes needed)
