import React from "react";

/**
 * Animated dots component for loading state
 */
const AnimatedDots: React.FC = React.memo(() => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
  </div>
));

/**
 * Loading indicator showing animated dots while AI is generating response
 */
export const LoadingIndicator: React.FC = React.memo(() => (
  <div className="flex justify-start mb-4">
    <div className="max-w-[80%] bg-muted rounded-lg px-4 py-3">
      <div className="flex items-center space-x-1">
        <AnimatedDots />
        <span className="text-sm text-muted-foreground ml-2">
          AI is thinking...
        </span>
      </div>
    </div>
  </div>
));
