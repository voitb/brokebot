import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { createMarkdownComponents } from "@/features/chat/components/markdown/markdown-components";

interface MessageContentProps {
  content: string;
  isUser: boolean;
  isGenerating?: boolean;
}

/**
 * User message content component
 */
function UserMessageContent({ content }: { content: string }) {
  return (
    <p className="text-sm whitespace-pre-wrap leading-relaxed">
      {content}
    </p>
  );
}

/**
 * AI message content component with markdown support
 */
interface AiMessageContentProps {
  content: string;
  isGenerating?: boolean;
}

function AiMessageContent({
  content,
  isGenerating = false
}: AiMessageContentProps) {
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
}

/**
 * Message content wrapper component
 */
export function MessageContent({
  content,
  isUser,
  isGenerating = false,
}: MessageContentProps) {
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
} 