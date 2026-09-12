import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  abortGeneration,
  endGeneration,
  startGeneration,
  useHasOtherGeneration,
  useIsGenerating,
} from "./active-generations";

describe("active generations", () => {
  it("reports a conversation as generating from start until end", () => {
    const controller = new AbortController();
    const { result } = renderHook(() => useIsGenerating("conversation-a"));

    expect(result.current).toBe(false);

    act(() => startGeneration("conversation-a", controller));
    expect(result.current).toBe(true);

    act(() => endGeneration("conversation-a", controller));
    expect(result.current).toBe(false);
  });

  it("keeps generations of other conversations invisible to this one", () => {
    const controller = new AbortController();
    const { result } = renderHook(() => useIsGenerating("conversation-b"));

    act(() => startGeneration("conversation-other", controller));
    expect(result.current).toBe(false);

    act(() => endGeneration("conversation-other", controller));
  });

  it("aborts the previous generation when a conversation starts another", () => {
    const first = new AbortController();
    const second = new AbortController();

    startGeneration("conversation-c", first);
    startGeneration("conversation-c", second);

    expect(first.signal.aborted).toBe(true);
    expect(second.signal.aborted).toBe(false);

    endGeneration("conversation-c", second);
  });

  it("ignores an end request from a superseded generation", () => {
    const first = new AbortController();
    const second = new AbortController();
    const { result } = renderHook(() => useIsGenerating("conversation-d"));

    act(() => startGeneration("conversation-d", first));
    act(() => startGeneration("conversation-d", second));
    act(() => endGeneration("conversation-d", first));

    expect(result.current).toBe(true);

    act(() => endGeneration("conversation-d", second));
    expect(result.current).toBe(false);
  });

  it("aborts the requested conversation and reports that it held the shared engine", () => {
    const controller = new AbortController();
    startGeneration("conversation-e", controller);

    expect(abortGeneration("conversation-e")).toBe(true);
    expect(controller.signal.aborted).toBe(true);

    endGeneration("conversation-e", controller);
  });

  it("does not report the shared engine for a generation queued behind an older one", () => {
    const older = new AbortController();
    const queued = new AbortController();
    startGeneration("conversation-older", older);
    startGeneration("conversation-queued", queued);

    expect(abortGeneration("conversation-queued")).toBe(false);
    expect(queued.signal.aborted).toBe(true);
    expect(older.signal.aborted).toBe(false);

    endGeneration("conversation-queued", queued);
    endGeneration("conversation-older", older);
  });

  it("reports whether any other conversation is generating", () => {
    const own = new AbortController();
    const other = new AbortController();
    const { result } = renderHook(() => useHasOtherGeneration("conversation-f"));

    expect(result.current).toBe(false);

    act(() => startGeneration("conversation-f", own));
    expect(result.current).toBe(false);

    act(() => startGeneration("conversation-g", other));
    expect(result.current).toBe(true);

    act(() => endGeneration("conversation-g", other));
    expect(result.current).toBe(false);

    act(() => endGeneration("conversation-f", own));
  });

  it("reports nothing to abort for a conversation without a generation", () => {
    expect(abortGeneration("conversation-idle")).toBe(false);
  });
});
