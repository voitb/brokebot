import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversation } from "@/shared/hooks/use-conversations";
import { useConversationId } from "@/features/chat/hooks/use-conversation-id";
import { useSmartAutoScroll } from "@/features/chat/hooks/use-smart-auto-scroll";
import { useWebLLM } from "@/app/providers/web-llm-provider";
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
