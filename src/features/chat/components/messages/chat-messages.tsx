import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatMessages } from "@/features/chat/hooks/use-chat-messages";
import { MessageBubble } from "./message-bubble";
import { EmptyState } from "./empty-state";
import { ScrollToBottomButton } from "./scroll-to-bottom-button";

interface ChatMessagesProps {
  isLoading?: boolean;
  isGenerating?: boolean;
  onRegenerate: () => void;
  onStopGeneration: () => void;
}

export function ChatMessages({
  isLoading = false,
  isGenerating = false,
  onRegenerate,
  onStopGeneration,
}: ChatMessagesProps) {
  const {
    messages,
    conversation,
    scrollAreaRef,
    showScrollButton,
    handleScrollToBottomClick,
    getMessageBubbleProps,
  } = useChatMessages({ isGenerating, onRegenerate, onStopGeneration });

  return (
    <div className="flex-1 overflow-hidden relative">
      <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
        <div className="p-6 space-y-6">
          {messages.length === 0 && !isLoading && !isGenerating && (
            <EmptyState conversation={conversation} />
          )}

          {messages.map((message, index) => (
            <MessageBubble key={message.id} {...getMessageBubbleProps(message, index)} />
          ))}
        </div>
      </ScrollArea>

      <ScrollToBottomButton
        show={showScrollButton}
        onClick={handleScrollToBottomClick}
      />
    </div>
  );
}
