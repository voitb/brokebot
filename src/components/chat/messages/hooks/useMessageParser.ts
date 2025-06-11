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
  }, [content]);
} 