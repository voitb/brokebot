import { useEffect, type RefObject } from "react";

interface UseTextareaAutoResizeProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  message: string;
  minHeight?: number;
  maxHeight?: number;
}

/**
 * Custom hook for auto-resizing textarea based on content
 */
export const useTextareaAutoResize = ({
  textareaRef,
  message,
  minHeight = 60,
  maxHeight = 200,
}: UseTextareaAutoResizeProps): void => {
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      textarea.style.overflowY = "hidden";

      // Set height to scrollHeight, with min and max constraints
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;

      // Add scroll if content exceeds max height
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = "auto";
      }
    }
  }, [message, textareaRef, minHeight, maxHeight]);
}; 