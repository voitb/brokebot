import { describe, it, expect } from "vitest";
import { getDisplayName } from "./model-selector-utils";
import type { UnifiedModel } from "@/app/providers/model-provider";
import type { ModelInfo } from "@/app/providers/web-llm-provider";

const mockActiveLocalModel: ModelInfo = {
  id: "local-model-1",
  name: "Llama 3.2 1B",
  description: "A local model",
  size: "1B",
  downloadSize: "500MB",
  ramRequirement: "2GB",
  performance: "fast",
  category: "light",
  modelType: "LLM",
  specialization: "general",
};

const mockOnlineModel: UnifiedModel = {
  id: "online-model-1",
  name: "GPT-4",
  type: "online",
  description: "An online model",
  onlineModel: {
    id: "gpt-4",
    name: "GPT-4 Turbo",
    description: "Latest GPT-4",
    contextLength: 128000,
    pricing: { prompt: "0.01", completion: "0.03" },
    isFree: false,
    provider: "openai",
    category: "general",
  },
};

const mockLocalModel: UnifiedModel = {
  id: "local-model-1",
  name: "Llama 3.2 1B",
  type: "local",
  description: "A local model",
  localModel: mockActiveLocalModel,
};

describe("getDisplayName", () => {
  it("returns 'Select Model' when currentModel is null", () => {
    const result = getDisplayName({
      currentModel: null,
      activeLocalModel: mockActiveLocalModel,
    });

    expect(result).toBe("Select Model");
  });

  it("returns online model name when currentModel is online type", () => {
    const result = getDisplayName({
      currentModel: mockOnlineModel,
      activeLocalModel: mockActiveLocalModel,
    });

    expect(result).toBe("GPT-4 Turbo");
  });

  it("returns 'Online Model' when online model has no name", () => {
    const modelWithoutOnlineModel: UnifiedModel = {
      ...mockOnlineModel,
      onlineModel: undefined,
    };

    const result = getDisplayName({
      currentModel: modelWithoutOnlineModel,
      activeLocalModel: mockActiveLocalModel,
    });

    expect(result).toBe("Online Model");
  });

  it("returns activeLocalModel name when currentModel is local type", () => {
    const result = getDisplayName({
      currentModel: mockLocalModel,
      activeLocalModel: mockActiveLocalModel,
    });

    expect(result).toBe("Llama 3.2 1B");
  });
});
