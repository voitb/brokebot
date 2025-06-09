import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { SidebarTrigger } from "../../../ui/sidebar";

interface NewChatButtonProps {
  onNewChat: () => void;
}

/**
 * New chat button with sidebar trigger for desktop view
 * Shows when sidebar is closed
 */
export const NewChatButton: React.FC<NewChatButtonProps> = ({ onNewChat }) => {
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
          <p>Create new conversation (Alt+N)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
