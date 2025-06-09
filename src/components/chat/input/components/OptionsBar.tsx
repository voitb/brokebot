import React from "react";
import { Rocket, Search, Paperclip } from "lucide-react";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { ModelSelector } from "../../ModelSelector";
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
  return (
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center gap-1">
        {/* Model Selector */}
        <ModelSelector disabled={disabled} />

        {/* Quality Selector */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
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
            >
              <Paperclip className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Attach files</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Status Badge */}
      <Badge variant="secondary" className="text-xs h-5 px-2">
        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse mr-1" />
        {isEngineLoading ? "Loading..." : "Local"}
      </Badge>
    </div>
  );
};
