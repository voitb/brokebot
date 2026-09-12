/**
 * Mock constants that can be used in vi.mock() factories
 * This file has no vitest imports to avoid hoisting issues
 */

/**
 * Default mock local model matching the shape expected by WebLLMProvider
 */
export const MOCK_LOCAL_MODEL = {
  id: "test-model",
  name: "Test Model",
  size: "1B",
  description: "Test model for unit tests",
  ramRequirement: "1GB",
  performance: "Fast",
  category: "light" as const,
  modelType: "LLM" as const,
  specialization: "general",
};

/**
 * Array of available models for AVAILABLE_MODELS export
 */
export const MOCK_AVAILABLE_MODELS = [MOCK_LOCAL_MODEL];

/**
 * Default mock online model
 */
export const MOCK_ONLINE_MODEL = {
  id: "test-model",
  name: "Test Model",
  type: "online" as const,
  description: "A test model for unit tests",
};
