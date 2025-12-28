import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCopyToClipboard } from "./useCopyToClipboard";
import { mockToast } from "@/test/mocks/modules";

describe("useCopyToClipboard", () => {
  const mockWriteText = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });
    mockWriteText.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("copies text to clipboard successfully", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard("Test text");
    });

    expect(mockWriteText).toHaveBeenCalledWith("Test text");
  });

  it("sets copied state to true on success", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.copied).toBe(false);

    await act(async () => {
      await result.current.copyToClipboard("Test");
    });

    expect(result.current.copied).toBe(true);
  });

  it("shows success toast on copy", async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard("Test");
    });

    expect(mockToast.success).toHaveBeenCalledWith("Copied to clipboard");
  });

  it("resets copied state after 2 seconds", async () => {
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

  it("shows error toast on failure", async () => {
    mockWriteText.mockRejectedValueOnce(new Error("Clipboard error"));
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard("Test");
    });

    expect(mockToast.error).toHaveBeenCalledWith("Failed to copy to clipboard");
  });

  it("does not set copied state on failure", async () => {
    mockWriteText.mockRejectedValueOnce(new Error("Clipboard error"));
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard("Test");
    });

    expect(result.current.copied).toBe(false);
  });
});
