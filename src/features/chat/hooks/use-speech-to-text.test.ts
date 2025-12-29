import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSpeechToText } from "./use-speech-to-text";
import { setupMediaMocks } from "@/test/mocks/modules";

const mockGetTranscriber = vi.fn();

vi.mock("@/features/chat/lib/transcriber", () => ({
  getTranscriber: () => mockGetTranscriber(),
}));

describe("useSpeechToText", () => {
  const mockOnTranscriptReceived = vi.fn();
  let cleanupMediaMocks: () => void;

  beforeEach(() => {
    vi.clearAllMocks();
    cleanupMediaMocks = setupMediaMocks();

    // Default: transcriber loads successfully
    mockGetTranscriber.mockResolvedValue(
      vi.fn().mockResolvedValue({ text: "Transcribed text" })
    );
  });

  afterEach(() => {
    cleanupMediaMocks();
  });

  describe("initialization", () => {
    it("transitions to loading status on mount", () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));
      expect(result.current.status).toBe("loading");
    });

    it("loads transcriber on mount", async () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

      expect(mockGetTranscriber).toHaveBeenCalled();
    });

    it("sets error status if transcriber fails to load", async () => {
      mockGetTranscriber.mockRejectedValue(new Error("Failed to load"));

      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await waitFor(() => {
        expect(result.current.status).toBe("error");
      });

      expect(result.current.error).toBe("Failed to load speech recognition model.");
    });

    it("shows isModelLoading during loading", async () => {
      let resolveTranscriber: (value: unknown) => void;
      mockGetTranscriber.mockReturnValue(
        new Promise((resolve) => {
          resolveTranscriber = resolve;
        })
      );

      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await waitFor(() => {
        expect(result.current.isModelLoading).toBe(true);
      });

      await act(async () => {
        resolveTranscriber!(vi.fn());
      });

      await waitFor(() => {
        expect(result.current.isModelLoading).toBe(false);
      });
    });
  });

  describe("startRecording", () => {
    it("requests microphone access", async () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

      await act(async () => {
        await result.current.startRecording();
      });

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    });

    it("sets status to recording", async () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.status).toBe("recording");
    });

    it("does nothing if not ready", async () => {
      mockGetTranscriber.mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await act(async () => {
        await result.current.startRecording();
      });

      expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
      expect(result.current.error).toBe("Model is still loading, please wait.");
    });

    it("sets error if microphone access denied", async () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

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

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.status).toBe("recording");

      await act(async () => {
        result.current.stopRecording();
      });

      // After stopping, should process and return to ready
      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });
    });

    it("does nothing if not recording", async () => {
      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

      // Should not throw
      act(() => {
        result.current.stopRecording();
      });

      expect(result.current.status).toBe("ready");
    });
  });

  describe("transcription", () => {
    it("calls onTranscriptReceived with transcribed text", async () => {
      const mockRecognizer = vi.fn().mockResolvedValue({ text: "Hello world" });
      mockGetTranscriber.mockResolvedValue(mockRecognizer);

      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

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
      const mockRecognizer = vi.fn().mockResolvedValue({ text: "  trimmed text  " });
      mockGetTranscriber.mockResolvedValue(mockRecognizer);

      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

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
      const mockRecognizer = vi.fn().mockResolvedValue({ text: "" });
      mockGetTranscriber.mockResolvedValue(mockRecognizer);

      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

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

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

      await act(async () => {
        await result.current.startRecording();
      });

      unmount();

      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe("transcription errors", () => {
    it("handles transcription API failure", async () => {
      const mockRecognizer = vi.fn().mockRejectedValue(new Error("Transcription failed"));
      mockGetTranscriber.mockResolvedValue(mockRecognizer);

      const mockStop = vi.fn();
      const mockStream = {
        getTracks: () => [{ stop: mockStop }],
      };
      (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockStream
      );

      const { result } = renderHook(() => useSpeechToText(mockOnTranscriptReceived));

      await waitFor(() => {
        expect(result.current.status).toBe("ready");
      });

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

  // Toast notifications are now handled by ChatInput component, not the hook
});
