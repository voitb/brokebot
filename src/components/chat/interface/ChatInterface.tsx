import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ChatHeader } from "../header";
import { ChatMessages } from "../messages";
import { ChatInput } from "../input";
import { useConversation } from "../../../hooks/useConversations";
import { useConversationId } from "../../../hooks/useConversationId";
import { useChatInput } from "../input/hooks";
import { functions } from "@/lib/appwriteClient";

/**
 * Main chat interface component combining header, messages, and input
 */
export const ChatInterface: React.FC = () => {
  const conversationId = useConversationId();
  const { conversation } = useConversation(conversationId); 
  const { isGenerating } = useChatInput(); 
 
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
    <div className="flex flex-col h-screen overflow-hidden">
      <ChatHeader />
      <ChatMessages isGenerating={isGenerating} />
      <ChatInput />
    </div>
  );
};
