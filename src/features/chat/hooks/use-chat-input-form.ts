import {
  useRef,
  useEffect,
  useEffectEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { toast } from "sonner";
import { useModel } from "@/app/providers/model-provider";
import { useDragDrop } from "./use-drag-drop";
import { useFileUpload, type AttachedFile } from "./use-file-upload";
import { useSpeechToText, type TranscriberStatus } from "./use-speech-to-text";
import { buildMessageWithFiles } from "@/features/chat/utils/chat-input-utils";

const STT_TOAST_ID = "stt-toast";

// Props interface
export interface UseChatInputFormProps {
  message: string;
  setMessage: (message: string) => void;
  onSend: (message?: string) => Promise<void>;
  isLoading: boolean;
}

// Model display info for ModelStatus component
export interface ModelDisplayInfo {
  name: string;
  modelType: "Online" | "Local" | "None";
  supportsImages: boolean;
  specialization?: string;
}

// Return interface
export interface UseChatInputFormReturn {
  // Model state
  currentModelName: string | undefined;
  isModelReady: boolean;
  isModelError: boolean;
  isModelLoading: boolean;
  modelStatus: string;
  supportsImages: boolean;

  // File attachment
  attachedFiles: AttachedFile[];
  handleFilesSelected: (files: FileList) => Promise<void>;
  removeFile: (fileId: string) => void;
  replaceFiles: (files: AttachedFile[]) => void;

  // Drag & drop
  isDragOver: boolean;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragEnter: (e: React.DragEvent) => void;

  // Speech-to-text
  transcriberStatus: TranscriberStatus;
  handleMicToggle: () => void;

  // Form handlers
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleKeyDown: (e: ReactKeyboardEvent) => void;
  handleRetryModel: () => Promise<void>;

  // Computed state
  isSubmitDisabled: boolean;
  isInputDisabled: boolean;
  placeholderText: string;

  // Refs
  textareaRef: RefObject<HTMLTextAreaElement | null>;

  // Model display info
  modelDisplayInfo: ModelDisplayInfo;
}

export function useChatInputForm({
  message,
  setMessage,
  onSend,
  isLoading,
}: UseChatInputFormProps): UseChatInputFormReturn {
  // External hooks
  const { currentModel, isModelLoading, modelStatus } = useModel();
  const {
    isDragOver,
    handleDrop: onDrop,
    handleDragOver,
    handleDragLeave,
    handleDragEnter,
  } = useDragDrop();

  // For now, assume models don't support images unless we implement VLM support
  const supportsImages = false;

  const {
    attachedFiles,
    handleFilesSelected,
    removeFile,
    clearFiles,
    replaceFiles,
  } = useFileUpload({
    supportsImages,
    selectedModelName: currentModel?.name || "Model",
  });

  // Callback for transcript received - appends to message
  const handleTranscriptReceived = (transcript: string) => {
    setMessage(message ? `${message} ${transcript}` : transcript);
  };

  const {
    status: transcriberStatus,
    startRecording,
    stopRecording,
    isModelLoading: isWhisperModelLoading,
    error: transcriberError,
  } = useSpeechToText(handleTranscriptReceived);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Derived state
  const isModelError = modelStatus.toLowerCase().includes("error");
  const isModelReady = !!currentModel && !isModelLoading;
  const isSubmitDisabled =
    (!message.trim() && attachedFiles.length === 0) ||
    isLoading ||
    isModelError ||
    isWhisperModelLoading;
  const isInputDisabled =
    isLoading || isModelLoading || isModelError || isWhisperModelLoading;

  const placeholderText =
    isModelReady && currentModel
      ? `Message ${currentModel.name}... or click the mic to talk`
      : modelStatus;

  // Model display info for ModelStatus component
  const modelDisplayInfo: ModelDisplayInfo = currentModel
    ? {
        name: currentModel.name,
        modelType: currentModel.type === "online" ? "Online" : "Local",
        supportsImages: false,
        specialization:
          currentModel.localModel?.specialization ||
          currentModel.onlineModel?.category,
      }
    : {
        name: "Initializing...",
        modelType: "None",
        supportsImages: false,
      };

  // STT toast orchestration effect
  useEffect(() => {
    if (transcriberError) {
      toast.error(transcriberError, { id: STT_TOAST_ID });
      return;
    }

    switch (transcriberStatus) {
      case "loading":
        toast.loading("Loading speech model...", { id: STT_TOAST_ID });
        break;
      case "processing":
        toast.loading("Transcribing audio...", { id: STT_TOAST_ID });
        break;
      case "recording":
        toast.message("Recording...", {
          description: "Click the mic icon to stop.",
          id: STT_TOAST_ID,
        });
        break;
      case "ready":
      case "uninitialized":
      case "error":
        toast.dismiss(STT_TOAST_ID);
        break;
    }
  }, [transcriberStatus, transcriberError]);

  // Effect event for mic toggle - always reads latest values
  const onMicToggle = useEffectEvent(() => {
    if (transcriberStatus === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  });

  // Keyboard shortcut registration (Alt+M)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "m") {
        event.preventDefault();
        onMicToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handlers - delegate to useEffectEvent for consistent behavior
  const handleMicToggle = () => {
    onMicToggle();
  };

  const handleRetryModel = async () => {
    toast.info("Model retry is not yet implemented for unified models");
  };

  const submitMessage = async () => {
    if (!message.trim() && attachedFiles.length === 0) return;
    if (!isModelReady) {
      toast.error("Model is not ready. Please wait or try reloading.");
      return;
    }

    // Store the message content before clearing
    const messageToSend = message;
    const filesToSend = [...attachedFiles];

    // Clear input immediately for better UX
    setMessage("");
    clearFiles();

    const fullMessage = buildMessageWithFiles(messageToSend, filesToSend);

    try {
      await onSend(fullMessage);
    } catch {
      setMessage(messageToSend);
      replaceFiles(filesToSend);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitMessage();
  };

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  // Wrap handleDrop to pass handleFilesSelected
  const handleDrop = (e: React.DragEvent) => {
    onDrop(e, handleFilesSelected);
  };

  return {
    // Model state
    currentModelName: currentModel?.name,
    isModelReady,
    isModelError,
    isModelLoading,
    modelStatus,
    supportsImages,

    // File attachment
    attachedFiles,
    handleFilesSelected,
    removeFile,
    replaceFiles,

    // Drag & drop
    isDragOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleDragEnter,

    // Speech-to-text
    transcriberStatus,
    handleMicToggle,

    // Form handlers
    handleSubmit,
    handleKeyDown,
    handleRetryModel,

    // Computed state
    isSubmitDisabled,
    isInputDisabled,
    placeholderText,

    // Refs
    textareaRef,

    // Model display info
    modelDisplayInfo,
  };
}
