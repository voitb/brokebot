import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square } from "lucide-react";
import { FileUpload, AttachedFilesPreview } from "../file-upload";
import { DragDropOverlay } from "../drag-drop-overlay";
import { ModelError } from "../model-error";
import { ModelStatus } from "../model-status";
import { SpeechToTextButton } from "../speech-to-text-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatInputForm } from "./use-chat-input-form";

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
  const {
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
    handleMicToggle,
    handleSubmit,
    handleKeyDown,
    handleRetryModel,
    isSubmitDisabled,
    isInputDisabled,
    placeholderText,
    textareaRef,
    modelDisplayInfo,
  } = useChatInputForm({
    message,
    setMessage,
    onSend,
    isLoading,
  });

  return (
      <div className="relative p-1 pb-4 bg-background w-full max-w-[95%] mx-auto">
        <ModelError
          isModelError={isModelError}
          status={modelStatus}
          isEngineLoading={isModelLoading}
          onRetry={handleRetryModel}
        />

        <DragDropOverlay isDragOver={isDragOver} supportsImages={supportsImages} />

        <AttachedFilesPreview
          attachedFiles={attachedFiles}
          onFileRemoved={removeFile}
        />

        <form onSubmit={handleSubmit} className="space-y-3">
          <div
            className="flex items-end gap-1 rounded-md border p-1.5"
            onDrop={handleDrop}
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
                placeholder={placeholderText}
                className="w-full resize-none border-none bg-transparent pr-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isInputDisabled}
              />
            </ScrollArea>
            <div className="flex flex-shrink-0 items-center self-end pb-1">
              <SpeechToTextButton
                status={transcriberStatus}
                onClick={handleMicToggle}
                disabled={isModelLoading || isModelError || isLoading}
              />
              <FileUpload
                supportsImages={supportsImages}
                selectedModelName={modelDisplayInfo.name}
                disabled={isInputDisabled}
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
                        aria-label="Stop generation"
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
                        disabled={isSubmitDisabled}
                        aria-label="Send message"
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

          <ModelStatus
            selectedModel={modelDisplayInfo}
            isEngineLoading={isModelLoading}
            isModelError={isModelError}
            isModelReady={isModelReady}
            supportsImages={supportsImages}
            disabled={isLoading || isModelLoading}
          />
        </form>
      </div>
  );
}
