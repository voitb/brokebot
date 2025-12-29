# Component Modernization Log

This document tracks React component modernization efforts to align with state-of-the-art patterns (React 18+/2025 best practices).

---

## Completed Fixes

### 1. `theme-provider.tsx`

**File:** `src/app/providers/theme-provider.tsx`
**Date:** 2025-12-29

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| Missing OS theme listener | Bug | App didn't respond to OS dark/light mode changes |
| Outdated subscription pattern | Modernization | Used `useEffect` instead of `useSyncExternalStore` |

**Pattern Applied:** `useSyncExternalStore` (React 18+ recommended for external browser API subscriptions)

**Before:**
```tsx
useEffect(() => {
  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
    root.classList.add(systemTheme);
  }
}, [theme]);
```

**After:**
```tsx
const systemTheme = useSyncExternalStore(
  subscribeToSystemTheme,
  getSystemThemeSnapshot,
  getServerSnapshot
);

useEffect(() => {
  root.classList.add(theme === "system" ? systemTheme : theme);
}, [theme, systemTheme]);
```

**Benefits:**
- Live OS theme change detection
- SSR-safe with server snapshot
- Follows React 18+ recommended pattern

---

### 2. `use-smart-auto-scroll.ts`

**File:** `src/features/chat/hooks/use-smart-auto-scroll.ts`
**Date:** 2025-12-29

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| Magic timeout | Medium | `setTimeout(..., 100)` - arbitrary delay |
| DependencyList anti-pattern | High | Passing dependency array as parameter (React #19887) |
| eslint-disable | Code smell | Hiding lint warning |

**Research:** Passing `DependencyList` as parameter is an anti-pattern:
- React team closed GitHub issue #19887 as "not planned"
- ESLint can't statically analyze dynamic dependencies
- Creates leaky abstraction

**Solution:** Accept typed options with **primitives** instead of generic dependency array.

**Before:**
```tsx
export function useSmartAutoScroll<T extends HTMLElement = HTMLDivElement>(
  dependencies: DependencyList = []
): UseSmartAutoScrollReturn<T> {
  // ...
  useEffect(() => {
    if (isInitialRender.current) {
      setTimeout(() => scrollToBottom("auto"), 100);
      // ...
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);
}

// Caller:
useSmartAutoScroll([messages, isGenerating, conversationId]);
```

**After:**
```tsx
interface UseSmartAutoScrollOptions {
  messageCount: number;           // Primitive - stable comparison
  isGenerating: boolean;          // Primitive - stable comparison
  conversationId: string | null;  // Primitive - stable comparison
}

export function useSmartAutoScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseSmartAutoScrollOptions
): UseSmartAutoScrollReturn<T> {
  const { messageCount, isGenerating, conversationId } = options;
  // ...
  useEffect(() => {
    if (isInitialRender.current) {
      requestAnimationFrame(() => scrollToBottom("auto"));
      // ...
    }
  }, [messageCount, isGenerating, conversationId]);
}

// Caller:
useSmartAutoScroll({
  messageCount: messages.length,
  isGenerating,
  conversationId,
});
```

**Why These Changes:**
- `requestAnimationFrame` waits for browser paint cycle (proper timing)
- Typed options are type-safe and ESLint-friendly
- `messageCount` (primitive) instead of `messages` (array) - stable comparison
- No eslint-disable needed

---

## Reviewed (No Issues)

| Component | Status | Notes |
|-----------|--------|-------|
| `conversations-provider.tsx` | Clean | Uses `useLiveQuery` (Dexie) - proper subscription pattern |

---

## Patterns Reference

### Use `useSyncExternalStore` for:
- Browser APIs (`matchMedia`, `navigator.onLine`, etc.)
- Third-party stores
- Any external mutable data source

### Use `requestAnimationFrame` for:
- Initial scroll positioning
- Layout-dependent operations
- Replacing arbitrary `setTimeout` timing hacks

### For custom hooks that need "triggers":
- Accept **specific typed options** instead of `DependencyList` parameter
- Use **primitives** (number, boolean, string) over objects/arrays
- Example: `messageCount: number` instead of `messages: Message[]`

### Avoid:
- `eslint-disable` for exhaustive-deps (fix the issue instead)
- Passing `DependencyList` as hook parameter (React #19887 - not supported)
- Spreading dependency arrays (`[...deps]`)
- `setTimeout` with magic numbers for layout timing

---

## Remaining Components Queue

- [ ] `model-provider.tsx`
- [ ] `web-llm-provider.tsx`
- [ ] `chat-input.tsx`
- [ ] `chat-messages.tsx`
- [ ] `conversation-list.tsx`
