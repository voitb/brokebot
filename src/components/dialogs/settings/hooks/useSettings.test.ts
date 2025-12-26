import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSettings } from "./useSettings";
import { toast } from "sonner";

const mockUpdateConfig = vi.fn();
let mockConfig: { theme?: string; language?: string } | null = null;

vi.mock("@/hooks/useUserConfig", () => ({
  useUserConfig: () => ({
    config: mockConfig,
    updateConfig: mockUpdateConfig,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

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
      mockConfig = { theme: "dark", language: "en" };

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.settings).toEqual({ theme: "dark", language: "en" });
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

    it("preserves other fields when updating one", async () => {
      mockConfig = { theme: "light", language: "en" };

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.settings).toEqual({ theme: "light", language: "en" });
      });

      act(() => {
        result.current.handleFieldChange("theme", "dark");
      });

      expect(result.current.settings).toEqual({ theme: "dark", language: "en" });
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
      expect(toast.success).toHaveBeenCalledWith("Settings saved successfully!");
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

      expect(toast.error).toHaveBeenCalledWith("Failed to save settings.");
      expect(result.current.isSaving).toBe(false);
    });

    it("resets isSaving after save completes", async () => {
      mockConfig = { theme: "light" };

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.settings.theme).toBe("light");
      });

      // isSaving should be false initially
      expect(result.current.isSaving).toBe(false);

      await act(async () => {
        await result.current.handleSaveChanges();
      });

      // isSaving should be false after completion
      expect(result.current.isSaving).toBe(false);
    });
  });

  describe("config sync", () => {
    it("updates settings when config changes", async () => {
      mockConfig = { theme: "light" };

      const { result, rerender } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.settings.theme).toBe("light");
      });

      mockConfig = { theme: "dark" };
      rerender();

      await waitFor(() => {
        expect(result.current.settings.theme).toBe("dark");
      });
    });
  });
});
