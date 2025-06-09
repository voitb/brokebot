import React from "react";
import { Send } from "lucide-react";
import { Button } from "../../../ui/button";
import { AutosizeTextarea } from "../../../ui/auto-size-textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";

interface MessageFormProps {
  onSubmit: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

/**
 * Message input form with auto-resize textarea and send button
 */
export const MessageForm: React.FC<MessageFormProps> = ({
  onSubmit,
  disabled,
  placeholder = "Type your message...",
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;

    if (!message.trim()) return;

    onSubmit(message);
    e.currentTarget.reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const formEvent = new Event("submit", {
          bubbles: true,
          cancelable: true,
        });
        form.dispatchEvent(formEvent);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-2">
        <AutosizeTextarea
          name="message"
          className="flex-1 text-sm resize-none"
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          maxHeight={300}
          minHeight={40}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              size="sm"
              disabled={disabled}
              className="h-9 w-9 p-0 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Send (Enter)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </form>
  );
};
