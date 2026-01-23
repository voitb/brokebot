import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSpeechToText } from "./use-speech-to-text";
import { setupMediaMocks } from "@/testing/mocks/modules";

const mockTranscribe = vi.fn();

vi.mock("@/features/chat/lib/transcriber/transcribe", () => ({
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

  describe("initialization", () => {
    it("starts in ready status", () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));
      expect(result.current.status).toBe("ready");
    });

    it("isModelLoading is false (lazy loading)", () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));
      expect(result.current.isModelLoading).toBe(false);
    });
  });

  describe("startRecording", () => {
    it("requests microphone access", async () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await act(async () => {
        await result.current.startRecording();
      });

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    it("sets status to recording", async () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.status).toBe("recording");
    });

    it("sets error if microphone access denied", async () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Permission denied")
      );

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.error).toBe("Could not access microphone. Please check permissions.");
      expect(result.current.status).toBe("error");
    });
  });

  describe("stopRecording", () => {
    it("stops media recorder if recording", async () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.status).toBe("recording");

      await act(async () => {
        result.current.stopRecording();
      });

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });
    });

    it("does nothing if not recording", async () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      act(() => {
        result.current.stopRecording();
      });

      expect(result.current.status).toBe("ready");
    });
  });

  describe("transcription", () => {
    it("calls onTranscriptReceived with transcribed text", async () => {
      mockTranscribe.mockResolvedValue({ text: "Hello world" });

      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await act(async () => {
        await result.current.startRecording();
      });

      await act(async () => {
        result.current.stopRecording();
      });

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

      expect(mockOnTranscriptReceived).toHaveBeenCalledWith("Hello world");
    });

    it("trims transcript before sending", async () => {
      mockTranscribe.mockResolvedValue({ text: "  trimmed text  " });

      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await act(async () => {
        await result.current.startRecording();
      });

      await act(async () => {
        result.current.stopRecording();
      });

      await waitFor(() => {
        expect(mockOnTranscriptReceived).toHaveBeenCalledWith("trimmed text");
      });
    });

    it("does not call callback for empty transcript", async () => {
      mockTranscribe.mockResolvedValue({ text: "" });

      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await act(async () => {
        await result.current.startRecording();
      });

      await act(async () => {
        result.current.stopRecording();
      });

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

      expect(mockOnTranscriptReceived).not.toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("stops recording on unmount", async () => {
      const mockStop = vi.fn();
      const mockStream = {
        getTracks: () => [{ stop: mockStop }],
      };
      (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockStream
      );

      const { result, unmount } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await act(async () => {
        await result.current.startRecording();
      });

      unmount();

      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe("transcription errors", () => {
    it("handles transcription API failure", async () => {
      mockTranscribe.mockRejectedValue(new Error("Transcription failed"));

      const mockStop = vi.fn();
      const mockStream = {
        getTracks: () => [{ stop: mockStop }],
      };
      (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockStream
      );

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
});
