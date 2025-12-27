import { vi } from "vitest";

// Re-export file helpers for DRY test utilities
export { createMockFile, createMockFileList, createMockDataTransfer } from "./file-helpers";

// Re-export media mocks for audio/video testing
export { MockMediaRecorder, MockMediaStream, setupMediaMocks } from "./media";

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
