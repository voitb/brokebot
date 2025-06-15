import React, { useState, useRef } from "react";
import { TooltipProvider } from "../../ui/tooltip";
import { useModel } from "../../../providers/ModelProvider";
import { useChatInput, useDragDrop, useFileUpload, type AttachedFile } from "./hooks";
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
  const { currentModel, isModelLoading, modelStatus } = useModel();
  const { isLoading, handleMessageSubmit, message, setMessage } =
    useChatInput();
  const { isDragOver, handleDrop, handleDragOver, handleDragLeave, handleDragEnter } =
    useDragDrop();

  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useTextareaAutoResize({
    textareaRef,
    message,
    minHeight: 60,
    maxHeight: 200,
  });

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

    // Include file content in the message for AI processing
    let fullMessage = messageToSend;

    if (filesToSend.length > 0) {
      const fileContents: string[] = [];
      
      filesToSend.forEach((f) => {
        if (f.type === "text" && f.content) {
          fileContents.push(`--- Content of ${f.file.name} ---\n${f.content}\n--- End of ${f.file.name} ---`);
        } else if (f.type === "image") {
          fileContents.push(`[Image: ${f.file.name}]`);
        } else {
          fileContents.push(`[File: ${f.file.name}]`);
        }
      });

      if (fileContents.length > 0) {
        fullMessage = `${messageToSend}\n\n${fileContents.join("\n\n")}`;
      }
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
                  ? `Message ${currentModel.name}...`
                  : modelStatus
              }
              className="min-h-[60px] max-h-[200px] resize-none pr-20 overflow-hidden"
              disabled={isLoading || isModelLoading || isModelError}
              style={{ height: "60px" }}
            />

            {/* File Attachment Button */}
            <div className="absolute bottom-2 right-14">
              <FileUpload
                supportsImages={supportsImages}
                selectedModelName={currentModel?.name || "Model"}
                disabled={isModelLoading || isModelError}
                onFilesChanged={setAttachedFiles}
              />
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              size="sm"
              className="absolute bottom-2 right-4 h-8 w-8 p-0"
              disabled={
                isLoading ||
                isModelLoading ||
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
