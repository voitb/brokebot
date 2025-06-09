import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../../../ui/button";

interface ScrollToBottomButtonProps {
  visible: boolean;
  onClick: () => void;
}

/**
 * Button that appears when user scrolls up from bottom
 * Allows quick return to the latest messages
 */
export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  onClick,
}) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-6 right-6 z-10">
      <Button
        onClick={onClick}
        size="sm"
        className="rounded-full h-10 w-10 p-0 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        aria-label="Scroll to bottom"
      >
        <ChevronDown className="w-4 h-4" />
      </Button>
    </div>
  );
};
