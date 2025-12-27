import { useEffect, type RefObject } from "react";

const DEFAULT_MIN_HEIGHT = 60;
const DEFAULT_MAX_HEIGHT = 200;

interface UseTextareaAutoResizeProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  message: string;
  minHeight?: number;
  maxHeight?: number;
}

export const useTextareaAutoResize = ({
  textareaRef,
  message,
  minHeight = DEFAULT_MIN_HEIGHT,
  maxHeight = DEFAULT_MAX_HEIGHT,
}: UseTextareaAutoResizeProps): void => {
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.overflowY = "hidden";

      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;

      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = "auto";
      }
    }
  }, [message, minHeight, maxHeight]);
}; 