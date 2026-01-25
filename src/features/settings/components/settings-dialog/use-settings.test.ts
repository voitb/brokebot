import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSettings } from "./use-settings";
import { mockToast } from "@/testing/mocks/modules";
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

describe("useSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = null;
    mockUpdateConfig.mockResolvedValue(undefined);
  });

  describe("initial state", () => {
    it("returns empty settings when no config exists", () => {
      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({});
      expect(result.current.isSaving).toBe(false);
    });

    it("syncs settings from config when available", async () => {
      mockConfig = { theme: "dark", username: "test" };

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.settings).toEqual({ theme: "dark", username: "test" });
      });
    });
  });

  describe("handleFieldChange", () => {
    it("updates a single field", async () => {
      mockConfig = { theme: "light" };

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.settings.theme).toBe("light");
      });

      act(() => {
        result.current.handleFieldChange("theme", "dark");
      });

      expect(result.current.settings.theme).toBe("dark");
    });

  });

  describe("handleSaveChanges", () => {
    it("saves settings and shows success toast", async () => {
      mockConfig = { theme: "light" };

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.settings.theme).toBe("light");
      });

      act(() => {
        result.current.handleFieldChange("theme", "dark");
      });

      await act(async () => {
        await result.current.handleSaveChanges();
      });

      expect(mockUpdateConfig).toHaveBeenCalledWith({ theme: "dark" });
      expect(mockToast.success).toHaveBeenCalledWith("Settings saved successfully!");
      expect(result.current.isSaving).toBe(false);
    });

    it("shows error toast on save failure", async () => {
      mockConfig = { theme: "light" };
      mockUpdateConfig.mockRejectedValue(new Error("Save failed"));

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.settings.theme).toBe("light");
      });

      await act(async () => {
        await result.current.handleSaveChanges();
      });

      expect(mockToast.error).toHaveBeenCalledWith("Failed to save settings.");
      expect(result.current.isSaving).toBe(false);
    });
  });
});
