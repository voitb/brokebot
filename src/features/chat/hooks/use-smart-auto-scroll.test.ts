import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSmartAutoScroll, type UseSmartAutoScrollOptions } from "./use-smart-auto-scroll";

type ScrollToMethod = (options?: ScrollToOptions | number, y?: number) => void;

describe("useSmartAutoScroll", () => {
  let scrollTo: Mock<ScrollToMethod>;
  let container: HTMLDivElement;

  beforeEach(() => {
    scrollTo = vi.fn<ScrollToMethod>();
    container = document.createElement("div");
    container.scrollTo = scrollTo;
  });

  function renderScroll(initialProps: UseSmartAutoScrollOptions) {
    const view = renderHook(
      (props: UseSmartAutoScrollOptions) => useSmartAutoScroll<HTMLDivElement>(props),
      { initialProps }
    );
    view.result.current.scrollAreaRef.current = container;
    scrollTo.mockClear();
    return view;
  }

  it("jumps to the bottom when the conversation changes", () => {
    const view = renderScroll({ messageCount: 3, isGenerating: false, conversationId: "conv-1" });
    act(() => view.rerender({ messageCount: 3, isGenerating: false, conversationId: "conv-2" }));
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "auto" }));
  });

  it("scrolls smoothly when a message arrives in the current conversation", () => {
    const view = renderScroll({ messageCount: 3, isGenerating: false, conversationId: "conv-1" });
    act(() => view.rerender({ messageCount: 3, isGenerating: false, conversationId: "conv-2" }));
    scrollTo.mockClear();
    act(() => view.rerender({ messageCount: 4, isGenerating: false, conversationId: "conv-2" }));
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
  });

  it("does not scroll when nothing changed", () => {
    const view = renderScroll({ messageCount: 3, isGenerating: false, conversationId: "conv-1" });
    act(() => view.rerender({ messageCount: 3, isGenerating: false, conversationId: "conv-2" }));
    scrollTo.mockClear();
    act(() => view.rerender({ messageCount: 3, isGenerating: false, conversationId: "conv-2" }));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("resumes auto-scroll in a new conversation after the user scrolled up", () => {
    let scrollTop = 0;
    Object.defineProperty(container, "scrollTop", {
      get: () => scrollTop,
      configurable: true,
    });
    Object.defineProperty(container, "scrollHeight", { value: 1000, configurable: true });
    Object.defineProperty(container, "clientHeight", { value: 300, configurable: true });

    const view = renderScroll({ messageCount: 3, isGenerating: false, conversationId: "conv-1" });
    act(() => view.rerender({ messageCount: 3, isGenerating: false, conversationId: "conv-2" }));

    scrollTop = 700;
    act(() => container.dispatchEvent(new Event("scroll")));
    scrollTop = 200;
    act(() => container.dispatchEvent(new Event("scroll")));

    scrollTo.mockClear();
    act(() => view.rerender({ messageCount: 4, isGenerating: false, conversationId: "conv-2" }));
    expect(scrollTo).not.toHaveBeenCalled();

    scrollTo.mockClear();
    act(() => view.rerender({ messageCount: 5, isGenerating: false, conversationId: "conv-3" }));
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
  });

  it("follows streamed content that grows the viewport", async () => {
    let scrollHeight = 1000;
    Object.defineProperty(container, "scrollTop", { value: 0, configurable: true });
    Object.defineProperty(container, "scrollHeight", {
      get: () => scrollHeight,
      configurable: true,
    });
    Object.defineProperty(container, "clientHeight", { value: 300, configurable: true });

    const view = renderScroll({ messageCount: 3, isGenerating: false, conversationId: "conv-1" });
    act(() => view.rerender({ messageCount: 3, isGenerating: true, conversationId: "conv-2" }));

    scrollTo.mockClear();
    scrollHeight = 1400;
    await act(async () => {
      container.appendChild(document.createElement("span"));
    });

    expect(scrollTo).toHaveBeenCalledWith({ top: 1400, behavior: "auto" });
  });

  it("does not follow streamed content after the user scrolled up", async () => {
    let scrollTop = 0;
    let scrollHeight = 1000;
    Object.defineProperty(container, "scrollTop", {
      get: () => scrollTop,
      configurable: true,
    });
    Object.defineProperty(container, "scrollHeight", {
      get: () => scrollHeight,
      configurable: true,
    });
    Object.defineProperty(container, "clientHeight", { value: 300, configurable: true });

    const view = renderScroll({ messageCount: 3, isGenerating: false, conversationId: "conv-1" });
    act(() => view.rerender({ messageCount: 3, isGenerating: true, conversationId: "conv-2" }));

    scrollTop = 700;
    act(() => container.dispatchEvent(new Event("scroll")));
    scrollTop = 200;
    act(() => container.dispatchEvent(new Event("scroll")));

    scrollTo.mockClear();
    scrollHeight = 1400;
    await act(async () => {
      container.appendChild(document.createElement("span"));
    });

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("scrolls smoothly when the scroll-to-bottom control is used", () => {
    const view = renderScroll({ messageCount: 3, isGenerating: false, conversationId: "conv-1" });
    act(() => view.result.current.handleScrollToBottomClick());
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
  });
});
