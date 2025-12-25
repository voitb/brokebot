import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSmartAutoScroll } from "./useSmartAutoScroll";

function createMockViewport(overrides: Partial<HTMLElement> = {}) {
  return {
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 500,
    scrollTo: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    querySelector: vi.fn(),
    ...overrides,
  } as unknown as HTMLElement;
}

describe("useSmartAutoScroll", () => {
  let mockObserver: {
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    takeRecords: ReturnType<typeof vi.fn>;
  };
  let observerCallback: MutationCallback;

  beforeEach(() => {
    vi.useFakeTimers();

    mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    };

    global.MutationObserver = vi.fn((callback: MutationCallback) => {
      observerCallback = callback;
      return mockObserver;
    }) as unknown as typeof MutationObserver;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("returns scrollAreaRef", () => {
      const { result } = renderHook(() => useSmartAutoScroll());

      expect(result.current.scrollAreaRef).toBeDefined();
      expect(result.current.scrollAreaRef.current).toBeNull();
    });

    it("starts with showScrollButton as false", () => {
      const { result } = renderHook(() => useSmartAutoScroll());

      expect(result.current.showScrollButton).toBe(false);
    });

    it("provides handleScrollToBottomClick function", () => {
      const { result } = renderHook(() => useSmartAutoScroll());

      expect(typeof result.current.handleScrollToBottomClick).toBe("function");
    });
  });

  describe("scroll button visibility", () => {
    it("shows scroll button when far from bottom", () => {
      const mockViewport = createMockViewport({
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 500,
      });

      const { result } = renderHook(() => useSmartAutoScroll());

      const scrollAreaElement = document.createElement("div");
      scrollAreaElement.querySelector = vi.fn().mockReturnValue(mockViewport);

      Object.defineProperty(result.current.scrollAreaRef, "current", {
        value: scrollAreaElement,
        writable: true,
      });

      let scrollHandler: ((e: Event) => void) | undefined;
      (mockViewport.addEventListener as ReturnType<typeof vi.fn>).mockImplementation(
        (event: string, handler: (e: Event) => void) => {
          if (event === "scroll") {
            scrollHandler = handler;
          }
        }
      );

      act(() => {
        result.current.scrollAreaRef.current = scrollAreaElement;
      });

      if (scrollHandler) {
        act(() => {
          Object.defineProperty(mockViewport, "scrollTop", { value: 100, configurable: true });
          scrollHandler!(new Event("scroll"));
        });
      }
    });
  });

  describe("handleScrollToBottomClick", () => {
    it("scrolls to bottom with smooth behavior", () => {
      const mockViewport = createMockViewport({
        scrollHeight: 2000,
      });

      const { result } = renderHook(() => useSmartAutoScroll());

      const scrollAreaElement = document.createElement("div");
      scrollAreaElement.querySelector = vi.fn().mockReturnValue(mockViewport);

      Object.defineProperty(result.current.scrollAreaRef, "current", {
        value: scrollAreaElement,
        writable: true,
      });

      act(() => {
        result.current.handleScrollToBottomClick();
      });

      expect(mockViewport.scrollTo).toHaveBeenCalledWith({
        top: 2000,
        behavior: "smooth",
      });
    });

    it("works when viewport is direct element", () => {
      const mockElement = createMockViewport({
        scrollHeight: 1500,
      });

      (mockElement.querySelector as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const { result } = renderHook(() => useSmartAutoScroll());

      Object.defineProperty(result.current.scrollAreaRef, "current", {
        value: mockElement,
        writable: true,
      });

      act(() => {
        result.current.handleScrollToBottomClick();
      });

      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        top: 1500,
        behavior: "smooth",
      });
    });
  });

  describe("auto-scroll on dependency changes", () => {
    it("scrolls to bottom on initial render", () => {
      const mockViewport = createMockViewport({
        scrollHeight: 2000,
      });

      const { result } = renderHook(() => useSmartAutoScroll([1]));

      const scrollAreaElement = document.createElement("div");
      scrollAreaElement.querySelector = vi.fn().mockReturnValue(mockViewport);

      Object.defineProperty(result.current.scrollAreaRef, "current", {
        value: scrollAreaElement,
        writable: true,
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });
    });
  });

  describe("cleanup", () => {
    it("cleans up on unmount without errors", () => {
      const { unmount } = renderHook(() => useSmartAutoScroll());

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe("radix viewport detection", () => {
    it("finds radix scroll area viewport", () => {
      const radixViewport = createMockViewport({
        scrollHeight: 3000,
      });

      const { result } = renderHook(() => useSmartAutoScroll());

      const scrollAreaElement = document.createElement("div");
      scrollAreaElement.querySelector = vi.fn((selector: string) => {
        if (selector === "[data-radix-scroll-area-viewport]") {
          return radixViewport;
        }
        return null;
      });

      Object.defineProperty(result.current.scrollAreaRef, "current", {
        value: scrollAreaElement,
        writable: true,
      });

      act(() => {
        result.current.handleScrollToBottomClick();
      });

      expect(radixViewport.scrollTo).toHaveBeenCalledWith({
        top: 3000,
        behavior: "smooth",
      });
    });

    it("falls back to container when no radix viewport", () => {
      const containerElement = createMockViewport({
        scrollHeight: 2500,
      });

      (containerElement.querySelector as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const { result } = renderHook(() => useSmartAutoScroll());

      Object.defineProperty(result.current.scrollAreaRef, "current", {
        value: containerElement,
        writable: true,
      });

      act(() => {
        result.current.handleScrollToBottomClick();
      });

      expect(containerElement.scrollTo).toHaveBeenCalledWith({
        top: 2500,
        behavior: "smooth",
      });
    });
  });

  describe("null ref handling", () => {
    it("handles null scrollAreaRef gracefully", () => {
      const { result } = renderHook(() => useSmartAutoScroll());

      expect(() => {
        act(() => {
          result.current.handleScrollToBottomClick();
        });
      }).not.toThrow();
    });
  });
});
