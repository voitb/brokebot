import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { createMarkdownComponents } from "@/features/chat/components/markdown/markdown-components";

const MARKDOWN_COMPONENTS = createMarkdownComponents();

interface MessageContentProps {
  content: string;
  isUser: boolean;
  isGenerating?: boolean;
}

function UserMessageContent({ content }: { content: string }) {
  return (
    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
      {content}
    </p>
  );
}

interface AiMessageContentProps {
  content: string;
  isGenerating?: boolean;
}

function AiMessageContent({
  content,
  isGenerating = false
}: AiMessageContentProps) {
  return (
    <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert break-words">
      <ReactMarkdown components={MARKDOWN_COMPONENTS}>
        {content}
      </ReactMarkdown>

      {isGenerating && (
        <div className="flex items-center gap-1 mt-2 text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs">Generating...</span>
        </div>
      )}
    </div>
  );
}

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