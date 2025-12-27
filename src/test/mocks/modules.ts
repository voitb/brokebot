import { vi } from "vitest";

// Re-export constants (safe for vi.mock() hoisting - no vitest imports)
export { MOCK_LOCAL_MODEL, MOCK_AVAILABLE_MODELS, MOCK_ONLINE_MODEL } from "./constants";

// Re-export file helpers for DRY test utilities
export { createMockFile, createMockFileList, createMockDataTransfer } from "./file-helpers";

// Re-export media mocks for audio/video testing
export { MockMediaRecorder, MockMediaStream, setupMediaMocks } from "./media";

// Re-export provider mocks for component testing (use after imports, not in vi.mock())
export {
  createMockWebLLMProvider,
  createMinimalWebLLMProvider,
  createMockModelProvider,
  createMinimalModelProvider,
} from "./providers";

// Re-export hook mocks for hook testing
export {
  createMockUserConfigHook,
  createMockConversationsHook,
  createMockConversationHook,
  createMockConversationIdHook,
} from "./hooks";

// Re-export factory functions for data creation
export {
  createMockMessage,
  createMockConversation,
  createMockFolder,
  createMockDocument,
  createMockUserConfig,
  createMockModel,
  createMockLocalModel,
  createMockWebLLMContext,
  createMockModelContext,
} from "./factories";

/**
 * Centralized mock for sonner toast library
 * Used in 17+ test files - import this instead of duplicating the mock
 */
export const mockToast = {
  error: vi.fn(),
  success: vi.fn(),
  loading: vi.fn(),
  message: vi.fn(),
  dismiss: vi.fn(),
  info: vi.fn(),
};

/**
 * Centralized mock for react-router-dom navigation
 * Automatically mocked globally in setup.ts - use this to assert calls
 */
export const mockNavigate = vi.fn();

/**
 * Reset all centralized mocks - called automatically in afterEach via setup.ts
 */
export function resetMocks() {
  mockToast.error.mockClear();
  mockToast.success.mockClear();
  mockToast.loading.mockClear();
  mockToast.message.mockClear();
  mockToast.dismiss.mockClear();
  mockToast.info.mockClear();
  mockNavigate.mockClear();
}
