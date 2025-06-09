import React from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ChatHeader } from "../header";
import { ChatMessages } from "../messages";
import { ChatInput } from "../input";
import { useConversation } from "../../../hooks/useConversations";

/**
 * Main chat interface component combining header, messages, and input
 */
export const ChatInterface: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { conversation } = useConversation(conversationId);

  // Show loader while conversation is being loaded (only for specific conversation IDs)
  if (conversationId && conversation === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </>
  );
};
