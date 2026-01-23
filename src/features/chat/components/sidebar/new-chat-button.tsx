import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface NewChatButtonProps {
  onNewChat: (folderId?: string) => void;
  disabled?: boolean;
  className?: string;
}

export function NewChatButton({
  onNewChat,
  disabled = false,
  className,
}: NewChatButtonProps) {
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
