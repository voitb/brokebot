import React from "react";

interface ThinkingSectionProps {
  thinking: string;
}

/**
 * Thinking indicator dot with animation
 */
const ThinkingDot: React.FC = React.memo(() => (
  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
));

/**
 * Thinking header component
 */
const ThinkingHeader: React.FC = React.memo(() => (
  <div className="flex items-center gap-2 mb-2">
    <ThinkingDot />
    <span className="text-xs font-medium text-muted-foreground">
      AI is thinking...
    </span>
  </div>
));

/**
 * Thinking section component for AI messages
 */
export const ThinkingSection: React.FC<ThinkingSectionProps> = React.memo(({
  thinking,
}) => {
  if (!thinking.trim()) {
    return null;
  }

  return (
    <div className="mb-2 p-3 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30">
      <ThinkingHeader />
      <div className="text-sm text-muted-foreground italic whitespace-pre-wrap">
        {thinking}
      </div>
    </div>
  );
});
