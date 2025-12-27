import { vi } from "vitest";
import {
  createMockLocalModel,
  createMockWebLLMContext,
  createMockModelContext,
  type MockWebLLMContextOverrides,
  type MockModelContextOverrides,
} from "./factories";

/**
 * Default mock model for AVAILABLE_MODELS export
 * Used by WebLLMProvider mock
 */
export const MOCK_AVAILABLE_MODELS = [createMockLocalModel()];

/**
 * Creates a complete WebLLMProvider mock suitable for vi.mock()
 *
 * @example
 * vi.mock("../providers/WebLLMProvider", () => createMockWebLLMProvider());
 *
 * @example with overrides
 * vi.mock("../providers/WebLLMProvider", () =>
 *   createMockWebLLMProvider({ isLoading: true, status: "Loading..." })
 * );
 */
export function createMockWebLLMProvider(overrides: MockWebLLMContextOverrides = {}) {
  return {
    useWebLLM: vi.fn(() => createMockWebLLMContext(overrides)),
    AVAILABLE_MODELS: MOCK_AVAILABLE_MODELS,
  };
}

/**
 * Creates a minimal WebLLMProvider mock with only isLoading and status
 * For tests that only check loading state
 *
 * @example
 * vi.mock("../providers/WebLLMProvider", () => createMinimalWebLLMProvider());
 */
export function createMinimalWebLLMProvider(
  overrides: Pick<MockWebLLMContextOverrides, "isLoading" | "status"> = {}
) {
  return {
    useWebLLM: vi.fn(() => ({
      isLoading: overrides.isLoading ?? false,
      status: overrides.status ?? "Ready",
    })),
    AVAILABLE_MODELS: MOCK_AVAILABLE_MODELS,
  };
}

/**
 * Creates a complete ModelProvider mock suitable for vi.mock()
 *
 * @example
 * vi.mock("../providers/ModelProvider", () => createMockModelProvider());
 *
 * @example with overrides
 * vi.mock("../providers/ModelProvider", () =>
 *   createMockModelProvider({ isModelLoading: true, modelStatus: "Loading..." })
 * );
 */
export function createMockModelProvider(overrides: MockModelContextOverrides = {}) {
  return {
    useModel: vi.fn(() => createMockModelContext(overrides)),
  };
}

/**
 * Creates a minimal ModelProvider mock with commonly used fields
 * For tests that only check model name and loading state
 *
 * @example
 * vi.mock("../providers/ModelProvider", () => createMinimalModelProvider());
 */
export function createMinimalModelProvider(
  overrides: Pick<MockModelContextOverrides, "currentModel" | "isModelLoading" | "modelStatus"> = {}
) {
  return {
    useModel: vi.fn(() => ({
      currentModel: overrides.currentModel ?? { name: "Test Model", type: "online" as const },
      isModelLoading: overrides.isModelLoading ?? false,
      modelStatus: overrides.modelStatus ?? "Ready",
    })),
  };
}
