import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface NewChatButtonProps {
  onNewChat: () => void;
}

export function NewChatButton({ onNewChat }: NewChatButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <SidebarTrigger />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" onClick={onNewChat}>
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Create new conversation (g n)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
