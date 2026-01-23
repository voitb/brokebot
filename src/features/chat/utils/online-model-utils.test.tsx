import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { getCategoryIcon, filterModelsByQuery } from "./online-model-utils";
import { createMockOpenRouterModel } from "@/testing/mocks/modules";

describe("onlineModelUtils", () => {
  describe("getCategoryIcon", () => {
    it("returns Brain icon for reasoning category", () => {
      const { container } = render(<>{getCategoryIcon("reasoning")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });

    it("returns Eye icon for multimodal category", () => {
      const { container } = render(<>{getCategoryIcon("multimodal")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });

    it("returns Zap icon for efficient category", () => {
      const { container } = render(<>{getCategoryIcon("efficient")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });

    it("returns Cloud icon for general category", () => {
      const { container } = render(<>{getCategoryIcon("general")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });

    it("returns Code icon for instruction category", () => {
      const { container } = render(<>{getCategoryIcon("instruction")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });

    it("returns fallback Cloud icon for unknown category", () => {
      const { container } = render(<>{getCategoryIcon("unknown")}</>);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("w-3", "h-3");
    });
  });

  describe("filterModelsByQuery", () => {
    const mockModels = [
      createMockOpenRouterModel({
        id: "openai/gpt-4",
        name: "GPT-4",
        isFree: false,
        description: "Advanced reasoning model",
        provider: "openai",
      }),
      createMockOpenRouterModel({
        id: "anthropic/claude-3",
        name: "Claude 3",
        isFree: false,
        description: "Helpful AI assistant",
        provider: "anthropic",
      }),
      createMockOpenRouterModel({
        id: "google/gemini",
        name: "Gemini Pro",
        isFree: true,
        description: "Multimodal capabilities",
        provider: "google",
      }),
    ];

    it("returns all models when query is empty", () => {
      expect(filterModelsByQuery(mockModels, "")).toEqual(mockModels);
      expect(filterModelsByQuery(mockModels, "   ")).toEqual(mockModels);
    });

    it("filters by model name (case-insensitive)", () => {
      const result = filterModelsByQuery(mockModels, "gpt");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("GPT-4");
    });

    it("filters by model name with different case", () => {
      const result = filterModelsByQuery(mockModels, "CLAUDE");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Claude 3");
    });

    it("filters by description", () => {
      const result = filterModelsByQuery(mockModels, "multimodal");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Gemini Pro");
    });

    it("filters by provider", () => {
      const result = filterModelsByQuery(mockModels, "anthropic");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Claude 3");
    });

    it("returns empty array when no matches", () => {
      const result = filterModelsByQuery(mockModels, "nonexistent");
      expect(result).toHaveLength(0);
    });

    it("matches partial strings", () => {
      const result = filterModelsByQuery(mockModels, "gem");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Gemini Pro");
    });

    it("trims whitespace from query", () => {
      const result = filterModelsByQuery(mockModels, "  gpt  ");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("GPT-4");
    });
  });
});
