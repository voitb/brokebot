import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversation } from "@/hooks/use-conversations";
import { useConversationId } from "@/hooks/use-conversation-id";
import { useSmartAutoScroll } from "@/hooks/use-smart-auto-scroll";
import { useWebLLM } from "@/providers/web-llm-provider";
import { MessageBubble } from "./components/message-bubble";
import { EmptyState } from "./components/empty-state";
import { ScrollToBottomButton } from "./components/scroll-to-bottom-button";

interface ChatMessagesProps {
  isLoading?: boolean;
  isGenerating?: boolean;
  onRegenerate: () => void;
  onStopGeneration: () => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  isLoading = false,
  isGenerating = false,
  onRegenerate,
  onStopGeneration,
}) => {
  const conversationId = useConversationId();
  const { messages, conversation } = useConversation(conversationId);
  const { isLoading: isEngineLoading, status } = useWebLLM();
  const { scrollAreaRef, showScrollButton, handleScrollToBottomClick } =
    useSmartAutoScroll([messages, isGenerating, conversationId]);

  // Check if model is ready
  const isModelReady = status === "Ready" && !isEngineLoading;

  return (
    <div className="flex-1 overflow-hidden relative">
      <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
        <div className="p-6 space-y-6">
          {messages.length === 0 && !isLoading && !isGenerating && (
            <EmptyState conversation={conversation} />
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isGenerating={isGenerating}
              isLastMessage={index === messages.length - 1}
              onRegenerate={
                message.role === "assistant" &&
                index === messages.length - 1 &&
                isModelReady
                  ? onRegenerate
                  : undefined
              }
              onStopGeneration={
                message.role === "assistant" &&
                index === messages.length - 1 &&
                isGenerating
                  ? onStopGeneration
                  : undefined
              }
            />
          ))}
        </div>
      </ScrollArea>

      <ScrollToBottomButton
        show={showScrollButton}
        onClick={handleScrollToBottomClick}
      />
    </div>
  );
};
