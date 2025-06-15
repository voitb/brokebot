import React from "react"; 
import { SidebarTrigger } from "../ui/sidebar";
import { ConversationList } from "..";
import { Logo } from "../ui/Logo";

/**
 * Chat sidebar containing conversation list
 */
export const ChatSidebar: React.FC = () => { 

  return (
    <aside className="w-full h-full flex flex-col bg-background">
      {/* Header with app name and close button */}
      <div className="p-4 pb-3 flex items-center justify-between border-border">
        <Logo size="md" className="ml-1" />
        <SidebarTrigger />
      </div>

      {/* Conversation List */}
      <div className="flex-1 min-h-0">
        <ConversationList />
      </div>
    </aside>
  );
};
