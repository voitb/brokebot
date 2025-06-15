import React from "react";
import type { Message } from "../../../../lib/db";
import { useWebLLM } from "../../../../providers/WebLLMProvider";
import { useMessageParser, useSlowGenerationWarning } from "../hooks";
import { 
  MessageAvatar, 
  ThinkingSection, 
  MessageActions,
  MessageContent,
  MessageTimestamp,
  SlowGenerationWarning,
  GeneratingIndicator,
  AttachmentBadge,
} from "./";

interface MessageBubbleProps {
  message: Message;
  isGenerating?: boolean;
  isLastMessage?: boolean;
  onRegenerate?: () => void;
  onStopGeneration?: () => void;
}

/**
 * Individual message bubble with avatar and content
 */
export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({
  message,
  isGenerating = false,
  isLastMessage = false,
  onRegenerate,
  onStopGeneration,
}) => {
  const isUser = message.role === "user";
  const { isLoading: isEngineLoading, status } = useWebLLM();
  const isAiGenerating = !isUser && isGenerating && isLastMessage;
  const isModelReady = status === "Ready" && !isEngineLoading;
  const parsedMessage = useMessageParser(message.content);
  
  const { showSlowWarning } = useSlowGenerationWarning({
    isGenerating: isAiGenerating,
  });

  // If AI is generating but has no content yet, show loader without bubble
  if (isAiGenerating && !message.content.trim()) {
    return <GeneratingIndicator />;
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      {/* Avatar for AI */}
      {!isUser && (
        <MessageAvatar
          isUser={false}
          isGenerating={isAiGenerating}
          position="left"
        />
      )}

      <div className={`max-w-xl ${isUser ? "ml-auto" : ""}`}>
        {/* Thinking Section (only for AI) */}
        {!isUser && parsedMessage.thinking && (
          <ThinkingSection thinking={parsedMessage.thinking} />
        )}

        {/* Main Message Content */}
        <MessageContent
          content={parsedMessage.content}
          isUser={isUser}
          isGenerating={isAiGenerating}
        />

        {/* Attachments for user messages */}
        {isUser && parsedMessage.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {parsedMessage.attachments.map((att, index) => (
              <AttachmentBadge key={index} fileName={att.name} />
            ))}
          </div>
        )}

        {/* Message Actions (only for AI messages with content) */}
        {!isUser && (parsedMessage.content.trim() || isAiGenerating) && (
          <MessageActions
            content={parsedMessage.content}
            isLastMessage={isLastMessage}
            isModelReady={isModelReady}
            isGenerating={isAiGenerating}
            onRegenerate={onRegenerate}
            onStopGeneration={onStopGeneration}
          />
        )}

        {/* Slow Generation Warning */}
        <SlowGenerationWarning show={showSlowWarning && isAiGenerating} />

        {/* Timestamp */}
        <MessageTimestamp timestamp={message.createdAt} isUser={isUser} />
      </div>

      {/* Avatar for User */}
      {isUser && (
        <MessageAvatar isUser={true} isGenerating={false} position="right" />
      )}
    </div>
  );
});
