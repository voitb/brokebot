import React, { useRef, useEffect } from "react";
import { ScrollArea } from "../../ui/scroll-area";
import { useConversation } from "../../../hooks/useConversations";
import { useConversationId } from "../../../hooks/useConversationId";
import { MessageBubble, LoadingIndicator, EmptyState } from "./components";

interface ChatMessagesProps {
  isLoading?: boolean;
  isGenerating?: boolean;
}

/**
 * Main chat messages container with auto-scroll using scrollIntoView
 */
export const ChatMessages: React.FC<ChatMessagesProps> = ({
  isLoading = false,
  isGenerating = false,
}) => {
  const conversationId = useConversationId();
  const { messages, conversation } = useConversation(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simple and reliable scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]);

  // Continuous scroll during AI generation
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(scrollToBottom, 200);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full w-full">
        <div className="p-6 space-y-6">
          {/* Empty state when no messages */}
          {messages.length === 0 && !isLoading && !isGenerating && (
            <EmptyState conversation={conversation} />
          )}

          {/* Message list */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Loading indicator for AI generation */}
          {isGenerating && <LoadingIndicator />}

          {/* Invisible div at the end for scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
