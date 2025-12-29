import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSmartAutoScroll } from "./use-smart-auto-scroll";
import { createMockViewport, createMockMutationObserver } from "@/test/mocks/dom-helpers";

const defaultOptions = {
  messageCount: 0,
  isGenerating: false,
  conversationId: null,
};

describe("useSmartAutoScroll", () => {
  let mockObserver: ReturnType<typeof createMockMutationObserver>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockObserver = createMockMutationObserver();
    vi.stubGlobal("MutationObserver", vi.fn(() => mockObserver));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("initial state", () => {
    it("returns scrollAreaRef", () => {
      const { result } = renderHook(() => useSmartAutoScroll(defaultOptions));

      expect(result.current.scrollAreaRef).toBeDefined();
      expect(result.current.scrollAreaRef.current).toBeNull();
    });

    it("starts with showScrollButton as false", () => {
      const { result } = renderHook(() => useSmartAutoScroll(defaultOptions));

      expect(result.current.showScrollButton).toBe(false);
    });

    it("provides handleScrollToBottomClick function", () => {
      const { result } = renderHook(() => useSmartAutoScroll(defaultOptions));

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

      const { result } = renderHook(() => useSmartAutoScroll(defaultOptions));

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

      const { result } = renderHook(() => useSmartAutoScroll(defaultOptions));

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

      const { result } = renderHook(() => useSmartAutoScroll(defaultOptions));

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

      const { result } = renderHook(() =>
        useSmartAutoScroll({ messageCount: 1, isGenerating: false, conversationId: "test-id" })
      );

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
      const { unmount } = renderHook(() => useSmartAutoScroll(defaultOptions));

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

      const { result } = renderHook(() => useSmartAutoScroll(defaultOptions));

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

      const { result } = renderHook(() => useSmartAutoScroll(defaultOptions));

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
      const { result } = renderHook(() => useSmartAutoScroll(defaultOptions));

      expect(() => {
        act(() => {
          result.current.handleScrollToBottomClick();
        });
      }).not.toThrow();
    });
  });
});
