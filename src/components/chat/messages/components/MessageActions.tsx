import React, { useState } from "react";
import { Button } from "../../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { Copy, Check, RefreshCw, Square } from "lucide-react";
import { toast } from "sonner";

interface MessageActionsProps {
  content: string;
  isLastMessage: boolean;
  isModelReady: boolean;
  isGenerating?: boolean;
  onRegenerate?: () => void;
  onStopGeneration?: () => void;
}

/**
 * Message actions component (copy, regenerate, stop)
 */
export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  isLastMessage,
  isModelReady,
  isGenerating = false,
  onRegenerate,
  onStopGeneration,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Message copied to clipboard");
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
      toast.error("Failed to copy message");
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Copy button - always available for AI messages with content */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={handleCopyMessage}
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 mr-1 text-green-600" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </>
        )}
      </Button>

      {/* Regenerate/Stop button for last AI message */}
      {isLastMessage && (
        <>
          {isGenerating ? (
            // Stop generation button
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={onStopGeneration}
                >
                  <Square className="w-3 h-3 mr-1" />
                  Stop
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop generation</TooltipContent>
            </Tooltip>
          ) : (
            // Regenerate button
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={onRegenerate}
                  disabled={!onRegenerate || !isModelReady}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {!isModelReady ? "Model is not ready" : "Regenerate response"}
              </TooltipContent>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
};
