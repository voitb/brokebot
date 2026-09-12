import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRootTheme } from "./use-root-theme";

describe("useRootTheme", () => {
  afterEach(async () => {
    await act(async () => {
      document.documentElement.classList.remove("dark");
    });
  });

  it("reports the theme currently applied to the document root", () => {
    document.documentElement.classList.add("dark");

    const { result } = renderHook(() => useRootTheme());

    expect(result.current).toBe("dark");
  });

  it("updates when the root theme class changes", async () => {
    const { result } = renderHook(() => useRootTheme());

    expect(result.current).toBe("light");

    await act(async () => {
      document.documentElement.classList.add("dark");
    });

    expect(result.current).toBe("dark");
  });
});
