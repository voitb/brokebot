import type { OpenRouterMessage } from "@/features/chat/api/openrouter";
import { COMPLETE_AI_RULES, CONTEXTUAL_PROMPT_TEMPLATE } from "@/features/chat/constants/prompts";
import type { AttachedFile } from "./file-upload-utils";

const TITLE_MAX_LENGTH = 50;

export const ERROR_MESSAGE_PREFIX = "[ERROR]: ";

export type PromptMode = "online" | "local";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function findLastMessageByRole(
  messages: Message[],
  role: "user" | "assistant"
): Message | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === role) return messages[i];
  }
  return undefined;
}

export function truncateTitle(message: string, maxLength: number = TITLE_MAX_LENGTH): string {
  return message.slice(0, maxLength) + (message.length > maxLength ? "..." : "");
}

export function summarizeConversation(
  messages: OpenRouterMessage[],
  maxMessages: number = 10
): OpenRouterMessage[] {
  if (messages.length <= maxMessages) {
    return messages;
  }

  const systemMessages = messages.filter((msg) => msg.role === "system");
  const userAssistantMessages = messages.filter((msg) => msg.role !== "system");

  const recentMessages = userAssistantMessages.slice(-maxMessages);
  const olderMessages = userAssistantMessages.slice(0, -maxMessages);

  if (olderMessages.length > 0) {
    const conversationPairs: string[] = [];
    for (let i = 0; i < olderMessages.length; i += 2) {
      const userMsg = olderMessages[i];
      const assistantMsg = olderMessages[i + 1];
      if (userMsg && assistantMsg) {
        conversationPairs.push(
          `User: ${userMsg.content}\nAssistant: ${assistantMsg.content}`
        );
      } else if (userMsg) {
        conversationPairs.push(`User: ${userMsg.content}`);
      }
    }

    const summary = conversationPairs.join("\n\n");

    const enhancedSystemMessages = systemMessages.map((msg) => ({
      ...msg,
      content: `${msg.content}\n\nPrevious conversation summary:\n${summary}\n\nContinue the conversation based on this context.`,
    }));

    return [...enhancedSystemMessages, ...recentMessages];
  }

  return [...systemMessages, ...recentMessages];
}

export function buildPrompt(
  messages: OpenRouterMessage[],
  messageContent: string,
  options: { mode: PromptMode }
): OpenRouterMessage[] {
  const filteredMessages = messages.filter(
    (msg) => !msg.content.startsWith(ERROR_MESSAGE_PREFIX)
  );

  if (options.mode === "online") {
    const history = filteredMessages
      .slice(-10)
      .map(
        (msg) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n\n");

    const systemPrompt = CONTEXTUAL_PROMPT_TEMPLATE.replace(
      "{conversation_history}",
      history
    );
    return [
      { role: "system", content: systemPrompt },
      { role: "user", content: messageContent },
    ];
  }

  const conversationMessages: OpenRouterMessage[] = [
    { role: "system", content: COMPLETE_AI_RULES },
    ...filteredMessages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: messageContent },
  ];

  return summarizeConversation(conversationMessages, 12);
}

export function formatAttachedFiles(files: AttachedFile[]): string {
  if (files.length === 0) return "";

  return files
    .map((f) => {
      const safeName = f.file.name.replace(/[<>&"']/g, "");
      return `<file name="${safeName}">\n${f.content}\n</file>`;
    })
    .join("\n\n");
}

export function buildMessageWithFiles(message: string, files: AttachedFile[]): string {
  const fileContents = formatAttachedFiles(files);
  if (!fileContents) return message;
  return `${message}\n\n${fileContents}`.trim();
}
