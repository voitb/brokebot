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
    mockUpdateConfig.mockResolvedValue(undefined);
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

  describe("API key masking", () => {
    it("masks long API keys correctly", async () => {
      mockConfig = { openrouterApiKey: "abcd1234567890efgh" };

      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      await waitFor(() => {
        expect(result.current.apiKey).toBe("abcd••••••••efgh");
      });
    });

    it("handles short API keys", async () => {
      mockConfig = { openrouterApiKey: "short" };

      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      // Short keys (< 8 chars) return empty string from mask
      await waitFor(() => {
        expect(result.current.apiKey).toBe("");
      });
    });
  });

  describe("handleApiKeySave", () => {
    it("saves valid API key and shows masked version", async () => {
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

    it("rejects masked API key (contains ••••)", async () => {
      mockConfig = { openrouterApiKey: "existing-key-1234" };
      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      await waitFor(() => {
        expect(result.current.apiKey).toContain("••••");
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
  });

  describe("editing mode", () => {
    it("startEditing shows actual key and sets isEditing", async () => {
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
    });

    it("cancelEditing restores masked key and exits edit mode", async () => {
      mockConfig = { openrouterApiKey: "real-key-for-editing" };
      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      await waitFor(() => {
        expect(result.current.hasStoredKey).toBe(true);
      });

      act(() => {
        result.current.startEditing();
      });

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

  describe("setApiKey", () => {
    it("updates apiKey state", () => {
      const { result } = renderHook(() => useApiKeyManager("openrouter"));

      act(() => {
        result.current.setApiKey("new-key");
      });

      expect(result.current.apiKey).toBe("new-key");
    });
  });
});
