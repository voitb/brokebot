import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Alert, AlertDescription } from "../../../ui/alert";
import { Badge } from "../../../ui/badge";
import { Clock, Loader2 } from "lucide-react";
import type { IMessage } from "../../../../lib/db";
import { useWebLLM } from "../../../../providers/WebLLMProvider";
import { MessageAvatar, ThinkingSection, CodeBlock, MessageActions } from "./";
import { useMessageParser } from "../hooks";

interface MessageBubbleProps {
  message: IMessage;
  isGenerating?: boolean;
  isLastMessage?: boolean;
  onRegenerate?: () => void;
  onStopGeneration?: () => void;
}

/**
 * Individual message bubble with avatar and content
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGenerating = false,
  isLastMessage = false,
  onRegenerate,
  onStopGeneration,
}) => {
  const isUser = message.role === "user";
  const { isLoading: isEngineLoading, status } = useWebLLM();
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  const isAiGenerating = !isUser && isGenerating && isLastMessage;
  const isModelReady = status === "Ready" && !isEngineLoading;
  const parsedMessage = useMessageParser(message.content);

  // Show warning after 15 seconds of generation
  useEffect(() => {
    if (isAiGenerating) {
      const timer = setTimeout(() => {
        setShowSlowWarning(true);
      }, 15000);

      return () => {
        clearTimeout(timer);
        setShowSlowWarning(false);
      };
    } else {
      setShowSlowWarning(false);
    }
  }, [isAiGenerating]);

  const CodeBlockComponent: Components["code"] = ({
    className,
    children,
    ...props
  }) => {
    return (
      <CodeBlock className={className} {...props}>
        {children}
      </CodeBlock>
    );
  };

  // If AI is generating but has no content yet, show loader without bubble
  if (isAiGenerating && !message.content.trim()) {
    return (
      <div className="flex justify-start group">
        <MessageAvatar isUser={false} isGenerating={true} position="left" />
        <div className="flex items-center gap-2 text-muted-foreground py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">AI is thinking...</span>
        </div>
      </div>
    );
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
        {parsedMessage.content.trim() && (
          <div
            className={`p-3 rounded-lg ${
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {parsedMessage.content}
              </p>
            ) : (
              <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    code: CodeBlockComponent,
                    pre: ({ children }) => (
                      <div className="overflow-hidden">{children}</div>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-2 last:mb-0 pl-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-2 last:mb-0 pl-4">{children}</ol>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-border pl-4 italic mb-2 last:mb-0">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {parsedMessage.content}
                </ReactMarkdown>

                {/* Show typing indicator if generating */}
                {isAiGenerating && (
                  <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-xs">Generating...</span>
                  </div>
                )}
              </div>
            )}
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
        {showSlowWarning && isAiGenerating && (
          <Alert className="mt-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              <p className="text-sm font-medium">
                AI is taking longer than usual
              </p>
              <p className="text-xs mt-1">
                Consider switching to a lighter model for faster responses.
                Current model might be too heavy for your device.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Timestamp */}
        <div
          className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          <Badge variant="outline" className="text-xs">
            {message.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Badge>
        </div>
      </div>

      {/* Avatar for User */}
      {isUser && (
        <MessageAvatar isUser={true} isGenerating={false} position="right" />
      )}
    </div>
  );
};
