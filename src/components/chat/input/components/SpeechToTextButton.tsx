import React from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import type { TranscriberStatus } from "../hooks/useSpeechToText";

interface SpeechToTextButtonProps {
  status: TranscriberStatus;
  onClick: () => void;
  disabled?: boolean;
}

export const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({
  status,
  onClick,
  disabled,
}) => {
  const getTooltipText = () => {
    switch (status) {
      case "recording":
        return "Stop recording";
      case "processing":
        return "Processing audio...";
      case "loading":
        return "Loading model...";
      default:
        return "Start voice input";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "recording":
        return <MicOff className="h-4 w-4 text-destructive" />;
      case "processing":
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return <Mic className="h-4 w-4" />;
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClick}
            disabled={disabled || status === "processing" || status === "loading"}
            className="h-8 w-8 p-0"
          >
            {getIcon()}
          </Button>
          {status === "recording" && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-white" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getTooltipText()}</p>
      </TooltipContent>
    </Tooltip>
  );
}; 