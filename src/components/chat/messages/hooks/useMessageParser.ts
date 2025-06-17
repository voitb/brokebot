import { useMemo } from "react";

interface ParsedMessage {
  thinking?: string;
  content: string;
  attachments: { name: string }[];
}

const fileTagRegex = /<file name="([^"]+)">[\s\S]*?<\/file>/g;

// Alternative think tag patterns that AI might use
const alternativeThinkPatterns = [
  /◁think▷([\s\S]*?)◁\/think▷/g,  // ◁think▷...◁/think▷
  /\[think\]([\s\S]*?)\[\/think\]/g,  // [think]...[/think]
  /\*think\*([\s\S]*?)\*\/think\*/g,  // *think*...*\/think*
];

/**
 * Hook for parsing message content with thinking and file tags
 */
export function useMessageParser(content: string | undefined): ParsedMessage {
  return useMemo(() => {
    // Ensure content is always a string
    if (!content || typeof content !== 'string') {
      return { content: '', attachments: [] };
    }
    
    let processedContent = content;

    // Extract attachments first
    const attachments: { name: string }[] = [];
    const matches = [...processedContent.matchAll(fileTagRegex)];
    matches.forEach(match => {
      attachments.push({ name: match[1] });
    });

    // Remove file tags from content
    processedContent = processedContent.replace(fileTagRegex, "").trim();

    // Check for alternative think patterns first
    for (const pattern of alternativeThinkPatterns) {
      const match = processedContent.match(pattern);
      if (match) {
        const thinking = match[1]?.trim() || '';
        const remainingContent = processedContent
          .replace(pattern, "")
          .trim();
        return { thinking, content: remainingContent, attachments };
      }
    }

    // First check for complete thinking blocks anywhere in content
    const completeThinkMatch = processedContent.match(/<think>([\s\S]*?)<\/think>/);
    if (completeThinkMatch) {
      const thinking = completeThinkMatch[1]?.trim() || '';
      const remainingContent = processedContent
        .replace(/<think>[\s\S]*?<\/think>/g, "")
        .trim();
      return { thinking, content: remainingContent, attachments };
    }

    // Check if message starts with <think> but has no closing tag (still generating)
    if (processedContent.startsWith("<think>")) {
      const thinking = processedContent.replace(/^<think>/, "").trim();
      return { thinking, content: "", attachments };
    }

    // Check for alternative opening patterns
    if (processedContent.startsWith("◁think▷")) {
      const thinking = processedContent.replace(/^◁think▷/, "").trim();
      return { thinking, content: "", attachments };
    }

    if (processedContent.startsWith("[think]")) {
      const thinking = processedContent.replace(/^\[think\]/, "").trim();
      return { thinking, content: "", attachments };
    }

    // Check if content only contains </think> (end of thinking, no content yet)
    if (processedContent.trim() === "</think>" || 
        processedContent.trim() === "◁/think▷" || 
        processedContent.trim() === "[/think]") {
      return { content: "", attachments };
    }

    // Check if content starts with </think> (thinking ended, now content starts)
    if (processedContent.startsWith("</think>")) {
      const remainingContent = processedContent.replace(/^<\/think>/, "").trim();
      return { content: remainingContent, attachments };
    }

    if (processedContent.startsWith("◁/think▷")) {
      const remainingContent = processedContent.replace(/^◁\/think▷/, "").trim();
      return { content: remainingContent, attachments };
    }

    if (processedContent.startsWith("[/think]")) {
      const remainingContent = processedContent.replace(/^\[\/think\]/, "").trim();
      return { content: remainingContent, attachments };
    }

    return { content: processedContent, attachments };
  }, [content]);
}