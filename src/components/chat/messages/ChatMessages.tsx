import React from "react";
import { useParams } from "react-router-dom";
import { ScrollArea } from "../../ui/scroll-area";
import { useConversation } from "../../../hooks/useConversations";
import { MessageBubble, LoadingIndicator, EmptyState } from "./components";

interface ChatMessagesProps {
  isLoading?: boolean;
}

/**
 * Main chat messages container with scroll area
 */
export const ChatMessages: React.FC<ChatMessagesProps> = ({
  isLoading = false,
}) => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { messages, conversation } = useConversation(conversationId);

  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6 h-[calc(100vh-10.625rem)]">
          {/* Empty state when no messages */}
          {messages.length === 0 && !isLoading && (
            <EmptyState conversation={conversation} />
          )}

          {/* Message list */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {isLoading && <LoadingIndicator />}
        </div>
      </ScrollArea>
    </div>
  );
};
