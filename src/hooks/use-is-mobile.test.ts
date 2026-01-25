import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsMobile } from "./use-is-mobile";
import { createMockMatchMedia } from "@/testing/mocks/dom-helpers";

describe("useIsMobile", () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.stubGlobal("matchMedia", createMockMatchMedia(false));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  function setViewportWidth(width: number): void {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
  }

  it.each([
    [500, true],
    [767, true],
    [768, false],
    [1024, false],
  ])("returns %s for %dpx viewport", (width, expected) => {
    setViewportWidth(width);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(expected);
  });
});
