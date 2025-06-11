import React, { useState, useRef } from "react";
import { TooltipProvider } from "../../ui/tooltip";
import { useWebLLM } from "../../../providers/WebLLMProvider";
import { useChatInput, useDragDrop, type AttachedFile } from "./hooks";
import { useTextareaAutoResize } from "./hooks/useTextareaAutoResize";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  FileUpload,
  AttachedFilesPreview,
  DragDropOverlay,
  ModelError,
  ModelStatus,
} from "./components";
import type { QualityLevel } from "../../../types";

interface ChatInputProps {
  quality?: QualityLevel;
}

/**
 * Main chat input component with message form and options bar
 */
export const ChatInput: React.FC<ChatInputProps> = React.memo(() => {
  const {
    isLoading: isEngineLoading,
    selectedModel,
    status,
    loadModel,
  } = useWebLLM();
  const { isLoading, handleMessageSubmit, message, setMessage } = useChatInput();
  const { isDragOver, handleDrop, handleDragOver, handleDragLeave } = useDragDrop();

  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useTextareaAutoResize({
    textareaRef,
    message,
    minHeight: 60,
    maxHeight: 200,
  });

  // Check if current model supports images (VLM)
  const supportsImages =
    selectedModel.modelType === "VLM" || selectedModel.supportsImages || false;

  // Check for model errors
  const isModelError =
    status.includes("error") ||
    status.includes("Error") ||
    status.includes("failed");
  const isModelReady = status === "Ready" && !isEngineLoading;

  const handleRetryModel = async () => {
    try {
      toast.loading("Reloading model...", { id: "retry-model" });
      await loadModel(selectedModel.id);
      toast.success("Model reloaded successfully", { id: "retry-model" });
    } catch (error) {
      console.error("Failed to reload model:", error);
      toast.error("Failed to reload model. Try selecting a different model.", {
        id: "retry-model",
      });
    }
  };

  const handleFilesSelected = () => {
    // This will be handled by the FileUpload component
    // We just need to listen for file changes via onFilesChanged
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

    // For now, we'll just include file information in the message
    let fullMessage = messageToSend;

    if (filesToSend.length > 0) {
      const fileDescriptions = filesToSend
        .map((f) => {
          if (f.type === "image") {
            return `[Image: ${f.file.name}]`;
          } else if (f.type === "text") {
            return `[Text file: ${f.file.name}]`;
          } else {
            return `[File: ${f.file.name}]`;
          }
        })
        .join(" ");

      fullMessage = `${messageToSend}\n\n${fileDescriptions}`;
    }

    try {
      await handleMessageSubmit(fullMessage);
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
          status={status}
          isEngineLoading={isEngineLoading}
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
            onDragLeave={handleDragLeave}
          >
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isModelReady
                  ? `Message ${selectedModel.name}...`
                  : "Model loading..."
              }
              className="min-h-[60px] max-h-[200px] resize-none pr-20 overflow-hidden"
              disabled={isLoading || isEngineLoading || isModelError}
              style={{ height: "60px" }}
            />

            {/* File Attachment Button */}
            <div className="absolute bottom-2 right-12">
              <FileUpload
                supportsImages={supportsImages}
                selectedModelName={selectedModel.name}
                disabled={isEngineLoading || isModelError}
                onFilesChanged={setAttachedFiles}
              />
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              size="sm"
              className="absolute bottom-2 right-2 h-8 w-8 p-0"
              disabled={
                isLoading ||
                isEngineLoading ||
                isModelError ||
                (!message.trim() && attachedFiles.length === 0)
              }
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Model Status Bar */}
          <ModelStatus
            selectedModel={selectedModel}
            status={status}
            isEngineLoading={isEngineLoading}
            isModelError={isModelError}
            isModelReady={isModelReady}
            supportsImages={supportsImages}
            disabled={isLoading || isEngineLoading}
            messageLength={message.length}
          />
        </form>
      </div>
    </TooltipProvider>
  );
});
