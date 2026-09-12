import {
  useRef,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { toast } from "sonner";
import { useModel, type UnifiedModel } from "@/hooks/use-model";
import { useConversationId } from "@/hooks/use-conversation-id";
import { useIsWaitingForSharedEngine } from "@/features/chat/hooks/active-generations";
import { useDragDrop } from "@/features/chat/hooks/use-drag-drop";
import { useFileUpload, type AttachedFile } from "@/features/chat/hooks/use-file-upload";
import { useSpeechToText, type TranscriberStatus } from "@/features/chat/hooks/use-speech-to-text";
import {
  buildMessageWithFiles,
  WAITING_FOR_SHARED_ENGINE,
} from "@/features/chat/utils/chat-input-utils";

export interface ModelDisplayInfo {
  name: string;
  supportsImages: boolean;
  specialization?: string;
}

function getModelDisplayInfo(model: UnifiedModel | null): ModelDisplayInfo {
  if (!model) {
    return { name: "Initializing...", supportsImages: false };
  }
  if (model.type === "local") {
    return {
      name: model.localModel.name,
      supportsImages: model.localModel.supportsImages ?? false,
      specialization: model.localModel.specialization,
    };
  }
  return {
    name: model.onlineModel.name,
    supportsImages: false,
    specialization: model.onlineModel.category,
  };
}

export interface UseChatInputFormProps {
  message: string;
  setMessage: (message: string) => void;
  onSend: (message?: string) => Promise<void>;
  isLoading: boolean;
  isGenerating: boolean;
}

export interface UseChatInputFormReturn {
  isModelReady: boolean;
  isModelError: boolean;
  isModelLoading: boolean;
  modelStatus: string;
  supportsImages: boolean;

  attachedFiles: AttachedFile[];
  removeFile: (fileId: string) => void;
  handleFilesSelected: (files: FileList) => Promise<AttachedFile[]>;

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
  isGenerating,
}: UseChatInputFormProps): UseChatInputFormReturn {
  const { currentModel, isModelLoading, modelStatus } = useModel();
  const conversationId = useConversationId();
  const isWaitingForSharedEngine = useIsWaitingForSharedEngine(
    conversationId,
    currentModel?.type === "local"
  );

  const isModelError = modelStatus.toLowerCase().includes("error");
  const isModelReady = !!currentModel && !isModelLoading;

  const modelDisplayInfo = getModelDisplayInfo(currentModel);

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
  } = useFileUpload({
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
    isLoading || isGenerating ||
    isModelError ||
    !isModelReady ||
    isWaitingForSharedEngine;
  const isInputDisabled =
    isLoading || isModelLoading || isModelError;

  const idlePlaceholder =
    isModelReady && currentModelName
      ? `Message ${currentModelName}... or click the mic to talk`
      : modelStatus;
  const placeholderText = isWaitingForSharedEngine ? WAITING_FOR_SHARED_ENGINE : idlePlaceholder;

  const handleMicToggle = () => {
    if (transcriberStatus === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const submitMessage = async () => {
    if (isLoading || isGenerating || isWaitingForSharedEngine) return;
    if (!message.trim() && attachedFiles.length === 0) return;
    if (!isModelReady) {
      toast.error("Model is not ready. Please wait or try reloading.");
      return;
    }

    const messageToSend = message;
    const filesToSend = [...attachedFiles];

    setMessage("");

    const { message: fullMessage, sent } = buildMessageWithFiles(messageToSend, filesToSend);

    try {
      await onSend(fullMessage);
      // files the budget dropped stay attached so the user can send them next
      sent.forEach((file) => removeFile(file.id));
    } catch {
      setMessage(messageToSend);
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
    handleFilesSelected,
    isDragOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleDragEnter,
    transcriberStatus,
    handleMicToggle,
    handleSubmit,
    handleKeyDown,
    isSubmitDisabled,
    isInputDisabled,
    placeholderText,
    textareaRef,
    modelDisplayInfo,
  };
}
