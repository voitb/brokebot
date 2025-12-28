import { describe, it, expect, beforeAll } from "vitest";
import { createModelCatalog, type ModelInfo } from "./webllm";

describe("webllm", () => {
  describe("createModelCatalog", () => {
    let catalog: ModelInfo[];

    beforeAll(() => {
      catalog = createModelCatalog();
    });

    it("returns an array of models", () => {
      expect(Array.isArray(catalog)).toBe(true);
      expect(catalog.length).toBeGreaterThan(0);
    });

    it("each model has required fields", () => {
      catalog.forEach((model) => {
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.size).toBeDefined();
        expect(model.description).toBeDefined();
        expect(model.category).toBeDefined();
        expect(model.modelType).toBeDefined();
        expect(model.performance).toBeDefined();
      });
    });

    it("categories are valid values", () => {
      const validCategories = ["light", "medium", "large", "heavy", "extreme"];
      catalog.forEach((model) => {
        expect(validCategories).toContain(model.category);
      });
    });

    it("model types are valid values", () => {
      const validTypes = ["LLM", "VLM", "embedding"];
      catalog.forEach((model) => {
        expect(validTypes).toContain(model.modelType);
      });
    });

    it("derives coding specialization for coder models", () => {
      const coderModels = catalog.filter((m) =>
        m.id.toLowerCase().includes("coder")
      );
      coderModels.forEach((model) => {
        expect(model.specialization).toBe("coding");
      });
    });

    it("derives math specialization for math models", () => {
      const mathModels = catalog.filter((m) =>
        m.id.toLowerCase().includes("math")
      );
      mathModels.forEach((model) => {
        expect(model.specialization).toBe("math");
      });
    });

    it("derives VLM type for vision models", () => {
      const visionModels = catalog.filter((m) =>
        m.id.toLowerCase().includes("vision")
      );
      visionModels.forEach((model) => {
        expect(model.modelType).toBe("VLM");
        expect(model.supportsImages).toBe(true);
      });
    });

    it("derives function support for Hermes models", () => {
      const hermesModels = catalog.filter((m) =>
        m.id.toLowerCase().includes("hermes")
      );
      hermesModels.forEach((model) => {
        expect(model.supportsFunctions).toBe(true);
      });
    });

    it("adds warning for extreme category models", () => {
      const extremeModels = catalog.filter((m) => m.category === "extreme");
      extremeModels.forEach((model) => {
        expect(model.warning).toBeDefined();
      });
    });

    it("uses custom descriptions when available", () => {
      const llama32Model = catalog.find(
        (m) => m.id === "Llama-3.2-3B-Instruct-q4f16_1-MLC"
      );
      if (llama32Model) {
        expect(llama32Model.description).toBe("Meta's latest compact Llama model");
      }
    });
  });
});
