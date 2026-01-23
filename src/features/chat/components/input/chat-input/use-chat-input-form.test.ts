import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatInputForm } from "./use-chat-input-form";
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

vi.mock("@/features/chat/hooks/use-model-display-info", () => ({
  useModelDisplayInfo: vi.fn(() => ({
    currentModelName: "Test Model",
    isModelReady: true,
    isModelError: false,
    isModelLoading: false,
    modelStatus: "Ready",
    modelDisplayInfo: {
      name: "Test Model",
      modelType: "Online",
      supportsImages: false,
    },
  })),
}));

vi.mock("@/features/chat/hooks/use-speech-notifications", () => ({
  useSpeechNotifications: vi.fn(),
}));

vi.mock("./use-input-keyboard-shortcuts", () => ({
  useInputKeyboardShortcuts: vi.fn(),
}));

vi.mock("@/features/chat/hooks/use-drag-drop", async () => {
  const { createMockDragDropHook } = await import("@/testing/mocks/hooks");
  return { useDragDrop: vi.fn(() => createMockDragDropHook()) };
});

vi.mock("@/features/chat/hooks/use-file-upload", async () => {
  const { createMockFileUploadHook } = await import("@/testing/mocks/hooks");
  return { useFileUpload: vi.fn(() => createMockFileUploadHook()) };
});

vi.mock("@/features/chat/hooks/use-speech-to-text", async () => {
  const { createMockSpeechToTextHook } = await import("@/testing/mocks/hooks");
  return {
    useSpeechToText: vi.fn(() => createMockSpeechToTextHook()),
  };
});

import { useModelDisplayInfo } from "@/features/chat/hooks/use-model-display-info";
import { useSpeechToText } from "@/features/chat/hooks/use-speech-to-text";
import { useFileUpload } from "@/features/chat/hooks/use-file-upload";
import { useSpeechNotifications } from "@/features/chat/hooks/use-speech-notifications";
import { useInputKeyboardShortcuts } from "./use-input-keyboard-shortcuts";

const defaultProps = {
  message: "",
  setMessage: vi.fn(),
  onSend: vi.fn().mockResolvedValue(undefined),
  isLoading: false,
};

describe("useChatInputForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModelDisplayInfo).mockReturnValue({
      currentModelName: "Test Model",
      isModelReady: true,
      isModelError: false,
      isModelLoading: false,
      modelStatus: "Ready",
      modelDisplayInfo: {
        name: "Test Model",
        modelType: "Online",
        supportsImages: false,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("derived state", () => {
    it("passes model display info through from useModelDisplayInfo", () => {
      vi.mocked(useModelDisplayInfo).mockReturnValue({
        currentModelName: "GPT-4",
        isModelReady: true,
        isModelError: false,
        isModelLoading: false,
        modelStatus: "Ready",
        modelDisplayInfo: {
          name: "GPT-4",
          modelType: "Online",
          supportsImages: false,
          specialization: "chat",
        },
      });

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.currentModelName).toBe("GPT-4");
      expect(result.current.isModelReady).toBe(true);
      expect(result.current.modelDisplayInfo.name).toBe("GPT-4");
    });

    it("computes isModelError from useModelDisplayInfo", () => {
      vi.mocked(useModelDisplayInfo).mockReturnValue({
        currentModelName: "Test Model",
        isModelReady: false,
        isModelError: true,
        isModelLoading: false,
        modelStatus: "Error: Something went wrong",
        modelDisplayInfo: {
          name: "Test Model",
          modelType: "Online",
          supportsImages: false,
        },
      });

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.isModelError).toBe(true);
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
      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.placeholderText).toContain("Test Model");
    });

    it("computes placeholderText with status when not ready", () => {
      vi.mocked(useModelDisplayInfo).mockReturnValue({
        currentModelName: undefined,
        isModelReady: false,
        isModelError: false,
        isModelLoading: true,
        modelStatus: "Loading model...",
        modelDisplayInfo: {
          name: "Initializing...",
          modelType: "None",
          supportsImages: false,
        },
      });

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.placeholderText).toBe("Loading model...");
    });
  });

  describe("hook composition", () => {
    it("calls useSpeechNotifications with transcriber state", () => {
      vi.mocked(useSpeechToText).mockReturnValue({
        status: "recording",
        startRecording: vi.fn(),
        stopRecording: vi.fn(),
        isModelLoading: false,
        error: "test error",
      });

      renderHook(() => useChatInputForm(defaultProps));

      expect(useSpeechNotifications).toHaveBeenCalledWith("recording", "test error");
    });

    it("calls useInputKeyboardShortcuts", () => {
      renderHook(() => useChatInputForm(defaultProps));

      expect(useInputKeyboardShortcuts).toHaveBeenCalled();
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

  describe("keyboard shortcuts", () => {
    it("submits on Enter key (without Shift)", async () => {
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
      vi.mocked(useModelDisplayInfo).mockReturnValue({
        currentModelName: undefined,
        isModelReady: false,
        isModelError: false,
        isModelLoading: true,
        modelStatus: "Loading...",
        modelDisplayInfo: {
          name: "Initializing...",
          modelType: "None",
          supportsImages: false,
        },
      });

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

      expect(mockSetMessage).toHaveBeenCalledWith("");
      expect(mockSetMessage).toHaveBeenCalledWith("Hello world");
      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to send message. Please try again."
      );
    });

    it("allows submission when files attached but no message", async () => {
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
          message: "",
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
      vi.mocked(useModelDisplayInfo).mockReturnValue({
        currentModelName: "GPT-4",
        isModelReady: true,
        isModelError: false,
        isModelLoading: false,
        modelStatus: "Ready",
        modelDisplayInfo: {
          name: "GPT-4",
          modelType: "Online",
          supportsImages: false,
          specialization: "chat",
        },
      });

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.modelDisplayInfo).toEqual({
        name: "GPT-4",
        modelType: "Online",
        supportsImages: false,
        specialization: "chat",
      });
    });

    it("returns correct info for local model", () => {
      vi.mocked(useModelDisplayInfo).mockReturnValue({
        currentModelName: "Llama",
        isModelReady: true,
        isModelError: false,
        isModelLoading: false,
        modelStatus: "Ready",
        modelDisplayInfo: {
          name: "Llama",
          modelType: "Local",
          supportsImages: false,
          specialization: "general",
        },
      });

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.modelDisplayInfo).toEqual({
        name: "Llama",
        modelType: "Local",
        supportsImages: false,
        specialization: "general",
      });
    });

    it("returns initializing info when no model", () => {
      vi.mocked(useModelDisplayInfo).mockReturnValue({
        currentModelName: undefined,
        isModelReady: false,
        isModelError: false,
        isModelLoading: true,
        modelStatus: "Loading...",
        modelDisplayInfo: {
          name: "Initializing...",
          modelType: "None",
          supportsImages: false,
        },
      });

      const { result } = renderHook(() => useChatInputForm(defaultProps));

      expect(result.current.modelDisplayInfo).toEqual({
        name: "Initializing...",
        modelType: "None",
        supportsImages: false,
      });
    });
  });
});
