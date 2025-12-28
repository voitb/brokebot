import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useOnboarding } from "./useOnboarding";

describe("useOnboarding", () => {
  const STORAGE_KEY = "onboardingCompleted-v1";

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("initial state", () => {
    it("shows onboarding when not completed", async () => {
      const { result } = renderHook(() => useOnboarding());

      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(true);
      });
    });

    it("hides onboarding when already completed", async () => {
      localStorage.setItem(STORAGE_KEY, "true");

      const { result } = renderHook(() => useOnboarding());

      // Initially false, stays false because localStorage has the key
      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(false);
      });
    });
  });

  describe("completeOnboarding", () => {
    it("saves completion to localStorage", async () => {
      const { result } = renderHook(() => useOnboarding());

      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(true);
      });

      act(() => {
        result.current.completeOnboarding();
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBe("true");
    });

    it("hides onboarding after completion", async () => {
      const { result } = renderHook(() => useOnboarding());

      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(true);
      });

      act(() => {
        result.current.completeOnboarding();
      });

      expect(result.current.showOnboarding).toBe(false);
    });
  });

  describe("persistence", () => {
    it("persists across remounts", async () => {
      const { result, unmount } = renderHook(() => useOnboarding());

      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(true);
      });

      act(() => {
        result.current.completeOnboarding();
      });

      unmount();

      const { result: result2 } = renderHook(() => useOnboarding());

      await waitFor(() => {
        expect(result2.current.showOnboarding).toBe(false);
      });
    });
  });

  describe("localStorage edge cases", () => {
    it("handles localStorage getItem returning null", async () => {
      // Ensure localStorage is clean
      localStorage.clear();

      const { result } = renderHook(() => useOnboarding());

      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(true);
      });
    });

    it("handles any truthy localStorage value", async () => {
      // Clear any previous mocks and set storage before rendering
      vi.restoreAllMocks();
      localStorage.clear();
      localStorage.setItem(STORAGE_KEY, "yes");

      const { result } = renderHook(() => useOnboarding());

      // Should stay false because localStorage has a truthy value
      await waitFor(() => {
        expect(result.current.showOnboarding).toBe(false);
      });
    });
  });
});
