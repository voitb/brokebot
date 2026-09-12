import type { Message } from "@/lib/db";
import { parseMessage } from "@/features/chat/utils/parse-message";
import { MessageAvatar } from "./message-avatar";
import { ThinkingSection } from "./thinking-section";
import { MessageActions } from "./message-actions";
import { MessageContent } from "./message-content";
import { MessageTimestamp } from "./message-timestamp";
import { GeneratingIndicator } from "./generating-indicator";
import { AttachmentBadge } from "./attachment-badge";

export interface MessageBubbleProps {
  message: Message;
  isGenerating?: boolean;
  isLastMessage?: boolean;
  isModelReady?: boolean;
  onRegenerate?: () => void;
  onStopGeneration?: () => void;
}

export function MessageBubble({
  message,
  isGenerating = false,
  isLastMessage = false,
  isModelReady = false,
  onRegenerate,
  onStopGeneration,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAiGenerating = !isUser && isGenerating && isLastMessage;
  const parsedMessage = parseMessage(message.content, {
    extractThinking: message.role === "assistant",
  });

  if (isAiGenerating && !message.content.trim()) {
    return <GeneratingIndicator />;
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      {!isUser && (
        <MessageAvatar isUser={false} position="left" />
      )}

      <div className={`max-w-xl overflow-hidden ${isUser ? "ml-auto" : ""}`}>
        {!isUser && parsedMessage.thinking && (
          <ThinkingSection
            thinking={parsedMessage.thinking}
            isGenerating={isAiGenerating}
          />
        )}

        <MessageContent
          content={parsedMessage.content}
          isUser={isUser}
          isGenerating={isAiGenerating}
        />

        {isUser && parsedMessage.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {parsedMessage.attachments.map((att, index) => (
              <AttachmentBadge key={`${att.name}-${index}`} fileName={att.name} />
            ))}
          </div>
        )}

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

        <MessageTimestamp timestamp={message.createdAt} isUser={isUser} />
      </div>

      {isUser && (
        <MessageAvatar isUser={true} position="right" />
      )}
    </div>
  );
}
