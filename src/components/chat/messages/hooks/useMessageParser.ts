import { useMemo } from "react";

interface ParsedMessage {
  thinking?: string;
  content: string;
}

/**
 * Hook for parsing message content with thinking tags
 */
export function useMessageParser(content: string): ParsedMessage {
  return useMemo(() => {
    // First check for complete thinking blocks anywhere in content
    const completeThinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
    if (completeThinkMatch) {
      const thinking = completeThinkMatch[1].trim();
      const remainingContent = content
        .replace(/<think>[\s\S]*?<\/think>/g, "")
        .trim();
      return { thinking, content: remainingContent };
    }

    // Check if message starts with <think> but has no closing tag (still generating)
    if (content.startsWith("<think>")) {
      const thinking = content.replace(/^<think>/, "").trim();
      return { thinking, content: "" };
    }

    // Check if content only contains </think> (end of thinking, no content yet)
    if (content.trim() === "</think>") {
      return { content: "" };
    }

    // Check if content starts with </think> (thinking ended, now content starts)
    if (content.startsWith("</think>")) {
      const remainingContent = content.replace(/^<\/think>/, "").trim();
      return { content: remainingContent };
    }

    return { content };
  }, [content]);
} 