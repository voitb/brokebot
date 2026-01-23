import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSpeechNotifications } from "./use-speech-notifications";
import type { TranscriberStatus } from "./use-speech-to-text";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    message: vi.fn(),
    dismiss: vi.fn(),
    info: vi.fn(),
  },
}));

const mockToast = vi.mocked(toast);

describe("useSpeechNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading toast when status is loading", () => {
    renderHook(() => useSpeechNotifications("loading", null));

    expect(mockToast.loading).toHaveBeenCalledWith("Loading speech model...", {
      id: "stt-toast",
    });
  });

  it("shows processing toast when status is processing", () => {
    renderHook(() => useSpeechNotifications("processing", null));

    expect(mockToast.loading).toHaveBeenCalledWith("Transcribing audio...", {
      id: "stt-toast",
    });
  });

  it("shows recording toast when status is recording", () => {
    renderHook(() => useSpeechNotifications("recording", null));

    expect(mockToast.message).toHaveBeenCalledWith("Recording...", {
      description: "Click the mic icon to stop.",
      id: "stt-toast",
    });
  });

  it("dismisses toast when status is ready", () => {
    renderHook(() => useSpeechNotifications("ready", null));

    expect(mockToast.dismiss).toHaveBeenCalledWith("stt-toast");
  });

  it("dismisses toast when status is uninitialized", () => {
    renderHook(() => useSpeechNotifications("uninitialized", null));

    expect(mockToast.dismiss).toHaveBeenCalledWith("stt-toast");
  });

  it("dismisses toast when status is error (without error message)", () => {
    renderHook(() => useSpeechNotifications("error", null));

    expect(mockToast.dismiss).toHaveBeenCalledWith("stt-toast");
  });

  it("shows error toast when error message is provided", () => {
    renderHook(() =>
      useSpeechNotifications("error", "Microphone access denied")
    );

    expect(mockToast.error).toHaveBeenCalledWith("Microphone access denied", {
      id: "stt-toast",
    });
  });

  it("shows error toast regardless of status when error is present", () => {
    renderHook(() =>
      useSpeechNotifications("recording", "Something went wrong")
    );

    expect(mockToast.error).toHaveBeenCalledWith("Something went wrong", {
      id: "stt-toast",
    });
    expect(mockToast.message).not.toHaveBeenCalled();
  });

  it("updates toast when status changes", () => {
    const { rerender } = renderHook(
      ({ status, error }: { status: TranscriberStatus; error: string | null }) =>
        useSpeechNotifications(status, error),
      { initialProps: { status: "ready" as TranscriberStatus, error: null } }
    );

    expect(mockToast.dismiss).toHaveBeenCalledWith("stt-toast");
    vi.clearAllMocks();

    rerender({ status: "recording", error: null });

    expect(mockToast.message).toHaveBeenCalledWith("Recording...", {
      description: "Click the mic icon to stop.",
      id: "stt-toast",
    });
  });
});
