import React from "react";
import {
  Rocket,
  Search,
  Paperclip,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { ModelSelector } from "../../model-selector";
import { useWebLLM } from "../../../../providers/WebLLMProvider";
import type { QualityLevel } from "../../../../types";

interface OptionsBarProps {
  quality: QualityLevel;
  disabled: boolean;
  isEngineLoading: boolean;
}

/**
 * Options bar with model selector, quality settings, and action buttons
 */
export const OptionsBar: React.FC<OptionsBarProps> = ({
  quality,
  disabled,
  isEngineLoading,
}) => {
  const { isLoading, status, loadModel, selectedModel } = useWebLLM();

  const isModelError = status.includes("error") || status.includes("Error");
  const actuallyLoading = isLoading || isEngineLoading;

  const handleReloadModel = async () => {
    try {
      await loadModel(selectedModel.id);
    } catch {
      // Error handling is done in the WebLLM provider
    }
  };

  const getStatusBadge = () => {
    if (isModelError) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="destructive"
              className="text-xs h-5 px-2 cursor-pointer"
            >
              <AlertCircle className="w-2 h-2 mr-1" />
              Error
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{status}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    if (actuallyLoading) {
      return (
        <Badge variant="secondary" className="text-xs h-5 px-2">
          <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse mr-1" />
          Loading...
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="text-xs h-5 px-2">
        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse mr-1" />
        Local
      </Badge>
    );
  };

  return (
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center gap-1">
        {/* Model Selector */}
        <ModelSelector disabled={disabled || actuallyLoading} />

        {/* Quality Selector */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
              disabled={actuallyLoading}
            >
              <Rocket className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">{quality}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Quality: {quality}</p>
          </TooltipContent>
        </Tooltip>

        {/* Search Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
              disabled={actuallyLoading}
            >
              <Search className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Search web</p>
          </TooltipContent>
        </Tooltip>

        {/* Attach Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
              disabled={actuallyLoading}
            >
              <Paperclip className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Attach files</p>
          </TooltipContent>
        </Tooltip>

        {/* Reload Model Button (only show on error) */}
        {isModelError && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                onClick={handleReloadModel}
                disabled={actuallyLoading}
              >
                <RefreshCw
                  className={`w-3 h-3 ${actuallyLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reload model</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Status Badge */}
      {getStatusBadge()}
    </div>
  );
};
