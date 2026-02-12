import { vi } from "vitest";
import {
  createMockLocalModel,
  createMockModel,
  createMockWebLLMContext,
  createMockModelContext,
  type MockWebLLMContextOverrides,
  type MockModelContextOverrides,
} from "./factories";

/**
 * Default mock models for availableModels in WebLLM context
 * Used by WebLLMProvider mock
 */
export const MOCK_AVAILABLE_MODELS = [createMockLocalModel()];

/**
 * Creates a complete WebLLMProvider mock suitable for vi.mock()
 *
 * @example
 * vi.mock("../providers/web-llm-provider", () => createMockWebLLMProvider());
 *
 * @example with overrides
 * vi.mock("../providers/web-llm-provider", () =>
 *   createMockWebLLMProvider({ isLoading: true, status: "Loading..." })
 * );
 */
export function createMockWebLLMProvider(overrides: MockWebLLMContextOverrides = {}) {
  return {
    useWebLLM: vi.fn(() => createMockWebLLMContext(overrides)),
  };
}

/**
 * Creates a minimal WebLLMProvider mock with only isLoading and status
 * For tests that only check loading state
 *
 * @example
 * vi.mock("../providers/web-llm-provider", () => createMinimalWebLLMProvider());
 */
export function createMinimalWebLLMProvider(
  overrides: Pick<MockWebLLMContextOverrides, "isLoading" | "status"> = {}
) {
  return {
    useWebLLM: vi.fn(() => ({
      isLoading: overrides.isLoading ?? false,
      status: overrides.status ?? "Ready",
      selectedModel: null,
      availableModels: [],
      isLoadingModels: false,
      loadAvailableModels: vi.fn().mockResolvedValue([]),
    })),
  };
}

/**
 * Creates a complete ModelProvider mock suitable for vi.mock()
 *
 * @example
 * vi.mock("../providers/model-provider", () => createMockModelProvider());
 *
 * @example with overrides
 * vi.mock("../providers/model-provider", () =>
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
 * vi.mock("../providers/model-provider", () => createMinimalModelProvider());
 */
export function createMinimalModelProvider(
  overrides: Pick<MockModelContextOverrides, "currentModel" | "isModelLoading" | "modelStatus"> = {}
) {
  return {
    useModel: vi.fn(() => ({
      currentModel: overrides.currentModel ?? createMockModel("online"),
      isModelLoading: overrides.isModelLoading ?? false,
      modelStatus: overrides.modelStatus ?? "Ready",
      availableOnlineModels: [],
      isLoadingAvailableModels: false,
      availableModelsError: null,
    })),
  };
}
