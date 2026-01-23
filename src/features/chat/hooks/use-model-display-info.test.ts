import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useModelDisplayInfo } from "./use-model-display-info";
import { useModel } from "@/app/providers/model-provider";

vi.mock("@/app/providers/model-provider", () => ({
  useModel: vi.fn(),
}));

describe("useModelDisplayInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("isModelError", () => {
    it("returns true when modelStatus contains 'error'", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Error: Something went wrong",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useModelDisplayInfo());

      expect(result.current.isModelError).toBe(true);
    });

    it("returns false when modelStatus does not contain 'error'", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useModelDisplayInfo());

      expect(result.current.isModelError).toBe(false);
    });
  });

  describe("isModelReady", () => {
    it("returns true when model exists and not loading", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useModelDisplayInfo());

      expect(result.current.isModelReady).toBe(true);
    });

    it("returns false when model is loading", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: true,
        modelStatus: "Loading...",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useModelDisplayInfo());

      expect(result.current.isModelReady).toBe(false);
    });

    it("returns false when no model exists", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: null,
        isModelLoading: false,
        modelStatus: "No model selected",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useModelDisplayInfo());

      expect(result.current.isModelReady).toBe(false);
    });
  });

  describe("modelDisplayInfo", () => {
    it("returns correct info for online model", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: {
          name: "GPT-4",
          type: "online",
          onlineModel: { category: "chat" },
        },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useModelDisplayInfo());

      expect(result.current.modelDisplayInfo).toEqual({
        name: "GPT-4",
        modelType: "Online",
        supportsImages: false,
        specialization: "chat",
      });
    });

    it("returns correct info for local model", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: {
          name: "Llama",
          type: "local",
          localModel: { specialization: "general" },
        },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useModelDisplayInfo());

      expect(result.current.modelDisplayInfo).toEqual({
        name: "Llama",
        modelType: "Local",
        supportsImages: false,
        specialization: "general",
      });
    });

    it("returns initializing info when no model", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: null,
        isModelLoading: true,
        modelStatus: "Loading...",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useModelDisplayInfo());

      expect(result.current.modelDisplayInfo).toEqual({
        name: "Initializing...",
        modelType: "None",
        supportsImages: false,
      });
    });
  });

  describe("currentModelName", () => {
    it("returns model name when model exists", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useModelDisplayInfo());

      expect(result.current.currentModelName).toBe("Test Model");
    });

    it("returns undefined when no model", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: null,
        isModelLoading: false,
        modelStatus: "No model",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useModelDisplayInfo());

      expect(result.current.currentModelName).toBeUndefined();
    });
  });
});
