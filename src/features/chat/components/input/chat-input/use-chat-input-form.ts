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
import { useDragDrop } from "@/features/chat/hooks/use-drag-drop";
import { useFileUpload, type AttachedFile } from "@/features/chat/hooks/use-file-upload";
import { useSpeechToText, type TranscriberStatus } from "@/features/chat/hooks/use-speech-to-text";
import { buildMessageWithFiles } from "@/features/chat/utils/chat-input-utils";

export interface ModelDisplayInfo {
  name: string;
  modelType: "Online" | "Local" | "None";
  supportsImages: boolean;
  specialization?: string;
}

export interface UseChatInputFormProps {
  message: string;
  setMessage: (message: string) => void;
  onSend: (message?: string) => Promise<void>;
  isLoading: boolean;
}

export interface UseChatInputFormReturn {
  isModelReady: boolean;
  isModelError: boolean;
  isModelLoading: boolean;
  modelStatus: string;
  supportsImages: boolean;

  attachedFiles: AttachedFile[];
  removeFile: (fileId: string) => void;
  replaceFiles: (files: AttachedFile[]) => void;

  isDragOver: boolean;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragEnter: (e: React.DragEvent) => void;

  transcriberStatus: TranscriberStatus;
  handleMicToggle: () => void;

  handleSubmit: (e: FormEvent) => Promise<void>;
  handleKeyDown: (e: ReactKeyboardEvent) => void;

  isSubmitDisabled: boolean;
  isInputDisabled: boolean;
  placeholderText: string;

  textareaRef: RefObject<HTMLTextAreaElement | null>;

  modelDisplayInfo: ModelDisplayInfo;
}

export function useChatInputForm({
  message,
  setMessage,
  onSend,
  isLoading,
}: UseChatInputFormProps): UseChatInputFormReturn {
  const { currentModel, isModelLoading, modelStatus } = useModel();

  const isModelError = modelStatus.toLowerCase().includes("error");
  const isModelReady = !!currentModel && !isModelLoading;

  const modelDisplayInfo: ModelDisplayInfo = currentModel
    ? currentModel.type === "local"
      ? {
          name: currentModel.localModel.name,
          modelType: "Local",
          supportsImages: currentModel.localModel.supportsImages ?? false,
          specialization: currentModel.localModel.specialization,
        }
      : {
          name: currentModel.onlineModel.name,
          modelType: "Online",
          supportsImages: false,
          specialization: currentModel.onlineModel.category,
        }
    : {
        name: "Initializing...",
        modelType: "None",
        supportsImages: false,
      };

  const currentModelName = modelDisplayInfo.name;

  const {
    isDragOver,
    handleDrop: onDrop,
    handleDragOver,
    handleDragLeave,
    handleDragEnter,
  } = useDragDrop();

  const supportsImages = modelDisplayInfo.supportsImages;

  const {
    attachedFiles,
    handleFilesSelected,
    removeFile,
    clearFiles,
    replaceFiles,
  } = useFileUpload({
    supportsImages,
    selectedModelName: currentModelName || "Model",
  });

  const handleTranscriptReceived = (transcript: string) => {
    setMessage(message ? `${message} ${transcript}` : transcript);
  };

  const {
    status: transcriberStatus,
    startRecording,
    stopRecording,
  } = useSpeechToText(handleTranscriptReceived);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isSubmitDisabled =
    (!message.trim() && attachedFiles.length === 0) ||
    isLoading ||
    isModelError;
  const isInputDisabled =
    isLoading || isModelLoading || isModelError;

  const placeholderText =
    isModelReady && currentModelName
      ? `Message ${currentModelName}... or click the mic to talk`
      : modelStatus;

  const onMicToggle = useEffectEvent(() => {
    if (transcriberStatus === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "m") {
        event.preventDefault();
        onMicToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onMicToggle]);

  const submitMessage = async () => {
    if (!message.trim() && attachedFiles.length === 0) return;
    if (!isModelReady) {
      toast.error("Model is not ready. Please wait or try reloading.");
      return;
    }

    const messageToSend = message;
    const filesToSend = [...attachedFiles];

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

  const handleDrop = (e: React.DragEvent) => {
    onDrop(e, handleFilesSelected);
  };

  return {
    isModelReady,
    isModelError,
    isModelLoading,
    modelStatus,
    supportsImages,
    attachedFiles,
    removeFile,
    replaceFiles,
    isDragOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleDragEnter,
    transcriberStatus,
    handleMicToggle: onMicToggle,
    handleSubmit,
    handleKeyDown,
    isSubmitDisabled,
    isInputDisabled,
    placeholderText,
    textareaRef,
    modelDisplayInfo,
  };
}
