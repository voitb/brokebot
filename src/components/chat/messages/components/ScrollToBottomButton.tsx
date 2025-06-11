// components/ScrollToBottomButton.tsx
import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../../../ui/button";

interface ScrollToBottomButtonProps {
  onClick: () => void;
  show: boolean;
}

/**
 * Scroll to bottom button with conditional rendering and animation
 */
export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = React.memo(({
  onClick,
  show,
}) => {
  if (!show) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      size="icon"
      className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg transition-opacity hover:opacity-90"
      aria-label="Scroll to bottom"
    >
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
});
