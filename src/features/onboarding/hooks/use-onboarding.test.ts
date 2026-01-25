import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useOnboarding } from "./use-onboarding";

describe("useOnboarding", () => {
  const STORAGE_KEY = "onboardingCompleted-v1";
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows onboarding when not completed", async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.showOnboarding).toBe(true);
    });
  });

  it("completes onboarding and persists to localStorage", async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.showOnboarding).toBe(true);
    });

    act(() => {
      result.current.completeOnboarding();
    });

    expect(result.current.showOnboarding).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("true");
  });

  it("respects previous completion from localStorage", async () => {
    store[STORAGE_KEY] = "true";

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.showOnboarding).toBe(false);
    });
  });
});
