import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Alert, AlertDescription } from "../../../ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { Copy, Check, Loader2, Clock, RefreshCw } from "lucide-react";
import type { IMessage } from "../../../../lib/db";
import { useTheme } from "../../../../providers/ThemeProvider";
import { useWebLLM } from "../../../../providers/WebLLMProvider";
import { toast } from "sonner";

interface MessageBubbleProps {
  message: IMessage;
  isGenerating?: boolean;
  isLastMessage?: boolean;
  onRegenerate?: () => void;
}

interface ParsedMessage {
  thinking?: string;
  content: string;
}

/**
 * Individual message bubble with avatar and content
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGenerating = false,
  isLastMessage = false,
  onRegenerate,
}) => {
  const isUser = message.role === "user";
  const { theme } = useTheme();
  const { isLoading: isEngineLoading, status } = useWebLLM();
  const [copiedStates, setCopiedStates] = React.useState<
    Record<string, boolean>
  >({});
  const [showSlowWarning, setShowSlowWarning] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);

  const isDark = theme === "dark";
  const isAiGenerating = !isUser && isGenerating && isLastMessage;
  const isModelReady = status === "Ready" && !isEngineLoading;

  // Parse thinking tags from message content
  const parseMessage = (content: string): ParsedMessage => {
    // Check if message starts with <think>
    if (content.startsWith("<think>")) {
      const thinkEndMatch = content.match(/<\/think>/);

      if (thinkEndMatch) {
        // Complete thinking block found
        const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
          const thinking = thinkMatch[1].trim();
          const remainingContent = content
            .replace(/<think>[\s\S]*?<\/think>/, "")
            .trim();
          return { thinking, content: remainingContent };
        }
      } else {
        // Incomplete thinking block - still generating
        const thinking = content.replace(/^<think>/, "").trim();
        return { thinking, content: "" };
      }
    }

    // Check for complete thinking blocks anywhere in content (original logic)
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkMatch) {
      const thinking = thinkMatch[1].trim();
      const remainingContent = content
        .replace(/<think>[\s\S]*?<\/think>/, "")
        .trim();
      return { thinking, content: remainingContent };
    }

    return { content };
  };

  const parsedMessage = parseMessage(message.content);

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

  const handleCopyCode = async (code: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedStates((prev) => ({ ...prev, [blockId]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [blockId]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
      toast.error("Failed to copy code");
    }
  };

  const handleCopyMessage = async () => {
    try {
      // Copy only the main content, not the thinking part
      await navigator.clipboard.writeText(parsedMessage.content);
      setMessageCopied(true);
      toast.success("Message copied to clipboard");
      setTimeout(() => {
        setMessageCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
      toast.error("Failed to copy message");
    }
  };

  // Generate unique ID for each code block
  let codeBlockCounter = 0;

  const CodeBlock: Components["code"] = ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const code = String(children).replace(/\n$/, "");
    const blockId = `${message.id}-code-${++codeBlockCounter}`;
    const isInline = !match;

    if (isInline) {
      return (
        <code
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <div className="relative group">
        <div className="flex items-center justify-between bg-muted px-3 py-2 rounded-t-lg border">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {language}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleCopyCode(code, blockId)}
          >
            {copiedStates[blockId] ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        <SyntaxHighlighter
          style={isDark ? oneDark : oneLight}
          language={language}
          PreTag="div"
          className="!m-0 !rounded-t-none !border-t-0"
          customStyle={{
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  };

  // If AI is generating but has no content yet, show loader without bubble
  if (isAiGenerating && !message.content.trim()) {
    return (
      <div className="flex justify-start group">
        <Avatar className="w-8 h-8 mr-3 mt-1">
          <AvatarImage src="" />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
          </AvatarFallback>
        </Avatar>
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
        <Avatar className="w-8 h-8 mr-3 mt-1">
          <AvatarImage src="" />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {isAiGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "🤖"
            )}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xl ${isUser ? "ml-auto" : ""}`}>
        {/* Thinking Section (only for AI) */}
        {!isUser && parsedMessage.thinking && (
          <div className="mb-2 p-3 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-muted-foreground">
                AI is thinking...
              </span>
            </div>
            <div className="text-sm text-muted-foreground italic whitespace-pre-wrap">
              {parsedMessage.thinking}
            </div>
          </div>
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
                    code: CodeBlock,
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
        {!isUser && parsedMessage.content.trim() && !isAiGenerating && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleCopyMessage}
            >
              {messageCopied ? (
                <>
                  <Check className="w-3 h-3 mr-1 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>

            {/* Show regenerate button always for last AI message, but disable if model not ready */}
            {!isUser && isLastMessage && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={onRegenerate}
                    disabled={!onRegenerate || !isModelReady}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {!isModelReady ? "Model is not ready" : "Regenerate response"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
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
        <Avatar className="w-8 h-8 ml-3 mt-1">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            💸
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
