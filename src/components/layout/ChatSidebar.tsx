import React from "react";
import { ConversationList } from "../chat/ConversationList";
import { SidebarTrigger } from "../ui/sidebar";

/**
 * Chat sidebar containing conversation list
 */
export const ChatSidebar: React.FC = () => {
  console.log("🟢 ChatSidebar");

  return (
    <aside className="w-full h-full flex flex-col bg-background">
      {/* Header with app name and close button */}
      <div className="p-4 pb-3 flex items-center justify-between border-border">
        <span className="text-lg font-semibold">Local-GPT</span>
        <SidebarTrigger />
      </div>

      {/* Conversation List */}
      <div className="flex-1 min-h-0">
        <ConversationList />
      </div>
    </aside>
  );
};
