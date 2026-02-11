import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSpeechToText } from "./use-speech-to-text";
import { setupMediaMocks } from "@/testing/mocks/modules";

const mockTranscribe = vi.fn();

vi.mock("@/features/chat/api/transcriber/transcribe", () => ({
  transcribe: (...args: unknown[]) => mockTranscribe(...args),
}));

describe("useSpeechToText", () => {
  const mockOnTranscriptReceived = vi.fn();
  let cleanupMediaMocks: () => void;

  beforeEach(() => {
    vi.clearAllMocks();
    cleanupMediaMocks = setupMediaMocks();
    mockTranscribe.mockResolvedValue({ text: "Transcribed text" });
  });

  afterEach(() => {
    cleanupMediaMocks();
  });

  it("records audio and delivers transcript", async () => {
    mockTranscribe.mockResolvedValue({ text: "Hello world" });
    const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(result.current.status).toBe("recording");

    await act(async () => {
      result.current.stopRecording();
    });

    await waitFor(() => {
      expect(mockOnTranscriptReceived).toHaveBeenCalledWith("Hello world");
      expect(result.current.status).toBe("ready");
    });
  });

  it("sets error when microphone access denied", async () => {
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Permission denied")
    );
    const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.error).toBe("Could not access microphone. Please check permissions.");
    expect(result.current.status).toBe("error");
  });

  it("handles transcription failure gracefully", async () => {
    mockTranscribe.mockRejectedValue(new Error("Transcription failed"));
    const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

    await act(async () => {
      await result.current.startRecording();
    });

    await act(async () => {
      result.current.stopRecording();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("An error occurred during transcription.");
      expect(result.current.status).toBe("ready");
    });

    expect(mockOnTranscriptReceived).not.toHaveBeenCalled();
  });
});
