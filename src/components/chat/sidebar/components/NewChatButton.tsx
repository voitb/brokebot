import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../ui/button";

interface NewChatButtonProps {
  onNewChat: () => void;
  disabled?: boolean;
}

/**
 * New chat button for sidebar
 */
export const NewChatButton: React.FC<NewChatButtonProps> = ({
  onNewChat,
  disabled = false,
}) => {
  return (
    <Button
      onClick={onNewChat}
      disabled={disabled}
      className="w-full justify-start gap-2"
    >
      <Plus className="w-4 h-4" />
      New Chat
    </Button>
  );
};
