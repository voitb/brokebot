import type { RefObject } from "react";
import { useConversation } from "@/hooks/use-conversations";
import { useConversationId } from "@/hooks";
import { useSmartAutoScroll } from "@/features/chat/hooks/use-smart-auto-scroll";
import { useWebLLM } from "@/app/providers/web-llm-provider";
import type { Message, Conversation } from "@/lib/db";
import type { MessageBubbleProps } from "../message-bubble";

export interface UseChatMessagesProps {
  isGenerating: boolean;
  onRegenerate: () => void;
  onStopGeneration: () => void;
}

export interface UseChatMessagesReturn {
  messages: Message[];
  conversation: Conversation | undefined;
  isModelReady: boolean;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  showScrollButton: boolean;
  handleScrollToBottomClick: () => void;
  getMessageBubbleProps: (message: Message, index: number) => MessageBubbleProps;
}

export function useChatMessages({
  isGenerating,
  onRegenerate,
  onStopGeneration,
}: UseChatMessagesProps): UseChatMessagesReturn {
  const conversationId = useConversationId();
  const { messages, conversation } = useConversation(conversationId);
  const { isLoading: isEngineLoading, status } = useWebLLM();
  const { scrollAreaRef, showScrollButton, handleScrollToBottomClick } =
    useSmartAutoScroll({
      messageCount: messages.length,
      isGenerating,
      conversationId,
    });

  const isModelReady = status === "Ready" && !isEngineLoading;

  const getMessageBubbleProps = (
    message: Message,
    index: number
  ): MessageBubbleProps => {
    const isLastMessage = index === messages.length - 1;
    const isLastAssistantMessage =
      message.role === "assistant" && isLastMessage;

    return {
      message,
      isGenerating,
      isLastMessage,
      onRegenerate:
        isLastAssistantMessage && isModelReady ? onRegenerate : undefined,
      onStopGeneration:
        isLastAssistantMessage && isGenerating ? onStopGeneration : undefined,
    };
  };

  return {
    messages,
    conversation,
    isModelReady,
    scrollAreaRef,
    showScrollButton,
    handleScrollToBottomClick,
    getMessageBubbleProps,
  };
}
