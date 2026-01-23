# Fix Audit Issues Workflow

Generated: 2026-01-23
Branch: cleanup
Overall Score: 7.8/10 → Target: 9.5/10

---

## Quick Summary

| Priority | Issues | Blocking | Est. Time |
|----------|--------|----------|-----------|
| P0 - Critical | 7 TypeScript errors, 15 test failures | YES | 15 min |
| P1 - High | 3 cross-feature imports, 2 performance issues | NO | 20 min |
| P2 - Medium | 5 large hooks, 4 unnecessary callbacks | NO | 45 min |
| P3 - Low | Index keys, missing barrel files | NO | 15 min |

---

## Phase 1: Build Fixes (BLOCKING)

**Must complete before other phases. Sequential execution.**

### Task 1.1: Fix Missing Import - use-conversation-id

**Agent:** `backend-developer`
**Priority:** P0 - Critical
**Blocking:** Yes

The hook `use-conversation-id.ts` was moved from `src/features/chat/hooks/` to `src/hooks/` but imports weren't updated.

**Files to update:**

```
src/features/chat/components/header/chat-header.tsx:4
src/features/chat/components/interface/chat-guard.tsx:2
src/features/chat/components/interface/chat-interface.tsx:6
src/features/chat/hooks/use-chat-input.ts:4
src/features/chat/hooks/use-chat-messages.ts:3
src/features/chat/hooks/use-conversation-item.ts:4
src/features/chat/hooks/use-conversation-id.test.tsx:4
```

**Fix Option A (Preferred):** Update imports to new location
```typescript
// Change FROM:
import { useConversationId } from "@/features/chat/hooks/use-conversation-id";
// or
import { useConversationId } from "./use-conversation-id";

// Change TO:
import { useConversationId } from "@/hooks/use-conversation-id";
```

**Fix Option B:** Re-export from feature barrel
```typescript
// Add to src/features/chat/hooks/index.ts:
export { useConversationId } from "@/hooks/use-conversation-id";
```

**Validation:**
```bash
npm run build
```

---

## Phase 2: Test Fixes (BLOCKING)

**Can run in parallel. Must complete before merge.**

### Task 2.1: Fix use-layout-shortcuts.test.ts

**Agent:** `unit-testing:test-automator`
**Priority:** P0 - Critical
**Blocking:** Yes
**Failures:** 12 tests

**File:** `src/features/layout/hooks/use-layout-shortcuts.test.ts`

**Issue:** Tests don't wrap component in Router context, but `useLayoutShortcuts` now calls `useConversationId` which requires `<Router>`.

**Fix:** Add MemoryRouter wrapper to all test cases:

```typescript
import { MemoryRouter } from "react-router-dom";

// Create wrapper
const createWrapper = (initialPath = "/") => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        {children}
      </MemoryRouter>
    );
  };
};

// Use in tests
it("should do something", () => {
  const { result } = renderHook(
    () => useLayoutShortcuts(props),
    { wrapper: createWrapper("/chat/test-id") }
  );
  // ...
});
```

### Task 2.2: Fix use-keyboard-shortcuts.test.tsx

**Agent:** `unit-testing:test-automator`
**Priority:** P0 - Critical
**Blocking:** Yes
**Failures:** 3 tests

**File:** `src/features/layout/hooks/use-keyboard-shortcuts.test.tsx`

**Issue:** Same as 2.1 - missing Router context.

**Fix:** Same pattern - add MemoryRouter wrapper.

**Validation:**
```bash
npm test -- --run
```

---

## Phase 3: Architecture Fixes

**Can run in parallel after Phase 1.**

### Task 3.1: Fix Cross-Feature Import (Settings → Chat)

**Agent:** `react-component-architect`
**Priority:** P1 - High
**Blocking:** No

**File:** `src/features/settings/components/general-tab.tsx:15`

**Current (violates Bulletproof React):**
```typescript
import { ApiKeySection } from "@/features/chat/components/online-model-dialog/api-key-section";
```

**Fix Option A (Move to shared):**
1. Create `src/components/api-keys/api-key-section.tsx`
2. Move component and update imports
3. Update `general-tab.tsx`:
```typescript
import { ApiKeySection } from "@/components/api-keys/api-key-section";
```

**Fix Option B (Use public API):**
1. Add to `src/features/chat/index.ts`:
```typescript
export { ApiKeySection } from "./components/online-model-dialog/api-key-section";
```
2. Update `general-tab.tsx`:
```typescript
import { ApiKeySection } from "@/features/chat";
```

### Task 3.2: Fix Cross-Feature Import (Settings → Documents)

**Agent:** `react-component-architect`
**Priority:** P1 - High
**Blocking:** No

**File:** `src/features/settings/components/documents-tab.tsx:1`

**Current:**
```typescript
import { DocumentManager } from "@/features/documents/components/document-manager";
```

**Fix:** Use the public API (already exported):
```typescript
import { DocumentManager } from "@/features/documents";
```

### Task 3.3: Add Missing Barrel File

**Agent:** `backend-developer`
**Priority:** P3 - Low
**Blocking:** No

**Create:** `src/components/ui/index.ts`

```typescript
// Auto-generated barrel file for UI components
export * from "./alert-dialog";
export * from "./avatar";
export * from "./button";
export * from "./card";
// ... export all 37 UI components
```

---

## Phase 4: Performance Fixes

**Can run in parallel after Phase 1.**

### Task 4.1: Fix Markdown Component Recreation

**Agent:** `application-performance:frontend-developer`
**Priority:** P1 - High
**Blocking:** No
**Impact:** Object churn during AI streaming

**File:** `src/features/chat/components/messages/message-content.tsx:28`

**Current (bad):**
```typescript
function AiMessageContent({ content, isGenerating = false }: AiMessageContentProps) {
  const markdownComponents = createMarkdownComponents(); // Called every render!
  // ...
}
```

**Fix:** Move to module level:
```typescript
// At top of file, outside component
const MARKDOWN_COMPONENTS = createMarkdownComponents();

function AiMessageContent({ content, isGenerating = false }: AiMessageContentProps) {
  // Use the constant
  return (
    <ReactMarkdown components={MARKDOWN_COMPONENTS}>
      {content}
    </ReactMarkdown>
  );
}
```

### Task 4.2: Fix Inline Style Object in CodeBlock

**Agent:** `application-performance:frontend-developer`
**Priority:** P2 - Medium
**Blocking:** No
**Impact:** Re-renders during streaming

**File:** `src/features/chat/components/messages/code-block.tsx:63-71`

**Current (bad):**
```typescript
<SyntaxHighlighter
  customStyle={{
    margin: 0,
    padding: '1rem',
    borderRadius: 0,
    border: 'none',
    whiteSpace: 'pre',
    minWidth: '100%',
    width: 'max-content',
  }}
>
```

**Fix:** Extract to module constant:
```typescript
// At top of file
const CODE_BLOCK_STYLE: React.CSSProperties = {
  margin: 0,
  padding: '1rem',
  borderRadius: 0,
  border: 'none',
  whiteSpace: 'pre',
  minWidth: '100%',
  width: 'max-content',
};

// In component
<SyntaxHighlighter customStyle={CODE_BLOCK_STYLE}>
```

### Task 4.3: Add Search Debounce

**Agent:** `application-performance:frontend-developer`
**Priority:** P2 - Medium
**Blocking:** No
**Impact:** O(n*m) search on every keystroke

**File:** `src/features/chat/hooks/use-conversation-list.ts`

**Fix:** Add 300ms debounce to search term:
```typescript
import { useDeferredValue } from "react";

export function useConversationList(...) {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Use deferredSearchTerm for filtering instead of searchTerm
  const filteredConversations = deferredSearchTerm
    ? conversations.filter(...)
    : conversations;
}
```

---

## Phase 5: React Modernization

**Can run in parallel after Phase 1.**

### Task 5.1: Remove Unnecessary useCallback

**Agent:** `react-principles`
**Priority:** P2 - Medium
**Blocking:** No

React Compiler handles memoization automatically. Remove unnecessary wrappers:

**File:** `src/hooks/use-data-management.ts:13`
```typescript
// BEFORE
const clearAllData = useCallback(async () => { ... }, []);

// AFTER
const clearAllData = async () => { ... };
```

**File:** `src/hooks/use-conversation-backup.ts:16,36`
```typescript
// BEFORE
const exportConversations = useCallback(async () => { ... }, []);
const importConversations = useCallback(async (...) => { ... }, []);

// AFTER
const exportConversations = async () => { ... };
const importConversations = async (...) => { ... };
```

### Task 5.2: Use useEffectEvent for Keyboard Shortcuts

**Agent:** `react-principles`
**Priority:** P2 - Medium
**Blocking:** No

**File:** `src/features/chat/hooks/use-input-keyboard-shortcuts.ts`

**Current:**
```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.altKey && event.key === "m") {
      event.preventDefault();
      onMicToggle();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [onMicToggle]); // Re-runs when callback changes
```

**Fix:**
```typescript
import { useEffect, useEffectEvent } from "react";

export function useInputKeyboardShortcuts(onMicToggle: () => void): void {
  const onMicToggleEvent = useEffectEvent(onMicToggle);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "m") {
        event.preventDefault();
        onMicToggleEvent();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // Stable - no callback dependency
}
```

---

## Phase 6: Hook Refactoring (Optional - Large Changes)

**Run after all other phases. Sequential execution.**

### Task 6.1: Refactor use-chat-input-form.ts

**Agent:** `react-component-architect`
**Priority:** P2 - Medium
**Blocking:** No
**LOC:** 212 → Target: <100

**Current issues:**
- Returns 30+ values
- Manages 7+ responsibilities
- Violates SRP

**Fix Option A (Group returns):**
```typescript
return {
  modelInfo: { displayName, isModelLoading, selectedModel, hasActiveModel },
  fileHandlers: { files, addFiles, removeFile, supportsImages },
  dragDrop: { isDraggingOver, dragDropHandlers },
  speech: { isRecording, isTranscribing, onMicToggle },
  form: { message, setMessage, handleSubmit, isProcessing, inputRef },
};
```

**Fix Option B (Compose in component - Preferred):**
Delete `use-chat-input-form.ts` and have `ChatInput` component call hooks directly:
```typescript
function ChatInput() {
  const modelInfo = useModelDisplayInfo();
  const fileHandlers = useFileUpload();
  const dragDrop = useDragDrop(fileHandlers.addFiles);
  const speech = useSpeechToText();
  const form = useChatInputState();
  // ...
}
```

### Task 6.2: Refactor use-conversation-item.ts

**Agent:** `react-component-architect`
**Priority:** P2 - Medium
**Blocking:** No
**LOC:** 151 → Target: <50 each

**Split into:**
1. `use-title-edit.ts` - Already exists, verify it's used
2. `use-conversation-delete.ts` - Already exists, verify it's used
3. `use-conversation-pin.ts` - Extract pin toggle logic
4. `use-conversation-move.ts` - Extract folder move logic

---

## Phase 7: Validation

**Run after all fixes. Sequential execution.**

```bash
# 1. TypeScript compilation
npm run build

# 2. Linting
npm run lint

# 3. Tests
npm test -- --run

# 4. Verify no cross-feature imports remain
grep -r "from ['\"]@/features/" src/features/ --include="*.ts" --include="*.tsx" | grep -v "/index" | grep -v ".test." | grep -v "from ['\"]@/features/\(chat\|settings\|layout\|documents\|onboarding\|welcome\)/\(hooks\|utils\|lib\|components\|constants\)/"
```

---

## Execution Plan

### Parallel Execution Groups

```
┌─────────────────────────────────────────────────────────────┐
│ Phase 1: Build Fixes (SEQUENTIAL - BLOCKING)                │
│ └── Task 1.1: Fix imports (backend-developer)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2-5: PARALLEL EXECUTION                               │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐ │
│ │ Test Fixes      │ │ Architecture    │ │ Performance    │ │
│ │                 │ │                 │ │                │ │
│ │ Task 2.1        │ │ Task 3.1        │ │ Task 4.1       │ │
│ │ Task 2.2        │ │ Task 3.2        │ │ Task 4.2       │ │
│ │                 │ │ Task 3.3        │ │ Task 4.3       │ │
│ │ (test-automator)│ │ (react-arch)    │ │ (frontend-dev) │ │
│ └─────────────────┘ └─────────────────┘ └────────────────┘ │
│                                                             │
│ ┌─────────────────┐                                         │
│ │ React Modern    │                                         │
│ │                 │                                         │
│ │ Task 5.1        │                                         │
│ │ Task 5.2        │                                         │
│ │                 │                                         │
│ │ (react-princ)   │                                         │
│ └─────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 6: Hook Refactoring (OPTIONAL - SEQUENTIAL)           │
│ └── Task 6.1, 6.2 (react-component-architect)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 7: Validation (SEQUENTIAL)                            │
│ └── npm run build && npm run lint && npm test               │
└─────────────────────────────────────────────────────────────┘
```

### Agent Assignments Summary

| Agent | Tasks | Parallel Group |
|-------|-------|----------------|
| `backend-developer` | 1.1, 3.3 | Phase 1, Phase 3 |
| `unit-testing:test-automator` | 2.1, 2.2 | Phase 2 (parallel) |
| `react-component-architect` | 3.1, 3.2, 6.1, 6.2 | Phase 3, Phase 6 |
| `application-performance:frontend-developer` | 4.1, 4.2, 4.3 | Phase 4 (parallel) |
| `react-principles` | 5.1, 5.2 | Phase 5 (parallel) |

### Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1 | 5 min | 5 min |
| Phases 2-5 (parallel) | 20 min | 25 min |
| Phase 6 (optional) | 30 min | 55 min |
| Phase 7 | 5 min | 60 min |

**Total: ~30 min (without Phase 6) or ~60 min (with Phase 6)**

---

## Success Criteria

- [ ] `npm run build` passes (0 errors)
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm test -- --run` passes (0 failures)
- [ ] No cross-feature imports outside public APIs
- [ ] No `createMarkdownComponents()` called in render
- [ ] All inline style objects extracted to constants
- [ ] No unnecessary `useCallback` with `[]` deps

---

## Post-Fix Validation Commands

```bash
# Quick check
/quick-check

# Full validation
/validate-all

# If tests still fail
/fix-tests
```
