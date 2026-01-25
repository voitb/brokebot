import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCopyToClipboard } from "./use-copy-to-clipboard";
import { mockToast } from "@/testing/mocks/modules";

describe("useCopyToClipboard", () => {
  const mockWriteText = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });
    mockWriteText.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("copies text and shows success toast", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard("Test text");
    });

    expect(mockWriteText).toHaveBeenCalledWith("Test text");
    expect(result.current.copied).toBe(true);
    expect(mockToast.success).toHaveBeenCalledWith("Copied to clipboard");
  });

  it("resets copied state after timeout", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard("Test");
    });

    expect(result.current.copied).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it("shows error toast on clipboard failure", async () => {
    mockWriteText.mockRejectedValueOnce(new Error("Clipboard error"));
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard("Test");
    });

    expect(mockToast.error).toHaveBeenCalledWith("Failed to copy to clipboard");
    expect(result.current.copied).toBe(false);
  });
});
