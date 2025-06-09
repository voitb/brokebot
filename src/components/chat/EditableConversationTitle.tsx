import React, { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";

interface EditableConversationTitleProps {
  initialTitle: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
  className?: string;
}

export const EditableConversationTitle: React.FC<
  EditableConversationTitleProps
> = ({ initialTitle, onSave, onCancel, className = "" }) => {
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus when component mounts - faster for breadcrumbs
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        const textLength = inputRef.current?.value.length;
        if (textLength) {
          inputRef.current?.setSelectionRange(textLength, textLength);
        }
      }, 100);
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.altKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSave(); // Allow simple Enter to save in breadcrumbs
    }
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== initialTitle) {
      onSave(trimmedTitle);
    } else {
      onCancel();
    }
  };

  const handleBlur = () => {
    // Auto-save on blur if title changed
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== initialTitle) {
      onSave(trimmedTitle);
    } else {
      onCancel();
    }
  };

  return (
    <Input
      ref={inputRef}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
      className={`rounded-none! h-auto p-0 border-0 shadow-none bg-transparent! text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none max-w-64 ${className}`}
      placeholder="Enter to save, Esc to cancel"
    />
  );
};
