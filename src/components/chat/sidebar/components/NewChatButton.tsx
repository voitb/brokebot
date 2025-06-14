import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../ui/button";
import { cn } from "../../../../lib/utils";

interface NewChatButtonProps {
  onNewChat: (folderId?: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * New chat button for sidebar
 */
export const NewChatButton: React.FC<NewChatButtonProps> = ({
  onNewChat,
  disabled = false,
  className,
}) => {
  return (
    <Button
      onClick={() => onNewChat()}
      disabled={disabled}
      className={cn("w-full justify-start gap-2", className)}
    >
      <Plus className="w-4 h-4" />
      New Chat
    </Button>
  );
};
