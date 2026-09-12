import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnlineModels } from "./use-online-models";
import {
  createMockOpenRouterModel,
  createMockUserConfig,
  mockToast,
} from "@/testing/mocks/modules";

const { useModelsMock } = vi.hoisted(() => ({ useModelsMock: vi.fn() }));

const keyedConfig = createMockUserConfig({
  openrouterApiKey: "test-api-key-12345",
});

let mockConfig = keyedConfig;

const mockModels = [
  createMockOpenRouterModel({ id: "free-model-1", name: "Free Model 1", isFree: true }),
  createMockOpenRouterModel({ id: "free-model-2", name: "Free Model 2", isFree: true }),
  createMockOpenRouterModel({ id: "paid-model-1", name: "Paid Model 1", isFree: false }),
  createMockOpenRouterModel({ id: "paid-model-2", name: "Paid Model 2", isFree: false }),
];

vi.mock("@/hooks/use-user-config", async () => {
  const { createMockUserConfigHook } = await import("@/testing/mocks/hooks");
  return {
    useUserConfig: () => createMockUserConfigHook({ config: mockConfig }),
  };
});

vi.mock("@/features/chat/hooks/use-models", () => ({
  useModels: useModelsMock,
}));

describe("useOnlineModels", () => {
  const mockOnModelSelect = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = keyedConfig;
    useModelsMock.mockReturnValue({ models: mockModels, isLoading: false, error: null });
  });

  describe("initial state", () => {
    it("separates free and paid models", () => {
      const { result } = renderHook(() =>
        useOnlineModels(mockOnModelSelect, mockOnOpenChange)
      );

      expect(result.current.freeModels.map((m) => m.id)).toEqual([
        "free-model-1",
        "free-model-2",
      ]);
      expect(result.current.paidModels.map((m) => m.id)).toEqual([
        "paid-model-1",
        "paid-model-2",
      ]);
    });

    it("fetches the catalog with the stored OpenRouter key", () => {
      renderHook(() => useOnlineModels(mockOnModelSelect, mockOnOpenChange));

      expect(useModelsMock).toHaveBeenCalledWith({
        apiKey: keyedConfig.openrouterApiKey,
      });
    });

    it("returns hasOpenRouterKey as true when key exists", () => {
      const { result } = renderHook(() =>
        useOnlineModels(mockOnModelSelect, mockOnOpenChange)
      );
      expect(result.current.hasOpenRouterKey).toBe(true);
    });

    it("returns hasOpenRouterKey as false and fetches without a key when none is stored", () => {
      mockConfig = createMockUserConfig({ openrouterApiKey: "" });

      const { result } = renderHook(() =>
        useOnlineModels(mockOnModelSelect, mockOnOpenChange)
      );

      expect(result.current.hasOpenRouterKey).toBe(false);
      expect(useModelsMock).toHaveBeenCalledWith({ apiKey: "" });
    });
  });

  describe("handleModelSelect", () => {
    it("calls onModelSelect with model and API key", () => {
      const { result } = renderHook(() =>
        useOnlineModels(mockOnModelSelect, mockOnOpenChange)
      );
      const model = mockModels[0];

      act(() => {
        result.current.handleModelSelect(model);
      });

      expect(mockOnModelSelect).toHaveBeenCalledWith(model, "test-api-key-12345");
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("shows error toast when no API key exists", () => {
      mockConfig = createMockUserConfig({ openrouterApiKey: "" });

      const { result } = renderHook(() =>
        useOnlineModels(mockOnModelSelect, mockOnOpenChange)
      );

      act(() => {
        result.current.handleModelSelect(mockModels[0]);
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        "Please add your OpenRouter API key first in Settings."
      );
      expect(mockOnModelSelect).not.toHaveBeenCalled();
      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });
  });

  describe("storedKeys", () => {
    it("returns openrouter key from config", () => {
      const { result } = renderHook(() =>
        useOnlineModels(mockOnModelSelect, mockOnOpenChange)
      );

      expect(result.current.storedKeys).toEqual({
        openrouter: "test-api-key-12345",
      });
    });
  });
});
