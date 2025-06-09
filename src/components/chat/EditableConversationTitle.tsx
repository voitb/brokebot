import React, { useState, useRef, type KeyboardEvent } from "react";
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

  // Auto focus when component mounts
  React.useEffect(() => {
    const input = inputRef.current;
    if (input) {
      const timeoutId = setTimeout(() => {
        if (input && document.activeElement !== input) {
          input.focus();
          input.select();
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter" && e.altKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    } else if (e.key === "Enter") {
      e.preventDefault();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setTitle(e.target.value);
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <Input
      ref={inputRef}
      value={title}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onFocus={handleFocus}
      className={`flex-1 h-auto p-0 border-0 shadow-none bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none ${className}`}
      placeholder="Alt+Enter to save, Esc to cancel"
    />
  );
};
