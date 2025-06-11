import React, { useState, useRef, useEffect } from "react";
import { TooltipProvider } from "../../ui/tooltip";
import { useWebLLM } from "../../../providers/WebLLMProvider";
import { useChatInput, useDragDrop } from "./hooks";
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
  type AttachedFile,
} from "./components";
import type { QualityLevel } from "../../../types";

interface ChatInputProps {
  quality?: QualityLevel;
}

/**
 * Main chat input component with message form and options bar
 */
export const ChatInput: React.FC<ChatInputProps> = () => {
  const {
    isLoading: isEngineLoading,
    selectedModel,
    status,
    loadModel,
  } = useWebLLM();
  const { isLoading, handleMessageSubmit, message, setMessage } =
    useChatInput();
  const { isDragOver, handleDrop, handleDragOver, handleDragLeave } =
    useDragDrop();

  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if current model supports images (VLM)
  const supportsImages =
    selectedModel.modelType === "VLM" || selectedModel.supportsImages || false;

  // Check for model errors
  const isModelError =
    status.includes("error") ||
    status.includes("Error") ||
    status.includes("failed");
  const isModelReady = status === "Ready" && !isEngineLoading;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      textarea.style.overflowY = "hidden";

      // Set height to scrollHeight, with min and max constraints
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 200);
      textarea.style.height = `${newHeight}px`;

      // Add scroll if content exceeds max height
      if (textarea.scrollHeight > 200) {
        textarea.style.overflowY = "auto";
      }
    }
  }, [message]);

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

  const handleFilesSelected = async (files: FileList) => {
    const newFiles: AttachedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // For images, check if model supports them
      if (file.type.startsWith("image/") && !supportsImages) {
        toast.error(
          `Images are only supported by vision models. Current model: ${selectedModel.name}`
        );
        continue;
      }

      const processedFile = await processFile(file);
      newFiles.push(processedFile);
    }

    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const processFile = async (file: File): Promise<AttachedFile> => {
    const id = Math.random().toString(36).substr(2, 9);
    let type: AttachedFile["type"] = "other";
    let preview: string | undefined;

    if (file.type.startsWith("image/")) {
      type = "image";
      preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    } else if (
      file.type === "text/plain" ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".md")
    ) {
      type = "text";
    }

    return { id, file, preview, type };
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
                attachedFiles={attachedFiles}
                onFilesAttached={setAttachedFiles}
                onFileRemoved={removeFile}
                supportsImages={supportsImages}
                selectedModelName={selectedModel.name}
                disabled={isEngineLoading || isModelError}
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
};
