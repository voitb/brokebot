import { useRef, useEffect, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, useEffectEvent } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useModel } from "@/app/providers/model-provider";
import { useDragDrop } from "@/features/chat/hooks/use-drag-drop";
import { useFileUpload } from "@/features/chat/hooks/use-file-upload";
import { useSpeechToText } from "@/features/chat/hooks/use-speech-to-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square } from "lucide-react";
import { toast } from "sonner";
import { FileUpload, AttachedFilesPreview } from "./file-upload";
import { DragDropOverlay } from "./drag-drop-overlay";
import { ModelError } from "./model-error";
import { ModelStatus } from "./model-status";
import { SpeechToTextButton } from "./speech-to-text-button";
import { ScrollArea } from "@/components/ui/scroll-area";

const STT_TOAST_ID = "stt-toast";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  isGenerating: boolean;
  onSend: (message?: string) => Promise<void>;
  onStopGeneration: () => void;
}

export function ChatInput({
  message,
  setMessage,
  isLoading,
  isGenerating,
  onSend,
  onStopGeneration,
}: ChatInputProps) {
  const { currentModel, isModelLoading, modelStatus } = useModel();
  const { isDragOver, handleDrop, handleDragOver, handleDragLeave, handleDragEnter } =
    useDragDrop();

  const {
    status: transcriberStatus,
    startRecording,
    stopRecording,
    isModelLoading: isWhisperModelLoading,
    error: transcriberError,
  } = useSpeechToText((transcript) => {
    setMessage(message ? `${message} ${transcript}` : transcript);
  });

  // Handle speech-to-text status toasts (moved from hook for separation of concerns)
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

  // For now, assume models don't support images unless we implement VLM support
  const supportsImages = false;

  // Use the hook's state management instead of local state
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMicClick = () => {
    if (transcriberStatus === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const onMicToggle = useEffectEvent(() => {
    if (transcriberStatus === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  });

  // Keyboard shortcut for mic toggle (Alt+M)
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

  const isModelError = modelStatus.toLowerCase().includes("error");
  const isModelReady = !!currentModel && !isModelLoading;

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

    let fullMessage = messageToSend;

    if (filesToSend.length > 0) {
      const fileContents = filesToSend
        .map((f) => {
          const safeName = f.file.name.replace(/[<>&"']/g, "");
          return `<file name="${safeName}">\n${f.content}\n</file>`;
        })
        .join("\n\n");
      fullMessage = `${messageToSend}\n\n${fileContents}`.trim();
    }

    try {
      await onSend(fullMessage);
    } catch {
      setMessage(messageToSend);
      replaceFiles(filesToSend);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitMessage();
  };

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  return (
    <TooltipProvider>
      <div className="relative p-1 pb-4 bg-background w-full max-w-[95%] mx-auto">
        {/* Model Error Alert */}
        <ModelError
          isModelError={isModelError}
          status={modelStatus}
          isEngineLoading={isModelLoading}
          onRetry={handleRetryModel}
        />

        {/* Drag & Drop Overlay */}
        <DragDropOverlay
          isDragOver={isDragOver}
          supportsImages={supportsImages}
        />

        {/* Attached Files Preview */}
        <AttachedFilesPreview
          attachedFiles={attachedFiles}
          onFileRemoved={removeFile}
        />

        {/* Main Input Form */}
        <form onSubmit={onSubmit} className="space-y-3">
          <div
            className="flex items-end gap-1 rounded-md border p-1.5"
            onDrop={(e) => handleDrop(e, handleFilesSelected)}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <ScrollArea className="min-h-[60px] max-h-[200px] flex-grow [&>div]:max-h-[200px]">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isModelReady && currentModel
                    ? `Message ${currentModel.name}... or click the mic to talk`
                    : modelStatus
                }
                className="w-full resize-none border-none bg-transparent pr-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={
                  isLoading ||
                  isModelLoading ||
                  isModelError ||
                  isWhisperModelLoading
                }
              />
            </ScrollArea>
            <div className="flex flex-shrink-0 items-center self-end pb-1">
              <SpeechToTextButton
                status={transcriberStatus}
                onClick={handleMicClick}
                disabled={isModelLoading || isModelError || isLoading}
              />
              <FileUpload
                supportsImages={supportsImages}
                selectedModelName={currentModel?.name || "Model"}
                disabled={
                  isModelLoading ||
                  isModelError ||
                  isLoading ||
                  isWhisperModelLoading
                }
                onFilesChanged={replaceFiles}
              />
              <div className="ml-1">
                {isGenerating ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={onStopGeneration}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Stop generation</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        size="icon"
                        disabled={
                          (!message.trim() && attachedFiles.length === 0) ||
                          isLoading ||
                          isModelError ||
                          isWhisperModelLoading
                        }
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send message</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {/* Model Status Bar */}
          <ModelStatus
            selectedModel={
              currentModel
                ? {
                  name: currentModel.name,
                  modelType:
                    currentModel.type === "online" ? "Online" : "Local",
                  supportsImages: false,
                  specialization:
                    currentModel.localModel?.specialization ||
                    currentModel.onlineModel?.category,
                }
                : {
                  name: "Initializing...",
                  modelType: "None",
                  supportsImages: false,
                }
            }
            isEngineLoading={isModelLoading}
            isModelError={isModelError}
            isModelReady={isModelReady}
            supportsImages={supportsImages}
            disabled={isLoading || isModelLoading}
          />
        </form>
      </div>
    </TooltipProvider>
  );
};
