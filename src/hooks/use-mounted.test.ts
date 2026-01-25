import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMounted } from "./use-mounted";

describe("useMounted", () => {
  it("returns true when component is mounted", () => {
    const { result } = renderHook(() => useMounted());

    expect(result.current.current).toBe(true);
  });

  it("returns false after component unmounts", () => {
    const { result, unmount } = renderHook(() => useMounted());

    expect(result.current.current).toBe(true);

    unmount();

    expect(result.current.current).toBe(false);
  });

  it("ref is stable across renders", () => {
    const { result, rerender } = renderHook(() => useMounted());

    const firstRef = result.current;

    rerender();

    const secondRef = result.current;

    expect(firstRef).toBe(secondRef);
  });

  it("maintains mounted state through multiple rerenders", () => {
    const { result, rerender } = renderHook(() => useMounted());

    expect(result.current.current).toBe(true);

    rerender();
    expect(result.current.current).toBe(true);

    rerender();
    expect(result.current.current).toBe(true);
  });

  it("returns RefObject with readonly current property", () => {
    const { result } = renderHook(() => useMounted());

    expect(result.current).toHaveProperty("current");
    expect(typeof result.current.current).toBe("boolean");
  });

  it("can be used to guard async operations", async () => {
    const { result, unmount } = renderHook(() => useMounted());

    const asyncOperation = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return result.current.current;
    };

    const promise = asyncOperation();
    unmount();
    const mountedAfterUnmount = await promise;

    expect(mountedAfterUnmount).toBe(false);
  });

  it("starts with true value on mount", () => {
    const { result } = renderHook(() => useMounted());

    expect(result.current.current).toBe(true);
  });

  it("cleanup sets ref to false exactly once", () => {
    const { result, unmount } = renderHook(() => useMounted());

    expect(result.current.current).toBe(true);

    unmount();

    expect(result.current.current).toBe(false);

    unmount();

    expect(result.current.current).toBe(false);
  });
});
