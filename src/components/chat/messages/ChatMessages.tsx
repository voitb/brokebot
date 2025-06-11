import React, { useEffect } from "react";
import { ScrollArea } from "../../ui/scroll-area";
import { useConversation } from "../../../hooks/useConversations";
import { useConversationId } from "../../../hooks/useConversationId";
import { useScrollPosition } from "../../../hooks/useScrollPosition";
import { useAutoScroll } from "../../../hooks/useAutoScroll";
import { useChatInput } from "../input/hooks";
import { MessageBubble, EmptyState, ScrollToBottomButton } from "./components";

interface ChatMessagesProps {
  isLoading?: boolean;
  isGenerating?: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  isLoading = false,
  isGenerating = false,
}) => {
  const conversationId = useConversationId();
  const { messages, conversation } = useConversation(conversationId);
  const { regenerateLastResponse } = useChatInput();

  const { scrollAreaRef, isNearBottom, shouldAutoScroll, setShouldAutoScroll } =
    useScrollPosition(30);

  const { scrollToBottom, resetInitialLoad } = useAutoScroll(
    scrollAreaRef,
    shouldAutoScroll,
    [messages, isGenerating]
  );

  useEffect(() => {
    resetInitialLoad();
    setShouldAutoScroll(true);
  }, [conversationId, resetInitialLoad, setShouldAutoScroll]);

  const handleScrollToBottom = () => {
    scrollToBottom(true);
    setShouldAutoScroll(true);
  };

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
                message.role === "assistant" && index === messages.length - 1
                  ? regenerateLastResponse
                  : undefined
              }
            />
          ))}

          {/* LoadingIndicator is now handled inside MessageBubble when isGenerating && no content */}
        </div>
      </ScrollArea>

      <ScrollToBottomButton
        show={!isNearBottom}
        onClick={handleScrollToBottom}
      />
    </div>
  );
};
