import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CopyButton } from "@/components/ui/copy-button";
import { RefreshCw, Square } from "lucide-react";

interface MessageActionsProps {
  content: string;
  isLastMessage: boolean;
  isModelReady: boolean;
  isGenerating?: boolean;
  onRegenerate?: () => void;
  onStopGeneration?: () => void;
}

/**
 * Stop generation button component
 */
interface StopButtonProps {
  onStop?: () => void;
}

function StopButton({ onStop }: StopButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
          onClick={onStop}
        >
          <Square className="w-3 h-3 mr-1" />
          Stop
        </Button>
      </TooltipTrigger>
      <TooltipContent>Stop generation</TooltipContent>
    </Tooltip>
  );
}

/**
 * Regenerate button component
 */
interface RegenerateButtonProps {
  onRegenerate?: () => void;
  isModelReady: boolean;
}

function RegenerateButton({ onRegenerate, isModelReady }: RegenerateButtonProps) {
  return (
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
  );
}

/**
 * Message actions component (copy, regenerate, stop)
 */
export function MessageActions({
  content,
  isLastMessage,
  isModelReady,
  isGenerating = false,
  onRegenerate,
  onStopGeneration,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Copy button - always available for AI messages with content */}
      <CopyButton
        value={content}
        size="sm"
        className="h-7 px-2 text-xs"
        showTooltip={true}
      >
        <span className="ml-1">Copy</span>
      </CopyButton>

      {/* Regenerate/Stop button for last AI message */}
      {isLastMessage && (
        <>
          {isGenerating ? (
            <StopButton onStop={onStopGeneration} />
          ) : (
            <RegenerateButton
              onRegenerate={onRegenerate}
              isModelReady={isModelReady}
            />
          )}
        </>
      )}
    </div>
  );
}
