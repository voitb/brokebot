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

  // Initial scroll - useLayoutEffect prevents flash of content at wrong position
  useLayoutEffect(() => {
    if (isInitialRender.current) {
      scrollToBottom("auto");
      isInitialRender.current = false;
    }
  }, [conversationId]);

  // Subsequent scrolls - useEffect for non-blocking smooth scroll
  useEffect(() => {
    if (!isInitialRender.current && !userHasScrolledUp.current) {
      scrollToBottom("smooth");
    }
  }, [messageCount, isGenerating]);
}

// Caller:
useSmartAutoScroll({
  messageCount: messages.length,
  isGenerating,
  conversationId,
});
```

**Why These Changes:**
- `useLayoutEffect` for initial scroll prevents content flash (runs before paint)
- `useEffect` for subsequent smooth scrolls (non-blocking)
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

### 5. `web-llm-provider.tsx`

**File:** `src/app/providers/web-llm-provider.tsx`
**Date:** 2025-12-29

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| eslint-disable in useEffect | Medium | Mount-only effect with function dependency |

**Pattern Applied:** `useEffectEvent` (React 19.2+)

**Before:**
```tsx
useEffect(() => {
  loadModel(selectedModel.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**After:**
```tsx
const onInitialize = useEffectEvent(() => {
  loadModel(selectedModel.id);
});

useEffect(() => {
  onInitialize();
}, []);
```

**Why `useEffectEvent` (not `useRef`):**
- `useEffectEvent` is the official React 19.2+ solution for this pattern
- Replaces the `useRef` workaround for stale closures
- `onInitialize()` always reads latest `loadModel` and `selectedModel.id`
- Empty deps array is valid - effect runs once, always reads current values

---

### 6. `use-documents.ts`

**File:** `src/features/documents/hooks/use-documents.ts`
**Date:** 2025-12-29

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| eslint-disable in useEffect | Medium | Mount-only effect with function dependency |

**Pattern Applied:** React Compiler auto-memoization

**Before:**
```tsx
useEffect(() => {
  loadDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**After:**
```tsx
useEffect(() => {
  loadDocuments();
}, [loadDocuments]);
```

**Why this works:**
- `loadDocuments` only uses stable values (useState setters + external `db`)
- React Compiler recognizes this and auto-memoizes the function
- Function reference stays stable across renders
- `refreshDocuments()` can still call `loadDocuments()` (shared function)

---

### 7. `use-speech-to-text.ts`

**File:** `src/features/chat/hooks/use-speech-to-text.ts`
**Date:** 2025-12-29

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| Ref workaround pattern | Medium | Manual ref sync for callback prop |

**Pattern Applied:** `useEffectEvent` (React 19.2+)

**Before:**
```tsx
const onTranscriptReceivedRef = useRef(onTranscriptReceived);

useEffect(() => {
  onTranscriptReceivedRef.current = onTranscriptReceived;
}, [onTranscriptReceived]);

// Later:
onTranscriptReceivedRef.current(newTranscript);
```

**After:**
```tsx
const onTranscript = useEffectEvent((transcript: string) => {
  onTranscriptReceived(transcript);
});

// Later:
onTranscript(newTranscript);
```

**Why `useEffectEvent`:**
- Eliminates manual ref management
- `onTranscript()` always calls the latest `onTranscriptReceived`
- Cleaner, more declarative code
- Official React 19.2+ pattern for this use case

---

### 8. `use-chat-guard.ts`

**File:** `src/features/chat/hooks/use-chat-guard.ts`
**Date:** 2025-12-29

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| Dependency cycle | High | `hasChecked` state in deps while being set inside effect |
| Wasteful re-runs | Medium | Effect re-ran unnecessarily when `hasChecked` changed |
| Magic number | Low | `500` timeout extracted to `DEFAULT_TIMEOUT_MS` constant |

**Pattern Applied:** Ref for internal tracking + State for external API

**Before:**
```tsx
const [hasChecked, setHasChecked] = useState(false);

useEffect(() => {
  // ... sets hasChecked multiple places ...
  setHasChecked(true);
}, [conversationId, conversation, navigate, hasChecked, timeoutMs]);
//                                          ^^^^^^^^^^
//                                          State in deps that effect modifies = cycle

return {
  isChecking: conversationId ? !hasChecked : false,
  // ...
};
```

**After:**
```tsx
const [isChecking, setIsChecking] = useState(!!conversationId);
const hasHandledRef = useRef(false);

useEffect(() => {
  hasHandledRef.current = false;
  setIsChecking(!!conversationId);

  if (!conversationId) return;

  const timer = setTimeout(() => {
    if (!hasHandledRef.current && conversation === undefined) {
      hasHandledRef.current = true;
      toast.error("Conversation not found", { ... });
      navigate("/chat", { replace: true });
      setIsChecking(false);
    }
  }, timeoutMs);

  if (conversation !== undefined && !hasHandledRef.current) {
    hasHandledRef.current = true;
    setIsChecking(false);
    clearTimeout(timer);
  }

  return () => clearTimeout(timer);
}, [conversationId, conversation, navigate, timeoutMs]);
// ✅ No isChecking/hasChecked in deps - no cycle!

return { isChecking, ... };
```

**Why This Pattern:**
- **Ref for internal tracking** - `hasHandledRef` doesn't trigger re-renders, avoiding dependency cycle
- **State for external API** - `isChecking` provides the reactive value components need
- **Separation of concerns** - Internal tracking logic is decoupled from render triggers
- **No race conditions** - Ref prevents duplicate handling across effect runs

---

### 9. `use-header-actions.ts`

**File:** `src/features/chat/hooks/use-header-actions.ts`
**Date:** 2025-12-29

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| Event listener re-registration | High | `currentConversation` derived from `.find()` caused listener to re-register on every conversation update |
| Unnecessary re-registration | Medium | Delete listener re-registered on route change (`conversationId` in deps) |

**Pattern Applied:** `useEffectEvent` (React 19.2+)

**Before:**
```tsx
// Derived state - NEW object reference every time conversations changes
const currentConversation = conversations?.find(c => c.id === conversationId);

// Event listener re-registers on every conversation update
useEffect(() => {
  const handleRename = () => {
    if (conversationId && currentConversation) {
      setIsEditingTitle(true);
    }
  };
  document.addEventListener("conversation:rename", handleRename);
  return () => document.removeEventListener("conversation:rename", handleRename);
}, [conversationId, currentConversation]);  // ❌ Re-registers frequently
```

**After:**
```tsx
// Effect event - always reads latest values without causing re-registration
const onRenameEvent = useEffectEvent(() => {
  if (conversationId && currentConversation) {
    setIsEditingTitle(true);
  }
});

// Listener registered ONCE
useEffect(() => {
  const handleRename = () => {
    onRenameEvent();
  };
  document.addEventListener("conversation:rename", handleRename);
  return () => document.removeEventListener("conversation:rename", handleRename);
}, []);  // ✅ Empty deps - registered once
```

**Why `useEffectEvent`:**
- Listeners registered ONCE on mount, removed on unmount
- `useEffectEvent` always reads latest `conversationId`, `currentConversation`
- No stale closures - captures current state at call time, not registration time
- Consistent with existing patterns in `chat-input.tsx`, `web-llm-provider.tsx`

---

## Reviewed (No Issues)

| Component | Status | Notes |
|-----------|--------|-------|
| `conversations-provider.tsx` | Clean | Uses `useLiveQuery` (Dexie) - proper subscription pattern |
| `use-message-stream.ts` | Clean | Proper ref usage for AbortController |
| `use-drag-drop.ts` | Clean | No effects, just event handlers |

---

## Patterns Reference

### Use `useSyncExternalStore` for:
- Browser APIs (`matchMedia`, `navigator.onLine`, etc.)
- Third-party stores
- Any external mutable data source

### Use `useLayoutEffect` for:
- Focus management (prevents flicker)
- Initial scroll positioning (prevents content flash)
- Any DOM mutation that affects visual appearance before paint

### Use `requestAnimationFrame` for:
- Continuous animations (not one-time operations)
- Non-blocking scroll event handlers
- Operations where slight delay is acceptable

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
- [x] `web-llm-provider.tsx` ✅ (Fixed with `useEffectEvent`)
- [x] `chat-input.tsx` ✅ (Fixed with `useEffectEvent`)
- [x] `use-documents.ts` ✅ (Fixed with React Compiler)
- [x] `chat-messages.tsx` ✅ (Hook extraction: `useChatMessages`)
- [x] `conversation-list.tsx` ✅ (Reviewed - Clean)
- [x] `use-speech-to-text.ts` ✅ (Fixed with `useEffectEvent`)
- [x] `use-message-stream.ts` ✅ (Reviewed - Clean)
- [x] `use-drag-drop.ts` ✅ (Reviewed - Clean)
- [x] `use-chat-guard.ts` ✅ (Fixed with ref + state pattern)
- [x] `use-header-actions.ts` ✅ (Fixed with `useEffectEvent`)
- [x] `use-copy-to-clipboard.ts` ✅ (Extracted magic number to constant)
- [x] `use-textarea-auto-resize.ts` ✅ (Removed ineffective ref from deps)
- [x] `editable-conversation-title.tsx` ✅ (Replaced setTimeout(100) with `useLayoutEffect`)
- [x] Remaining hooks in `src/features/chat/hooks/` ✅ (All clean - no issues)
- [x] `conversation-item.tsx` ✅ (Fixed with `useEffectEvent`)
- [x] Complex components ✅ (All clean - 52 components reviewed)
- [x] `chat-input.tsx` ✅ (Major refactor: extracted logic to `useChatInputForm` hook)
- [x] `model-status.tsx` ✅ (Extracted ternaries to lookup maps)
- [x] `speech-to-text-button.tsx` ✅ (Extracted switch statements to lookup maps)

---

### 10. `chat-input.tsx` - Major Refactoring

**File:** `src/features/chat/components/input/chat-input.tsx`
**New Hook:** `src/features/chat/hooks/use-chat-input-form.ts`
**Date:** 2025-12-30

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| Duplicate handlers | Medium | `handleMicClick` and `onMicToggle` did identical things |
| Mixed concerns | High | STT toast orchestration was a side effect mixed in component |
| Business logic in component | High | File content formatting was business logic in presentation |
| No core hook | High | Unlike `useConversationItem` pattern, no hook extracted form logic |
| Large component | Medium | 316 lines with too many responsibilities |

**Pattern Applied:** Presentation/Logic Separation (following `useConversationItem` pattern)

**Research Sources:**
- [React Official Docs - Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React 19.2 Release - useEffectEvent](https://react.dev/blog/2025/10/01/react-19-2)
- [Best Practices for Keeping Your React UI and Logic Separate](https://www.dhiwise.com/post/mastering-the-art-of-separating-ui-and-logic-in-react)

**Before:**
```tsx
// 316 lines - mixed logic and presentation
export function ChatInput({ ... }) {
  const { currentModel, isModelLoading, modelStatus } = useModel();
  const dragDrop = useDragDrop();
  const stt = useSpeechToText(callback);
  const files = useFileUpload({ ... });

  // ❌ Duplicate handlers
  const handleMicClick = () => { /* ... */ };
  const onMicToggle = useEffectEvent(() => { /* same thing */ });

  // ❌ Business logic in component
  if (filesToSend.length > 0) {
    const fileContents = filesToSend.map(f => { /* formatting */ });
    fullMessage = `${messageToSend}\n\n${fileContents}`.trim();
  }

  // ❌ STT toast orchestration in component
  useEffect(() => {
    switch (transcriberStatus) { /* toast logic */ }
  }, [transcriberStatus]);

  // ...316 lines of mixed concerns
}
```

**After:**
```tsx
// use-chat-input-form.ts - ~230 lines of pure logic
export function useChatInputForm({ message, setMessage, onSend, isLoading }) {
  // All hooks, derived state, effects, and handlers
  return {
    isModelReady, isModelError, isSubmitDisabled, placeholderText,
    attachedFiles, handleFilesSelected, removeFile,
    isDragOver, handleDrop, handleDragOver, handleDragLeave, handleDragEnter,
    transcriberStatus, handleMicToggle,
    handleSubmit, handleKeyDown, handleRetryModel,
    textareaRef, modelDisplayInfo
  };
}

// chat-input.tsx - ~180 lines of pure presentation
export function ChatInput({ message, setMessage, isLoading, isGenerating, onSend, onStopGeneration }) {
  const form = useChatInputForm({ message, setMessage, onSend, isLoading });

  return (
    <TooltipProvider>
      {/* Pure JSX - no business logic */}
    </TooltipProvider>
  );
}
```

**Files Created/Modified:**
| File | Action | Lines |
|------|--------|-------|
| `use-chat-input-form.ts` | Created | ~230 lines |
| `use-chat-input-form.test.ts` | Created | ~470 lines (24 tests) |
| `chat-input.tsx` | Refactored | 316 → 180 lines |
| `chat-input-utils.ts` | Modified | Added `formatAttachedFiles`, `buildMessageWithFiles` |

**Benefits:**
| Metric | Before | After |
|--------|--------|-------|
| Component lines | 316 | 180 (-43%) |
| Hook lines | 0 | 230 |
| Test coverage | Component-only | Hook unit tests + component integration |
| Duplicate code | 2 identical handlers | 1 handler |
| Pattern consistency | Inconsistent | Matches `useConversationItem` |
| Separation of concerns | Mixed | Clean separation |

**Test Results:** 24 tests for hook, 9 tests for component - all passing

---

### 11. `model-status.tsx` - Ternary to Lookup Maps

**File:** `src/features/chat/components/input/model-status.tsx`
**New Utils:** `src/features/chat/utils/model-status-utils.ts`
**Date:** 2025-12-30

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| Nested ternary operators | Medium | 4-level nested ternaries for `statusColor` and `displayedStatus` |
| Logic in presentation | Medium | State derivation mixed with JSX |

**Research Sources:**
- [React Official Docs - Conditional Rendering](https://react.dev/learn/conditional-rendering): "If your components get messy with too much nested conditional markup, consider extracting child components to clean things up"
- [Why Nested Ternary Operators Are Bad Practice](https://dev.to/junihoj/why-nested-ternary-operators-are-bad-practice-a-guide-for-developers-ki1)

**Before:**
```tsx
const statusColor = isModelError
  ? "text-destructive"
  : isEngineLoading
  ? "text-amber-600 dark:text-amber-400"
  : isModelReady
  ? "text-green-600 dark:text-green-400"
  : "text-muted-foreground";

const displayedStatus = isModelError
  ? "Error"
  : isEngineLoading
  ? "Loading Model..."
  : isModelReady
  ? "Ready"
  : "Initializing...";
```

**After:**
```tsx
// model-status-utils.ts
const STATUS_COLORS: Record<ModelStatusKey, string> = {
  error: "text-destructive",
  loading: "text-amber-600 dark:text-amber-400",
  ready: "text-green-600 dark:text-green-400",
  initializing: "text-muted-foreground",
};

export function getModelStatusKey(flags: ModelStatusFlags): ModelStatusKey { ... }
export function getStatusColor(key: ModelStatusKey): string { ... }
export function getDisplayedStatus(key: ModelStatusKey): string { ... }

// model-status.tsx
const statusKey = getModelStatusKey({ isModelError, isEngineLoading, isModelReady });
const statusColor = getStatusColor(statusKey);
const displayedStatus = getDisplayedStatus(statusKey);
```

**Files Created/Modified:**
| File | Action | Lines |
|------|--------|-------|
| `model-status-utils.ts` | Created | ~40 lines |
| `model-status-utils.test.ts` | Created | ~80 lines (14 tests) |
| `model-status.tsx` | Refactored | 71 → 60 lines |

---

### 12. `speech-to-text-button.tsx` - Switch to Lookup Maps

**File:** `src/features/chat/components/input/speech-to-text-button.tsx`
**New Utils:** `src/features/chat/utils/speech-button-utils.ts`
**Date:** 2025-12-30

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| Switch statements in component | Low | `getTooltipText()` and `getIcon()` recreated each render |
| Imperative over declarative | Low | Switch statements vs. object maps |

**Before:**
```tsx
const getTooltipText = () => {
  switch (status) {
    case "recording": return "Stop recording";
    case "processing": return "Processing audio...";
    case "loading": return "Loading model...";
    default: return "Start voice input";
  }
};

const getIcon = () => {
  switch (status) {
    case "recording": return <MicOff className="h-4 w-4 text-destructive" />;
    case "processing":
    case "loading": return <Loader2 className="h-4 w-4 animate-spin" />;
    default: return <Mic className="h-4 w-4" />;
  }
};
```

**After:**
```tsx
// speech-button-utils.ts
export const STATUS_TOOLTIP: Record<TranscriberStatus, string> = {
  recording: "Stop recording",
  processing: "Processing audio...",
  loading: "Loading model...",
  ready: "Start voice input",
  uninitialized: "Start voice input",
  error: "Start voice input",
};

export const STATUS_ICON: Record<TranscriberStatus, IconConfig> = { ... }

// speech-to-text-button.tsx
const iconConfig = getIconConfig(status);
const IconComponent = ICON_COMPONENTS[iconConfig.type];
```

**Files Created/Modified:**
| File | Action | Lines |
|------|--------|-------|
| `speech-button-utils.ts` | Created | ~45 lines |
| `speech-button-utils.test.ts` | Created | ~130 lines (23 tests) |
| `speech-to-text-button.tsx` | Refactored | 66 → 57 lines |

---

### 13. `chat-messages.tsx` - Hook Extraction

**File:** `src/features/chat/components/messages/chat-messages.tsx`
**New Hook:** `src/features/chat/hooks/use-chat-messages.ts`
**Date:** 2025-12-30

**Issues Fixed:**
| Issue | Severity | Description |
|-------|----------|-------------|
| Complex inline conditional props | Medium | `onRegenerate` and `onStopGeneration` computation inline in JSX |
| No presentation/logic separation | Medium | Unlike `chat-input.tsx`, no hook extracted |
| Repeated logic | Low | Same `isLastAssistantMessage` check repeated |

**Research Sources:**
- [React Docs - Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks): "Extract the shared logic into a custom Hook... leading to cleaner, more maintainable code"

**Before:**
```tsx
{messages.map((message, index) => (
  <MessageBubble
    key={message.id}
    message={message}
    isGenerating={isGenerating}
    isLastMessage={index === messages.length - 1}
    onRegenerate={
      message.role === "assistant" &&
      index === messages.length - 1 &&
      isModelReady
        ? onRegenerate
        : undefined
    }
    onStopGeneration={
      message.role === "assistant" &&
      index === messages.length - 1 &&
      isGenerating
        ? onStopGeneration
        : undefined
    }
  />
))}
```

**After:**
```tsx
// use-chat-messages.ts
const getMessageBubbleProps = (message: Message, index: number): MessageBubbleProps => {
  const isLastMessage = index === messages.length - 1;
  const isLastAssistantMessage = message.role === "assistant" && isLastMessage;
  return {
    message,
    isGenerating,
    isLastMessage,
    onRegenerate: isLastAssistantMessage && isModelReady ? onRegenerate : undefined,
    onStopGeneration: isLastAssistantMessage && isGenerating ? onStopGeneration : undefined,
  };
};

// chat-messages.tsx
{messages.map((message, index) => (
  <MessageBubble key={message.id} {...getMessageBubbleProps(message, index)} />
))}
```

**Files Created/Modified:**
| File | Action | Lines |
|------|--------|-------|
| `use-chat-messages.ts` | Created | ~70 lines |
| `use-chat-messages.test.ts` | Created | ~210 lines (14 tests) |
| `chat-messages.tsx` | Refactored | 76 → 49 lines (-36%) |

**Benefits:**
| Metric | Before | After |
|--------|--------|-------|
| Component lines | 76 | 49 (-36%) |
| Inline conditionals | 2 complex | 0 |
| Testability | Component-only | Hook unit tests |
| Pattern consistency | Inconsistent | Matches `useChatInputForm` |
