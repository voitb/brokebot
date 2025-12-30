import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatInputForm } from "./use-chat-input-form";
import { mockToast } from "@/test/mocks/modules";

// Mock external dependencies
vi.mock("@/app/providers/model-provider", async () => {
  const { createMinimalModelProvider } = await import("@/test/mocks/providers");
  return createMinimalModelProvider();
});

vi.mock("./use-drag-drop", async () => {
  const { createMockDragDropHook } = await import("@/test/mocks/hooks");
  return { useDragDrop: vi.fn(() => createMockDragDropHook()) };
});

vi.mock("./use-file-upload", async () => {
  const { createMockFileUploadHook } = await import("@/test/mocks/hooks");
  return { useFileUpload: vi.fn(() => createMockFileUploadHook()) };
});

vi.mock("./use-speech-to-text", async () => {
  const { createMockSpeechToTextHook } = await import("@/test/mocks/hooks");
  return {
    useSpeechToText: vi.fn(() => createMockSpeechToTextHook()),
  };
});

// Import mocked hooks for manipulation in tests
import { useModel } from "@/app/providers/model-provider";
import { useSpeechToText } from "./use-speech-to-text";
import { useFileUpload } from "./use-file-upload";

const defaultProps = {
  message: "",
  setMessage: vi.fn(),
  onSend: vi.fn().mockResolvedValue(undefined),
  isLoading: false,
};

describe("useChatInputForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("derived state", () => {
    it("computes isModelError correctly from modelStatus", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Error: Something went wrong",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.isModelError).toBe(true);
    });

    it("computes isModelReady when model exists and not loading", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.isModelReady).toBe(true);
    });

    it("computes isModelReady as false when loading", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: true,
        modelStatus: "Loading...",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.isModelReady).toBe(false);
    });

    it("computes isSubmitDisabled when message is empty and no files", () => {
      const { result } = renderHook(() =>
        useChatInputForm({ ...defaultProps, message: "" })
      );

      expect(result.current.isSubmitDisabled).toBe(true);
    });

    it("computes isSubmitDisabled as false when message has content", () => {
      const { result } = renderHook(() =>
        useChatInputForm({ ...defaultProps, message: "Hello" })
      );

      expect(result.current.isSubmitDisabled).toBe(false);
    });

    it("computes placeholderText based on model readiness", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.placeholderText).toContain("Test Model");
    });

    it("computes placeholderText with status when not ready", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: null,
        isModelLoading: true,
        modelStatus: "Loading model...",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.placeholderText).toBe("Loading model...");
    });
  });

  describe("mic toggle", () => {
    it("starts recording when not recording", () => {
      const mockStartRecording = vi.fn();
      vi.mocked(useSpeechToText).mockReturnValue({
        status: "ready",
        startRecording: mockStartRecording,
        stopRecording: vi.fn(),
        isModelLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      act(() => {
        result.current.handleMicToggle();
      });

      expect(mockStartRecording).toHaveBeenCalled();
    });

    it("stops recording when already recording", () => {
      const mockStopRecording = vi.fn();
      vi.mocked(useSpeechToText).mockReturnValue({
        status: "recording",
        startRecording: vi.fn(),
        stopRecording: mockStopRecording,
        isModelLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      act(() => {
        result.current.handleMicToggle();
      });

      expect(mockStopRecording).toHaveBeenCalled();
    });
  });

  describe("STT toast orchestration", () => {
    it("shows loading toast when status is loading", () => {
      vi.mocked(useSpeechToText).mockReturnValue({
        status: "loading",
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        isModelLoading: false,
        error: null,
      });

      renderHook(() => useChatInputForm(defaultProps));

      expect(mockToast.loading).toHaveBeenCalledWith("Loading speech model...", {
        id: "stt-toast",
      });
    });

    it("shows processing toast when status is processing", () => {
      vi.mocked(useSpeechToText).mockReturnValue({
        status: "processing",
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        isModelLoading: false,
        error: null,
      });

      renderHook(() => useChatInputForm(defaultProps));

      expect(mockToast.loading).toHaveBeenCalledWith("Transcribing audio...", {
        id: "stt-toast",
      });
    });

    it("shows recording toast when status is recording", () => {
      vi.mocked(useSpeechToText).mockReturnValue({
        status: "recording",
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        isModelLoading: false,
        error: null,
      });

      renderHook(() => useChatInputForm(defaultProps));

      expect(mockToast.message).toHaveBeenCalledWith("Recording...", {
        description: "Click the mic icon to stop.",
        id: "stt-toast",
      });
    });

    it("dismisses toast when status is ready", () => {
      vi.mocked(useSpeechToText).mockReturnValue({
        status: "ready",
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        isModelLoading: false,
        error: null,
      });

      renderHook(() => useChatInputForm(defaultProps));

      expect(mockToast.dismiss).toHaveBeenCalledWith("stt-toast");
    });

    it("shows error toast when transcriberError is set", () => {
      vi.mocked(useSpeechToText).mockReturnValue({
        status: "error",
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        isModelLoading: false,
        error: "Microphone access denied",
      });

      renderHook(() => useChatInputForm(defaultProps));

      expect(mockToast.error).toHaveBeenCalledWith("Microphone access denied", {
        id: "stt-toast",
      });
    });
  });

  describe("keyboard shortcuts", () => {
    it("toggles mic on Alt+M keypress", async () => {
      const mockStartRecording = vi.fn();
      vi.mocked(useSpeechToText).mockReturnValue({
        status: "ready",
        startRecording: mockStartRecording,
        stopRecording: vi.fn(),
        isModelLoading: false,
        error: null,
      });

      renderHook(() => useChatInputForm(defaultProps));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "m",
          altKey: true,
        });
        window.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(mockStartRecording).toHaveBeenCalled();
      });
    });

    it("does not toggle mic for other key combinations", () => {
      const mockStartRecording = vi.fn();
      vi.mocked(useSpeechToText).mockReturnValue({
        status: "ready",
        startRecording: mockStartRecording,
        stopRecording: vi.fn(),
        isModelLoading: false,
        error: null,
      });

      renderHook(() => useChatInputForm(defaultProps));

      act(() => {
        // Regular 'm' without Alt
        const event = new KeyboardEvent("keydown", {
          key: "m",
          altKey: false,
        });
        window.dispatchEvent(event);
      });

      expect(mockStartRecording).not.toHaveBeenCalled();
    });

    it("submits on Enter key (without Shift)", async () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const mockOnSend = vi.fn().mockResolvedValue(undefined);
      const mockSetMessage = vi.fn();

      const { result } = renderHook(() =>
        useChatInputForm({
          ...defaultProps,
          message: "Hello",
          setMessage: mockSetMessage,
          onSend: mockOnSend,
        })
      );

      await act(async () => {
        const mockEvent = {
          key: "Enter",
          shiftKey: false,
          preventDefault: vi.fn(),
        } as unknown as React.KeyboardEvent;
        result.current.handleKeyDown(mockEvent);
      });

      await waitFor(() => {
        expect(mockOnSend).toHaveBeenCalledWith("Hello");
      });
    });

    it("does not submit on Shift+Enter (allows newline)", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const mockOnSend = vi.fn();
      const mockPreventDefault = vi.fn();

      const { result } = renderHook(() =>
        useChatInputForm({
          ...defaultProps,
          message: "Hello",
          onSend: mockOnSend,
        })
      );

      act(() => {
        const mockEvent = {
          key: "Enter",
          shiftKey: true,
          preventDefault: mockPreventDefault,
        } as unknown as React.KeyboardEvent;
        result.current.handleKeyDown(mockEvent);
      });

      expect(mockPreventDefault).not.toHaveBeenCalled();
      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  describe("form submission", () => {
    it("prevents submission when message is empty and no files", async () => {
      const mockOnSend = vi.fn();
      const { result } = renderHook(() =>
        useChatInputForm({ ...defaultProps, message: "", onSend: mockOnSend })
      );

      await act(async () => {
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it("prevents submission when model is not ready", async () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: null,
        isModelLoading: true,
        modelStatus: "Loading...",
      } as ReturnType<typeof useModel>);

      const mockOnSend = vi.fn();
      const { result } = renderHook(() =>
        useChatInputForm({ ...defaultProps, message: "Hello", onSend: mockOnSend })
      );

      await act(async () => {
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockOnSend).not.toHaveBeenCalled();
      expect(mockToast.error).toHaveBeenCalledWith(
        "Model is not ready. Please wait or try reloading."
      );
    });

    it("calls onSend with message on successful submission", async () => {
      // Ensure model is ready
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const mockOnSend = vi.fn().mockResolvedValue(undefined);
      const mockSetMessage = vi.fn();

      const { result } = renderHook(() =>
        useChatInputForm({
          ...defaultProps,
          message: "Hello world",
          setMessage: mockSetMessage,
          onSend: mockOnSend,
        })
      );

      await act(async () => {
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockOnSend).toHaveBeenCalledWith("Hello world");
      expect(mockSetMessage).toHaveBeenCalledWith("");
    });

    it("restores message on submission error", async () => {
      // Ensure model is ready
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const mockOnSend = vi.fn().mockRejectedValue(new Error("Network error"));
      const mockSetMessage = vi.fn();

      const { result } = renderHook(() =>
        useChatInputForm({
          ...defaultProps,
          message: "Hello world",
          setMessage: mockSetMessage,
          onSend: mockOnSend,
        })
      );

      await act(async () => {
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
        await result.current.handleSubmit(mockEvent);
      });

      // First call clears, second call restores
      expect(mockSetMessage).toHaveBeenCalledWith("");
      expect(mockSetMessage).toHaveBeenCalledWith("Hello world");
      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to send message. Please try again."
      );
    });

    it("allows submission when files attached but no message", async () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const mockFile = { file: { name: "test.txt" }, content: "file content" };
      vi.mocked(useFileUpload).mockReturnValue({
        attachedFiles: [mockFile] as unknown as ReturnType<typeof useFileUpload>["attachedFiles"],
        handleFilesSelected: vi.fn(),
        removeFile: vi.fn(),
        clearFiles: vi.fn(),
        replaceFiles: vi.fn(),
        processFile: vi.fn(),
      });

      const mockOnSend = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useChatInputForm({
          ...defaultProps,
          message: "", // Empty message
          onSend: mockOnSend,
        })
      );

      await act(async () => {
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockOnSend).toHaveBeenCalled();
    });

    it("clears files after successful submission", async () => {
      // Ensure model is ready
      vi.mocked(useModel).mockReturnValue({
        currentModel: { name: "Test Model", type: "online" },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const mockClearFiles = vi.fn();
      vi.mocked(useFileUpload).mockReturnValue({
        attachedFiles: [],
        handleFilesSelected: vi.fn(),
        removeFile: vi.fn(),
        clearFiles: mockClearFiles,
        replaceFiles: vi.fn(),
        processFile: vi.fn(),
      });

      const mockOnSend = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useChatInputForm({
          ...defaultProps,
          message: "Hello",
          onSend: mockOnSend,
        })
      );

      await act(async () => {
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockClearFiles).toHaveBeenCalled();
    });
  });

  describe("model display info", () => {
    it("returns correct info for online model", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: {
          name: "GPT-4",
          type: "online",
          onlineModel: { category: "chat" },
        },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.modelDisplayInfo).toEqual({
        name: "GPT-4",
        modelType: "Online",
        supportsImages: false,
        specialization: "chat",
      });
    });

    it("returns correct info for local model", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: {
          name: "Llama",
          type: "local",
          localModel: { specialization: "general" },
        },
        isModelLoading: false,
        modelStatus: "Ready",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.modelDisplayInfo).toEqual({
        name: "Llama",
        modelType: "Local",
        supportsImages: false,
        specialization: "general",
      });
    });

    it("returns initializing info when no model", () => {
      vi.mocked(useModel).mockReturnValue({
        currentModel: null,
        isModelLoading: true,
        modelStatus: "Loading...",
      } as ReturnType<typeof useModel>);

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.modelDisplayInfo).toEqual({
        name: "Initializing...",
        modelType: "None",
        supportsImages: false,
      });
    });
  });
});
