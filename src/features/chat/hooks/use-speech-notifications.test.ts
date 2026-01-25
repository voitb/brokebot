import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSpeechNotifications } from "./use-speech-notifications";
import type { TranscriberStatus } from "./use-speech-to-text";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    loading: vi.fn(),
    message: vi.fn(),
    dismiss: vi.fn(),
  },
}));

const mockToast = vi.mocked(toast);

describe("useSpeechNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each<[TranscriberStatus, keyof typeof toast, string]>([
    ["loading", "loading", "Loading speech model..."],
    ["processing", "loading", "Transcribing audio..."],
    ["recording", "message", "Recording..."],
  ])("shows %s notification for %s status", (status, toastMethod, message) => {
    renderHook(() => useSpeechNotifications(status, null));

    expect(mockToast[toastMethod]).toHaveBeenCalledWith(
      message,
      expect.objectContaining({ id: "stt-toast" })
    );
  });

  it.each<TranscriberStatus>(["ready", "uninitialized", "error"])(
    "dismisses toast for %s status",
    (status) => {
      renderHook(() => useSpeechNotifications(status, null));

      expect(mockToast.dismiss).toHaveBeenCalledWith("stt-toast");
    }
  );

  it("shows error toast when error message is provided", () => {
    renderHook(() =>
      useSpeechNotifications("recording", "Microphone access denied")
    );

    expect(mockToast.error).toHaveBeenCalledWith("Microphone access denied", {
      id: "stt-toast",
    });
    expect(mockToast.message).not.toHaveBeenCalled();
  });
});
