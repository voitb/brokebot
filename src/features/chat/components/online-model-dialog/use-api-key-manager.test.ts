import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useApiKeyManager } from "./use-api-key-manager";
import type { UserConfig } from "@/lib/db";

const mockUpdateConfig = vi.fn();

let mockConfig: Partial<UserConfig> | null = null;

vi.mock("@/hooks/use-user-config", async () => {
  const { createMockUserConfigHook } = await import("@/testing/mocks/hooks");
  return {
    useUserConfig: () => createMockUserConfigHook({
      config: mockConfig,
      updateConfig: mockUpdateConfig,
    }),
  };
});

describe("useApiKeyManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = null;
    mockUpdateConfig.mockImplementation(async (update: Partial<UserConfig>) => {
      mockConfig = { ...mockConfig, ...update };
    });
  });

  describe("initial state", () => {
    it("returns empty state when no config exists", () => {
      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      expect(result.current.apiKey).toBe("");
      expect(result.current.hasStoredKey).toBe(false);
      expect(result.current.isEditing).toBe(false);
    });

    it("shows masked key when config has API key", async () => {
      mockConfig = { openrouterApiKey: "sk-or-v1-abcdefgh12345678" };

      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      await waitFor(() => {
        expect(result.current.hasStoredKey).toBe(true);
        expect(result.current.apiKey).toBe("sk-o••••••••5678");
      });
    });
  });

  describe("handleApiKeySave", () => {
    it("saves valid API key", async () => {
      mockConfig = {};
      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      act(() => {
        result.current.setApiKey("new-api-key-1234567890");
      });

      await act(async () => {
        await result.current.handleApiKeySave();
      });

      expect(mockUpdateConfig).toHaveBeenCalledWith({
        openrouterApiKey: "new-api-key-1234567890",
      });
      expect(result.current.hasStoredKey).toBe(true);
      expect(result.current.isEditing).toBe(false);
    });

    it("rejects empty API key", async () => {
      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      act(() => {
        result.current.setApiKey("   ");
      });

      await act(async () => {
        await result.current.handleApiKeySave();
      });

      expect(mockUpdateConfig).not.toHaveBeenCalled();
    });

    it("leaves field state unchanged when the write fails", async () => {
      mockConfig = {};
      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      act(() => {
        result.current.setApiKey("new-api-key-1234567890");
      });

      mockUpdateConfig.mockRejectedValueOnce(new Error("db write failed"));

      await act(async () => {
        await expect(result.current.handleApiKeySave()).rejects.toThrow();
      });

      expect(result.current.apiKey).toBe("new-api-key-1234567890");
      expect(result.current.isEditing).toBe(false);
    });

    it("rejects a masked placeholder", async () => {
      mockConfig = { openrouterApiKey: "sk-or-v1-abcdefgh12345678" };
      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      await waitFor(() => {
        expect(result.current.apiKey).toBe("sk-o••••••••5678");
      });

      await act(async () => {
        await result.current.handleApiKeySave();
      });

      expect(mockUpdateConfig).not.toHaveBeenCalled();
    });
  });

  describe("handleApiKeyRemove", () => {
    it("removes API key and resets state", async () => {
      mockConfig = { openrouterApiKey: "existing-key-1234" };
      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      await waitFor(() => {
        expect(result.current.hasStoredKey).toBe(true);
      });

      await act(async () => {
        await result.current.handleApiKeyRemove();
      });

      expect(mockUpdateConfig).toHaveBeenCalledWith({ openrouterApiKey: "" });
      expect(result.current.hasStoredKey).toBe(false);
      expect(result.current.apiKey).toBe("");
      expect(result.current.isEditing).toBe(false);
    });

    it("keeps the stored key when the removal write fails", async () => {
      mockConfig = { openrouterApiKey: "existing-key-1234" };
      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      await waitFor(() => {
        expect(result.current.hasStoredKey).toBe(true);
      });

      mockUpdateConfig.mockRejectedValueOnce(new Error("db write failed"));

      await act(async () => {
        await expect(result.current.handleApiKeyRemove()).rejects.toThrow();
      });

      expect(result.current.apiKey).toBe("exis••••••••1234");
      expect(result.current.isEditing).toBe(false);
    });
  });

  describe("editing mode", () => {
    it("startEditing shows actual key, cancelEditing restores masked key", async () => {
      mockConfig = { openrouterApiKey: "real-key-for-editing" };
      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      await waitFor(() => {
        expect(result.current.hasStoredKey).toBe(true);
      });

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);
      expect(result.current.apiKey).toBe("real-key-for-editing");

      act(() => {
        result.current.setApiKey("modified-key");
      });

      act(() => {
        result.current.cancelEditing();
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.apiKey).toBe("real••••••••ting");
    });
  });
});
