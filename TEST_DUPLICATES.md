# Test Mocks Audit & Improvements

This document identifies duplicated mock logic across the codebase and outlines a plan to standardize usage using the existing `src/test/mocks` infrastructure.

## 🎯 Goal
**DRY (Don't Repeat Yourself)**: Eliminate manual mock re-definitions in individual test files by leveraging centralized factories and helpers. This improves maintainability, readability, and consistency.

## 🔍 Findings & Recommendations

### 1. Redundant Library Mocks (`react-router-dom`)
**Status:** ⚠️ High Duplication
**Centralized Mock:** `src/test/setup.ts` (Globally configured)

*   **Problem:** Several test files manually mock `react-router-dom` even though it is already mocked globally in `setup.ts`.
*   **Affected Files:**
    *   `src/hooks/useKeyboardShortcuts.test.tsx`
    *   `src/components/chat/header/hooks/useHeaderActions.test.ts`
    *   `src/components/layout/hooks/useLayoutShortcuts.test.ts`

**Recommendation:** Remove the local `vi.mock("react-router-dom", ...)` blocks from these files. The global mock in `setup.ts` exports `mockNavigate` which should be sufficient.

### 2. `useConversation` & `useConversations`
**Status:** ⚠️ High Duplication
**Centralized Mock:** `src/test/mocks/hooks.ts` -> `createMockConversationHook`, `createMockConversationsHook`

*   **Problem:** Files like `ChatMessages.test.tsx` and `ChatSidebar.test.tsx` manually reconstruct the return shape of these hooks using `vi.fn()` repeatedly.
*   **Impact:** If the hook interface changes, every single test file breaks and needs manual updating.
*   **Affected Files:**
    *   `src/components/chat/messages/ChatMessages.test.tsx`
    *   `src/components/chat/sidebar/ConversationList.test.tsx`
    *   `src/components/chat/sidebar/components/ConversationItem.test.tsx`
    *   `src/hooks/chat/useChatGuard.test.tsx`
    *   `src/components/chat/header/hooks/useHeaderActions.test.ts` (Manually mocks `useConversations`)
    *   `src/components/layout/hooks/useLayoutShortcuts.test.ts` (Manually mocks `useConversations`)

**Recommendation:** Replace manual object literals with factory calls.

### 3. Chat Input Hooks (`useDragDrop`, `useFileUpload`, `useSpeechToText`)
**Status:** 🆕 New Helpers Needed
**Affected File:** `src/components/chat/input/ChatInput.test.tsx`

*   **Problem:** `ChatInput.test.tsx` defines a large manual mock for its local `./hooks` import.
    ```typescript
    vi.mock("./hooks", () => ({
      useDragDrop: vi.fn(() => ({ ... })),
      useFileUpload: vi.fn(() => ({ ... })),
      useSpeechToText: vi.fn(() => ({ ... })),
      // ...
    }));
    ```
*   **Recommendation:**
    1.  Create `createMockDragDropHook`, `createMockFileUploadHook`, and `createMockSpeechToTextHook` in `src/test/mocks/hooks.ts`.
    2.  Update `ChatInput.test.tsx` to use these factories.

### 4. `useSmartAutoScroll`
**Status:** ⚠️ High Duplication
**Centralized Mock:** `src/test/mocks/hooks.ts` -> `createMockSmartAutoScrollHook`

*   **Problem:** `ChatMessages.test.tsx` and others manually mock the return value.
*   **Affected Files:**
    *   `src/components/chat/messages/ChatMessages.test.tsx`
    *   `src/hooks/useSmartAutoScroll.test.ts`

**Recommendation:** Use `createMockSmartAutoScrollHook`.

### 5. `useWebLLM` & `useModel`
**Status:** ⚠️ Moderate Duplication
**Centralized Mock:** `src/test/mocks/providers.ts` -> `createMockWebLLMContext`, `createMockModelContext`

*   **Problem:** `ChatInterface.test.tsx`, `MessageBubble.test.tsx`, and `ChatMessages.test.tsx` often recreate the context object.
*   **Affected Files:**
    *   `src/components/chat/messages/ChatMessages.test.tsx`
    *   `src/components/chat/messages/components/MessageBubble.test.tsx`
    *   `src/components/chat/interface/ChatInterface.test.tsx`

**Recommendation:** Import specific factory functions from `@/test/mocks` to generate these context objects.

### 6. Global Browser APIs & Fetch
**Status:** ⚠️ Unnecessary Redundancy / Duplication

*   **`matchMedia`**: `src/hooks/useIsMobile.test.ts` manually mocks `window.matchMedia` (Redundant, handled in `setup.ts`).
*   **`fetch`**: `src/lib/openrouter.test.ts` and `src/hooks/api/useModels.test.ts` both manually implement `vi.stubGlobal("fetch", mockFetch)` and teardown.
    *   **Recommendation:** Create a `setupFetchMock()` helper in `src/test/mocks/modules.ts` or `src/test/utils.tsx` that handles the stubbing and cleanup to reduce boilerplate.

## 📝 Action Plan

1.  **Refactor `ChatMessages.test.tsx`**: Replace `useConversation`, `useSmartAutoScroll`, and `useWebLLM` manual mocks with factories.
2.  **Clean up `useIsMobile.test.ts`**: Remove redundant `matchMedia` mock.
3.  **Clean up Redundant Library Mocks**: Remove `react-router-dom` mocks from `useKeyboardShortcuts.test.tsx`, `useHeaderActions.test.ts`, etc.
4.  **Expand `src/test/mocks/hooks.ts`**: Add factories for `useDragDrop`, `useFileUpload`, `useSpeechToText`.
5.  **Refactor `ChatInput.test.tsx`**: Update to use the new hook factories.
6.  **Refactor `ChatSidebar` tests**: Standardize `useConversationList` and `useConversations` usage.

## Benefits
*   **Robustness:** Changing a hook's interface only requires updating the mock factory, not 50+ test files.
*   **Readability:** Tests focus on *behavior*, not *boilerplate setup*.
*   **Speed:** Less code to write for new tests.