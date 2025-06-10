import React, { useState, useRef, useEffect } from "react";
import { TooltipProvider } from "../../ui/tooltip";
import { useWebLLM } from "../../../providers/WebLLMProvider";
import { useChatInput } from "./hooks";
import type { QualityLevel } from "../../../types";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Send, Paperclip, X, FileText, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { ModelSelector } from "../ModelSelector";
import { Alert, AlertDescription } from "../../ui/alert";
import { toast } from "sonner";

interface ChatInputProps {
  quality?: QualityLevel;
}

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'text' | 'other';
}

/**
 * Main chat input component with message form and options bar
 */
export const ChatInput: React.FC<ChatInputProps> = () => {
  const { isLoading: isEngineLoading, selectedModel, status, loadModel } = useWebLLM();
  const { isLoading, handleMessageSubmit, message, setMessage } = useChatInput();
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if current model supports images (VLM)
  const supportsImages = selectedModel.modelType === 'VLM' || selectedModel.supportsImages;

  // Check for model errors
  const isModelError = status.includes("error") || status.includes("Error") || status.includes("failed");
  const isModelReady = status === "Ready" && !isEngineLoading;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight, with min and max constraints
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [message]);

  const processFile = async (file: File): Promise<AttachedFile> => {
    const id = Math.random().toString(36).substr(2, 9);
    let type: AttachedFile['type'] = 'other';
    let preview: string | undefined;

    if (file.type.startsWith('image/')) {
      type = 'image';
      // Create preview for images
      preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      type = 'text';
    }

    return { id, file, preview, type };
  };

  const handleFileSelect = async (files: FileList) => {
    const newFiles: AttachedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // For images, check if model supports them
      if (file.type.startsWith('image/') && !supportsImages) {
        toast.error(`Images are only supported by vision models. Current model: ${selectedModel.name}`);
        continue;
      }

      const processedFile = await processFile(file);
      newFiles.push(processedFile);
    }

    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await handleFileSelect(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetryModel = async () => {
    try {
      toast.loading("Reloading model...", { id: "retry-model" });
      await loadModel(selectedModel.id);
      toast.success("Model reloaded successfully", { id: "retry-model" });
    } catch (error) {
      console.error("Failed to reload model:", error);
      toast.error("Failed to reload model. Try selecting a different model.", { id: "retry-model" });
    }
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
    // In a real implementation, you'd send files to the API
    let fullMessage = messageToSend;
    
    if (filesToSend.length > 0) {
      const fileDescriptions = filesToSend.map(f => {
        if (f.type === 'image') {
          return `[Image: ${f.file.name}]`;
        } else if (f.type === 'text') {
          return `[Text file: ${f.file.name}]`;
        } else {
          return `[File: ${f.file.name}]`;
        }
      }).join(' ');
      
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

  const getStatusMessage = () => {
    if (isModelError) {
      return "Model failed to load";
    }
    if (isEngineLoading) {
      return `Loading ${selectedModel.name}...`;
    }
    if (isModelReady) {
      return "Ready";
    }
    return status;
  };

  const getStatusColor = () => {
    if (isModelError) return "text-destructive";
    if (isEngineLoading) return "text-amber-600 dark:text-amber-400";
    if (isModelReady) return "text-green-600 dark:text-green-400";
    return "text-muted-foreground";
  };

  return (
    <TooltipProvider>
      <div className="relative p-1 pb-4 bg-background w-full max-w-[95%] mx-auto">
        {/* Model Error Alert */}
        {isModelError && (
          <Alert className="mb-3 border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Model Error</p>
                <p className="text-sm text-muted-foreground">
                  {status}. Try reloading or selecting a different model.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryModel}
                disabled={isEngineLoading}
                className="ml-4"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isEngineLoading ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Drag & Drop Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary rounded-lg z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2">📎</div>
              <p className="text-sm font-medium">Drop files here</p>
              {!supportsImages && (
                <p className="text-xs text-muted-foreground mt-1">
                  Images only supported by vision models
                </p>
              )}
            </div>
          </div>
        )}

        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="relative bg-muted rounded-lg p-2 flex items-center gap-2 max-w-xs"
              >
                {file.type === 'image' && file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : file.type === 'text' ? (
                  <FileText className="w-8 h-8 text-blue-500" />
                ) : (
                  <Paperclip className="w-8 h-8 text-gray-500" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Form */}
        <form onSubmit={onSubmit} className="space-y-3">
          <div
            className="relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isModelReady ? `Message ${selectedModel.name}...` : "Model loading..."}
              className="min-h-[60px] max-h-[200px] resize-none pr-20 overflow-hidden"
              disabled={isLoading || isEngineLoading || isModelError}
              style={{ height: '60px' }}
            />
            
            {/* File Attachment Button */}
            <div className="absolute bottom-2 right-12">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={supportsImages ? "image/*,.txt,.md" : ".txt,.md"}
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => fileInputRef.current?.click()}
                title="Attach files"
                disabled={isEngineLoading || isModelError}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              size="sm"
              className="absolute bottom-2 right-2 h-8 w-8 p-0"
              disabled={isLoading || isEngineLoading || isModelError || (!message.trim() && attachedFiles.length === 0)}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Model Info with Selector and Status */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ModelSelector disabled={isLoading || isEngineLoading} />
              
              {/* Model Status */}
              <div className="flex items-center gap-1">
                {isEngineLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                {isModelError && <AlertCircle className="w-3 h-3 text-destructive" />}
                <span className={getStatusColor()}>
                  {getStatusMessage()}
                </span>
              </div>

              {supportsImages && isModelReady && (
                <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">
                  Vision
                </span>
              )}
              {selectedModel.specialization && isModelReady && (
                <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs capitalize">
                  {selectedModel.specialization}
                </span>
              )}
            </div>
            <span>{message.length}/4000</span>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
};
