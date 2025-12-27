# Test Mocks Audit & Improvements Report

This document outlines the changes made to standardize test mocks across the codebase, eliminating duplication and improving maintainability.

## 🎯 Goal Accomplished
**DRY (Don't Repeat Yourself)**: Manual mock re-definitions in individual test files have been replaced by centralized factories and helpers.

## ✅ Completed Improvements

### 1. `react-router-dom` Mocks
**Status:** ✅ Fixed
**Files Verified/Updated:**
*   `src/hooks/useKeyboardShortcuts.test.tsx`
*   `src/components/chat/header/hooks/useHeaderActions.test.ts`
*   `src/components/layout/hooks/useLayoutShortcuts.test.ts`
*   **Action:** Confirmed these files rely on the global mock in `src/test/setup.ts` and `mockNavigate` from `src/test/mocks/modules.ts`. No manual `vi.mock("react-router-dom")` remains in these files.

### 2. `useConversations` & `useConversation` Mocks
**Status:** ✅ Fixed
**Files Updated:**
*   `src/components/chat/sidebar/ConversationList.test.tsx`
*   `src/components/chat/header/hooks/useHeaderActions.test.ts`
*   `src/components/layout/hooks/useLayoutShortcuts.test.ts`
*   `src/components/chat/messages/ChatMessages.test.tsx`
*   **Action:** Replaced manual object literals with `createMockConversationsHook` and `createMockConversationHook` factories from `src/test/mocks/hooks.ts`.

### 3. Chat Input Hooks
**Status:** ✅ Fixed
**Files Verified:**
*   `src/components/chat/input/ChatInput.test.tsx`
*   **Action:** Confirmed usage of `createMockDragDropHook`, `createMockFileUploadHook`, and `createMockSpeechToTextHook` factories.

### 4. `useSmartAutoScroll` Mock
**Status:** ✅ Fixed
**Files Updated:**
*   `src/components/chat/messages/ChatMessages.test.tsx`
*   **Action:** Replaced manual mock with `createMockSmartAutoScrollHook`.

### 5. `useWebLLM` & `useModel` Mocks
**Status:** ✅ Fixed
**Files Verified:**
*   `src/components/chat/messages/ChatMessages.test.tsx`
*   `src/components/chat/input/ChatInput.test.tsx`
*   **Action:** Verified usage of `createMinimalWebLLMProvider`, `createMockWebLLMProvider`, and `createMinimalModelProvider` from `src/test/mocks/providers.ts`.

### 6. Global Browser APIs (`matchMedia`, `fetch`)
**Status:** ✅ Fixed
**Files Updated:**
*   `src/test/setup.ts` (Improved global `matchMedia` mock using `createMockMatchMedia`)
*   `src/hooks/api/useModels.test.ts` (Refactored to use `setupFetchMock`)
*   `src/lib/openrouter.test.ts` (Refactored to use `setupFetchMock`)
*   **Action:** 
    *   Centralized `fetch` mocking using `setupFetchMock` from `src/test/mocks/modules.ts`.
    *   Standardized `matchMedia` mock in `setup.ts` to use the robust `createMockMatchMedia` helper from `dom-helpers`.

## 📝 Future Recommendations

1.  **Maintain Discipline:** When adding new tests, always check `src/test/mocks` for existing factories before writing a manual mock.
2.  **Expand Factories:** As new hooks are added, create corresponding factories in `src/test/mocks/hooks.ts` immediately.
3.  **Review New PRs:** Ensure new code uses `setupFetchMock` for API testing and `createMock...` helpers for component/hook testing.
