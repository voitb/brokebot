import { Loader2 } from "lucide-react";
import { ChatHeader } from "../header/chat-header";
import { ChatMessages } from "../messages/chat-messages";
import { ChatInput } from "../input/chat-input";
import { useConversation } from "@/shared/hooks/use-conversations";
import { useConversationId } from "@/features/chat/hooks/use-conversation-id";
import { useChatInput } from "@/features/chat/hooks/use-chat-input";

/**
 * Main chat interface component combining header, messages, and input
 */
export function ChatInterface() {
  const conversationId = useConversationId();
  const { conversation } = useConversation(conversationId);
  const {
    message,
    setMessage,
    isLoading,
    isGenerating,
    handleMessageSubmit,
    regenerateLastResponse,
    stopGeneration,
  } = useChatInput();

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
      <ChatMessages
        isLoading={isLoading}
        isGenerating={isGenerating}
        onRegenerate={regenerateLastResponse}
        onStopGeneration={stopGeneration}
      />
      <ChatInput
        message={message}
        setMessage={setMessage}
        isLoading={isLoading}
        isGenerating={isGenerating}
        onSend={handleMessageSubmit}
        onStopGeneration={stopGeneration}
      />
    </div>
  );
};
