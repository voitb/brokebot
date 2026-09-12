import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { configure, renderHook, act, waitFor } from "@testing-library/react";
import { useSpeechToText } from "./use-speech-to-text";
import { MockMediaStream, mockToast, setupMediaMocks } from "@/testing/mocks/modules";
import type { transcribe } from "@/features/chat/api/transcriber/transcribe";
import type { TranscribeResult } from "@/features/chat/api/transcriber/types";

const mockTranscribe = vi.fn<typeof transcribe>();

vi.mock("@/features/chat/api/transcriber/transcribe", () => ({
  transcribe: (...args: Parameters<typeof transcribe>) => mockTranscribe(...args),
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
    configure({ reactStrictMode: false });
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

  it("tells the user the speech model is being downloaded on first use", async () => {
    mockTranscribe.mockImplementation(async (_audioBlob, _options, callbacks) => {
      callbacks?.onStatus?.("loading", "webgpu");
      callbacks?.onProgress?.({ status: "progress", progress: 42.4 });
      return { text: "Hello world" };
    });
    const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

    await act(async () => {
      await result.current.startRecording();
    });

    await act(async () => {
      result.current.stopRecording();
    });

    await waitFor(() => {
      expect(mockOnTranscriptReceived).toHaveBeenCalledWith("Hello world");
    });

    expect(mockToast.loading).toHaveBeenCalledWith(
      expect.stringContaining("onnx-community/whisper-base"),
      expect.objectContaining({ description: "This happens once." })
    );
    expect(mockToast.loading).toHaveBeenCalledWith(
      expect.stringContaining("Downloading the speech model"),
      expect.objectContaining({ description: "42%" })
    );
  });

  it("returns the toast to transcription once the model download finishes", async () => {
    mockTranscribe.mockImplementation(async (_audioBlob, _options, callbacks) => {
      callbacks?.onStatus?.("loading", "webgpu");
      callbacks?.onProgress?.({ status: "progress", progress: 100 });
      callbacks?.onStatus?.("transcribing", "webgpu");
      return { text: "Hello world" };
    });
    const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

    await act(async () => {
      await result.current.startRecording();
    });

    await act(async () => {
      result.current.stopRecording();
    });

    await waitFor(() => {
      expect(mockOnTranscriptReceived).toHaveBeenCalledWith("Hello world");
    });

    expect(mockToast.loading.mock.calls.at(-1)?.[0]).toBe("Transcribing audio...");
  });

  it("dismisses the loading toast when the hook unmounts mid-transcription", async () => {
    let resolveTranscription: (result: TranscribeResult) => void = () => {};
    mockTranscribe.mockImplementation(
      () =>
        new Promise<TranscribeResult>((resolve) => {
          resolveTranscription = resolve;
        })
    );
    const { result, unmount } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

    await act(async () => {
      await result.current.startRecording();
    });

    await act(async () => {
      result.current.stopRecording();
    });

    unmount();

    await act(async () => {
      resolveTranscription({ text: "Hello world" });
    });

    await waitFor(() => {
      expect(mockToast.dismiss).toHaveBeenCalledWith("stt-toast");
    });
    expect(mockToast.info).toHaveBeenCalledWith("Voice input discarded.");
    expect(mockOnTranscriptReceived).not.toHaveBeenCalled();
  });

  it("tells the user the recording was discarded when the hook unmounts mid-recording", async () => {
    const { result, unmount } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

    await act(async () => {
      await result.current.startRecording();
    });

    await act(async () => {
      unmount();
    });

    await waitFor(() => {
      expect(mockToast.info).toHaveBeenCalledWith(
        "Voice input discarded.",
        expect.objectContaining({ id: "stt-toast" })
      );
    });
    expect(mockTranscribe).not.toHaveBeenCalled();
  });

  it("still starts recording when effects are double-invoked in StrictMode", async () => {
    configure({ reactStrictMode: true });
    const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.status).toBe("recording");
  });

  it("ignores a second startRecording while getUserMedia is pending", async () => {
    let resolveStream: (stream: MediaStream) => void = () => {};
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise<MediaStream>((resolve) => {
          resolveStream = resolve;
        })
    );
    const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

    await act(async () => {
      result.current.startRecording();
      result.current.startRecording();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveStream(new MockMediaStream() as unknown as MediaStream);
    });

    expect(result.current.status).toBe("recording");
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it("retries after a failed microphone request", async () => {
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>;
    getUserMedia.mockRejectedValue(new Error("Permission denied"));
    const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.status).toBe("error");

    getUserMedia.mockResolvedValue(new MockMediaStream());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.status).toBe("recording");
  });
});
