import React, { useState, useRef, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../../ui/tooltip";
import { useModel } from "../../../providers/ModelProvider";
import {
  useDragDrop,
  useFileUpload,
  useSpeechToText,
  type AttachedFile,
} from "./hooks";
import { useTextareaAutoResize } from "./hooks/useTextareaAutoResize";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Send, Loader2, Mic, Square } from "lucide-react";
import { toast } from "sonner";
import {
  FileUpload,
  AttachedFilesPreview,
  DragDropOverlay,
  ModelError,
  ModelStatus,
  SpeechToTextButton,
} from "./components";
import type { QualityLevel } from "../../../types";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  isGenerating: boolean;
  onSend: (message?: string) => Promise<void>;
  onStopGeneration: () => void;
  quality?: QualityLevel;
}

/**
 * Main chat input component with message form and options bar
 */
export const ChatInput: React.FC<ChatInputProps> = React.memo(({
  message,
  setMessage,
  isLoading,
  isGenerating,
  onSend,
  onStopGeneration,
}) => {
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
  
  // Effect for handling STT toasts based on status and error state
  useEffect(() => {
    const STT_TOAST_ID = "stt-toast";

    if (transcriberError) {
      toast.error(transcriberError, { id: STT_TOAST_ID });
      return; // Stop here to show the error
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
          icon: <Mic className="h-4 w-4" />,
        });
        break;
      case "ready":
      case "uninitialized":
      case "error": // Error toast is handled above, this just dismisses any active toast
        toast.dismiss(STT_TOAST_ID);
        break;
    }
  }, [transcriberStatus, transcriberError]);

  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useTextareaAutoResize({
    textareaRef,
    message,
    minHeight: 60,
    maxHeight: 200,
  });

  const handleMicClick = React.useCallback(() => {
    if (transcriberStatus === "recording") {
      stopRecording();
    } else {
      startRecording();
    }
  }, [transcriberStatus, startRecording, stopRecording]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        handleMicClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMicClick]);

  // For now, assume models don't support images unless we implement VLM support
  const supportsImages = false;
  const isModelError = modelStatus.toLowerCase().includes("error");
  const isModelReady = !!currentModel && !isModelLoading;

  const handleRetryModel = async () => {
    toast.info("Model retry is not yet implemented for unified models");
  };

  // Initialize useFileUpload hook at the top level
  const { processFile } = useFileUpload({
    supportsImages,
    selectedModelName: currentModel?.name || "Model",
  });

  const handleFilesSelected = async (files: FileList) => {
    // Convert FileList to array and process files
    const fileArray = Array.from(files);
    const processedFiles: AttachedFile[] = [];
    
    for (const file of fileArray) {
      try {
        const processedFile = await processFile(file);
        processedFiles.push(processedFile);
      } catch (error) {
        console.error("Failed to process file:", error);
      }
    }

    if (processedFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...processedFiles]);
    }
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    setAttachedFiles([]);

    let fullMessage = messageToSend;

    if (filesToSend.length > 0) {
      const fileContents = filesToSend
        .map((f) => `<file name="${f.file.name}">\n${f.content}\n</file>`)
        .join("\n\n");
      fullMessage = `${messageToSend}\n\n${fileContents}`.trim();
    }

    try {
      await onSend(fullMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore the message and files if submission failed
      setMessage(messageToSend);
      setAttachedFiles(filesToSend);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as React.FormEvent);
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
            className="relative"
            onDrop={(e) => handleDrop(e, handleFilesSelected)}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
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
              className="min-h-[60px] max-h-[200px] resize-none pr-32 overflow-hidden"
              disabled={isLoading || isModelLoading || isModelError || isWhisperModelLoading}
              style={{ height: "60px" }}
            />

            {/* Mic and File Attachment Buttons */}
            <div className="absolute bottom-2 right-14 flex items-center">
              <SpeechToTextButton
                status={transcriberStatus}
                onClick={handleMicClick}
                disabled={isModelLoading || isModelError || isLoading}
              />
              <FileUpload
                supportsImages={supportsImages}
                selectedModelName={currentModel?.name || "Model"}
                disabled={isModelLoading || isModelError || isLoading || isWhisperModelLoading}
                onFilesChanged={setAttachedFiles}
              />
            </div>

            {/* Send Button / Stop Button */}
            <div className="absolute bottom-2 right-2">
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
                        isLoading || isModelError || isWhisperModelLoading
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
});
