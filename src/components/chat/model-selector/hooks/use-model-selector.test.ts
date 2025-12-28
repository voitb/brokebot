import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useModelSelector } from "./useModelSelector";
import type { ModelInfo } from "@/providers/WebLLMProvider";

const createMockModelInfo = (
  overrides: Partial<ModelInfo> = {}
): ModelInfo => ({
  id: "test-model-id",
  name: "Test Model",
  size: "1B",
  description: "A test model",
  ramRequirement: "2GB RAM",
  downloadSize: "~1GB",
  performance: "Good",
  category: "medium",
  modelType: "LLM",
  ...overrides,
});

describe("useModelSelector", () => {
  const mockModels: readonly ModelInfo[] = [
    createMockModelInfo({
      id: "llama-3",
      name: "Llama 3",
      category: "medium",
      performance: "Good",
    }),
    createMockModelInfo({
      id: "mistral",
      name: "Mistral",
      category: "light",
      performance: "Fast",
    }),
    createMockModelInfo({
      id: "gpt-4",
      name: "GPT-4",
      category: "heavy",
      performance: "Excellent",
    }),
  ];

  it("returns all models when search is empty", () => {
    const { result } = renderHook(() => useModelSelector(mockModels));
    const allModels = Object.values(result.current.modelsByCategory).flat();
    expect(allModels).toHaveLength(3);
  });

  it("filters by model name", () => {
    const { result } = renderHook(() => useModelSelector(mockModels));

    act(() => {
      result.current.setSearchQuery("llama");
    });

    const filteredModels = Object.values(
      result.current.modelsByCategory
    ).flat();
    expect(filteredModels).toHaveLength(1);
    expect(filteredModels[0].name).toBe("Llama 3");
  });

  it("filters by model description", () => {
    const modelsWithDescription: readonly ModelInfo[] = [
      createMockModelInfo({
        id: "model-1",
        name: "Model One",
        description: "Great for coding tasks",
      }),
      createMockModelInfo({
        id: "model-2",
        name: "Model Two",
        description: "General purpose model",
      }),
    ];

    const { result } = renderHook(() => useModelSelector(modelsWithDescription));

    act(() => {
      result.current.setSearchQuery("coding");
    });

    const filteredModels = Object.values(
      result.current.modelsByCategory
    ).flat();
    expect(filteredModels).toHaveLength(1);
    expect(filteredModels[0].name).toBe("Model One");
  });

  it("filters by performance category", () => {
    const { result } = renderHook(() => useModelSelector(mockModels));

    act(() => {
      result.current.setSearchQuery("fast");
    });

    const filteredModels = Object.values(
      result.current.modelsByCategory
    ).flat();
    expect(filteredModels).toHaveLength(1);
    expect(filteredModels[0].name).toBe("Mistral");
  });

  it("filters by category name", () => {
    const { result } = renderHook(() => useModelSelector(mockModels));

    act(() => {
      result.current.setSearchQuery("heavy");
    });

    const filteredModels = Object.values(
      result.current.modelsByCategory
    ).flat();
    expect(filteredModels).toHaveLength(1);
    expect(filteredModels[0].name).toBe("GPT-4");
  });

  it("groups models by category", () => {
    const { result } = renderHook(() => useModelSelector(mockModels));

    expect(result.current.modelsByCategory["light"]).toHaveLength(1);
    expect(result.current.modelsByCategory["medium"]).toHaveLength(1);
    expect(result.current.modelsByCategory["heavy"]).toHaveLength(1);
  });

  it("sorts categories in order: light → medium → large → heavy → extreme", () => {
    const modelsAllCategories: readonly ModelInfo[] = [
      createMockModelInfo({ id: "1", category: "extreme" }),
      createMockModelInfo({ id: "2", category: "light" }),
      createMockModelInfo({ id: "3", category: "heavy" }),
      createMockModelInfo({ id: "4", category: "medium" }),
      createMockModelInfo({ id: "5", category: "large" }),
    ];

    const { result } = renderHook(() => useModelSelector(modelsAllCategories));

    expect(result.current.sortedCategories).toEqual([
      "light",
      "medium",
      "large",
      "heavy",
      "extreme",
    ]);
  });

  it("search is case insensitive", () => {
    const { result } = renderHook(() => useModelSelector(mockModels));

    act(() => {
      result.current.setSearchQuery("LLAMA");
    });

    const filteredModels = Object.values(
      result.current.modelsByCategory
    ).flat();
    expect(filteredModels).toHaveLength(1);
    expect(filteredModels[0].name).toBe("Llama 3");
  });

  it("returns empty when no matches", () => {
    const { result } = renderHook(() => useModelSelector(mockModels));

    act(() => {
      result.current.setSearchQuery("nonexistent");
    });

    const filteredModels = Object.values(
      result.current.modelsByCategory
    ).flat();
    expect(filteredModels).toHaveLength(0);
  });
});
