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

### 3. `chat-input.tsx`

**File:** `src/features/chat/components/input/chat-input.tsx`
**Date:** 2025-12-29

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| Event listener re-registration | High | `useEffect` with unstable function deps caused listener to re-register every render |
| Type cast in event handler | Low | `onSubmit(e as FormEvent)` - unsafe type cast |
| Magic string inside component | Low | `STT_TOAST_ID` defined inside component (recalculated each render) |

**Pattern Applied:** `useEffectEvent` (React 19.2+ stable hook for non-reactive logic in Effects)

**Research:**
- `useCallback` doesn't solve this - effect still re-runs when deps change
- `useRef` pattern works but is a pre-React 19.2 workaround
- `useEffectEvent` is the official React 19.2+ solution for this exact problem
- See: [React useEffectEvent docs](https://react.dev/reference/react/useEffectEvent)

**Before:**
```tsx
const { startRecording, stopRecording } = useSpeechToText(...);

// ❌ Effect re-registers on every render (functions are new refs each time)
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.altKey && event.key === 'm') {
      event.preventDefault();
      if (transcriberStatus === "recording") {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [transcriberStatus, startRecording, stopRecording]);

// ❌ Type cast
const handleKeyDown = (e: ReactKeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    onSubmit(e as FormEvent);
  }
};
```

**After:**
```tsx
import { useEffectEvent } from "react"; // Requires type augmentation (see Patterns Reference)

const STT_TOAST_ID = "stt-toast"; // ✅ Module-level constant

// ✅ Effect Event - always reads latest values without causing re-registration
const onMicToggle = useEffectEvent(() => {
  if (transcriberStatus === "recording") {
    stopRecording();
  } else {
    startRecording();
  }
});

// ✅ Empty deps - listener registered once
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.altKey && event.key === "m") {
      event.preventDefault();
      onMicToggle();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);

// ✅ No type cast - extracted submitMessage function
const submitMessage = async () => { /* ... */ };
const onSubmit = async (e: FormEvent) => {
  e.preventDefault();
  await submitMessage();
};
const handleKeyDown = (e: ReactKeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submitMessage(); // ✅ No type cast needed
  }
};
```

**Why These Changes:**
- Event listener is registered only ONCE on mount
- `onMicToggle()` always reads latest `transcriberStatus`, `startRecording`, `stopRecording`
- No manual ref management needed
- ESLint understands `useEffectEvent` (eslint-plugin-react-hooks v6.1.1+)
- Extracted `submitMessage()` eliminates the type cast

---

### 4. React Compiler Added

**Date:** 2025-12-29

**Change:** Added `babel-plugin-react-compiler` to automatically memoize all components and providers.

**Impact:**
- All existing providers (`model-provider.tsx`, `web-llm-provider.tsx`, etc.) are now automatically optimized
- No manual `useMemo`/`useCallback` needed
- Context value recreation issue in `model-provider.tsx` is automatically fixed

**Files Modified:**
- `vite.config.ts` - Added compiler to babel plugins
- `package.json` - Added `babel-plugin-react-compiler` dev dependency

**Issues Resolved:**
| Component | Issue | How Compiler Fixes It |
|-----------|-------|----------------------|
| `model-provider.tsx` | Context value recreated every render | Auto-memoizes context value object |
| `model-provider.tsx` | Functions (`sendMessage`, etc.) not memoized | Auto-memoizes function references |
| All providers | Potential re-render cascades | Auto-optimizes all context values |

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

### Use `useEffectEvent` for (React 19.2+):
- Reading latest props/state in Effects without causing re-runs
- Event handlers inside Effects that need current values
- Keyboard shortcuts, connection events, analytics logging
- Replacing the `useRef` workaround pattern for stale closures

**IMPORTANT:** Due to a TypeScript bug in `@types/react@19.2.x`, named import doesn't work out of the box.

**Workaround:** Add a type augmentation file (`src/types/react-extensions.d.ts`):
```tsx
import "react";
declare module "react" {
  function useEffectEvent<T extends Function>(callback: T): T;
}
```

Then use normally:
```tsx
import { useEffectEvent } from "react"; // ✅ Works with augmentation
```

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

- [x] `model-provider.tsx` ✅ (Fixed by React Compiler)
- [x] `web-llm-provider.tsx` ✅ (Fixed by React Compiler)
- [x] `chat-input.tsx` ✅
- [ ] `chat-messages.tsx`
- [ ] `conversation-list.tsx`
