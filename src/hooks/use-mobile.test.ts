import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
  const originalInnerWidth = window.innerWidth;
  let matchMediaListeners: Array<() => void> = [];
  let mockMatches = false;

  const mockMatchMedia = vi.fn((query: string) => ({
    matches: mockMatches,
    media: query,
    onchange: null,
    addEventListener: (_event: string, listener: () => void) => {
      matchMediaListeners.push(listener);
    },
    removeEventListener: (_event: string, listener: () => void) => {
      matchMediaListeners = matchMediaListeners.filter((l) => l !== listener);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  beforeEach(() => {
    matchMediaListeners = [];
    mockMatches = false;
    vi.stubGlobal("matchMedia", mockMatchMedia);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("returns true when viewport is less than 768px", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("returns false when viewport is 768px or greater", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("returns false for exactly 768px (boundary condition)", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("returns true for 767px (just below breakpoint)", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 767,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("updates state when matchMedia change event fires", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      matchMediaListeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(true);
  });

  it("creates matchMedia query with correct breakpoint", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    renderHook(() => useIsMobile());

    expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("removes event listener on unmount", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { unmount } = renderHook(() => useIsMobile());

    expect(matchMediaListeners.length).toBe(1);

    unmount();

    expect(matchMediaListeners.length).toBe(0);
  });

  it("handles initial state calculation correctly", () => {
    // Test that the hook correctly calculates initial state from window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useIsMobile());

    // Should use the actual window.innerWidth
    expect(result.current).toBe(true);
  });
});
