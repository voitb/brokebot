import React from "react";

interface ThinkingSectionProps {
  thinking: string;
}

/**
 * Thinking section component for AI messages
 */
export const ThinkingSection: React.FC<ThinkingSectionProps> = ({
  thinking,
}) => {
  return (
    <div className="mb-2 p-3 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium text-muted-foreground">
          AI is thinking...
        </span>
      </div>
      <div className="text-sm text-muted-foreground italic whitespace-pre-wrap">
        {thinking}
      </div>
    </div>
  );
};
