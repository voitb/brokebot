// components/ScrollToBottomButton.tsx
import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";

interface ScrollToBottomButtonProps {
  onClick: () => void;
  show: boolean;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  onClick,
  show,
}) => {
  if (!show) return null;

  return (
    <Button
      onClick={onClick}
      size="icon"
      className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg"
      aria-label="Scroll to bottom"
    >
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
};
