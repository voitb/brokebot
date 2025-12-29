import type { Message } from "@/lib/db";
import { useWebLLM } from "@/app/providers/web-llm-provider";
import { parseMessage } from "@/features/chat/utils/parse-message";
import { MessageAvatar } from "./message-avatar";
import { ThinkingSection } from "./thinking-section";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
import { MessageTimestamp } from "./message-timestamp";
import { GeneratingIndicator } from "./generating-indicator";
import { AttachmentBadge } from "./attachment-badge";

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
export function MessageBubble({
  message,
  isGenerating = false,
  isLastMessage = false,
  onRegenerate,
  onStopGeneration,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const { isLoading: isEngineLoading, status } = useWebLLM();
  const isAiGenerating = !isUser && isGenerating && isLastMessage;
  const isModelReady = status === "Ready" && !isEngineLoading;
  const parsedMessage = parseMessage(message.content);

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

        {/* Timestamp */}
        <MessageTimestamp timestamp={message.createdAt} isUser={isUser} />
      </div>

      {/* Avatar for User */}
      {isUser && (
        <MessageAvatar isUser={true} isGenerating={false} position="right" />
      )}
    </div>
  );
}
