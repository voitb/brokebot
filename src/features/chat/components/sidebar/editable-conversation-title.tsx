import { useState, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";

interface EditableConversationTitleProps {
  initialTitle: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
  className?: string;
}

export function EditableConversationTitle({
  initialTitle,
  onSave,
  onCancel,
  className = "",
}: EditableConversationTitleProps) {
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    inputRef.current?.focus();
    const textLength = inputRef.current?.value.length;
    if (textLength) {
      inputRef.current?.setSelectionRange(textLength, textLength);
    }
  }, []);

  const commitEdit = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== initialTitle) {
      onSave(trimmedTitle);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.altKey) {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    } else if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    }
  };

  return (
    <Input
      ref={inputRef}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={commitEdit}
      onClick={(e) => e.stopPropagation()}
      className={`rounded-none! h-auto p-0 border-0 shadow-none bg-transparent! text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none max-w-64 ${className}`}
      placeholder="Enter to save, Esc to cancel"
    />
  );
} 