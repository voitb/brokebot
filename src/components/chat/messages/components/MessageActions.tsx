import React, { useState } from "react";
import { Button } from "../../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface MessageActionsProps {
  content: string;
  isLastMessage: boolean;
  isModelReady: boolean;
  onRegenerate?: () => void;
}

/**
 * Message actions component (copy, regenerate)
 */
export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  isLastMessage,
  isModelReady,
  onRegenerate,
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

      {/* Show regenerate button always for last AI message, but disable if model not ready */}
      {isLastMessage && (
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
    </div>
  );
};
