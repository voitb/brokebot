import React from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { createMarkdownComponents } from "../utils/markdownComponents";

interface MessageContentProps {
  content: string;
  isUser: boolean;
  isGenerating?: boolean;
}

/**
 * User message content component
 */
const UserMessageContent: React.FC<{ content: string }> = React.memo(({ content }) => (
  <p className="text-sm whitespace-pre-wrap leading-relaxed">
    {content}
  </p>
));

/**
 * AI message content component with markdown support
 */
interface AiMessageContentProps {
  content: string;
  isGenerating?: boolean;
}

const AiMessageContent: React.FC<AiMessageContentProps> = React.memo(({ 
  content, 
  isGenerating = false 
}) => {
  const markdownComponents = createMarkdownComponents();

  return (
    <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown components={markdownComponents}>
        {content}
      </ReactMarkdown>

      {/* Show typing indicator if generating */}
      {isGenerating && (
        <div className="flex items-center gap-1 mt-2 text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs">Generating...</span>
        </div>
      )}
    </div>
  );
});

/**
 * Message content wrapper component
 */
export const MessageContent: React.FC<MessageContentProps> = React.memo(({
  content,
  isUser,
  isGenerating = false,
}) => {
  if (!content.trim()) {
    return null;
  }

  return (
    <div
      className={`p-3 rounded-lg ${
        isUser
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground"
      }`}
    >
      {isUser ? (
        <UserMessageContent content={content} />
      ) : (
        <AiMessageContent content={content} isGenerating={isGenerating} />
      )}
    </div>
  );
}); 