import type { OpenRouterMessage } from "@/lib/openrouter";
import { COMPLETE_AI_RULES, CONTEXTUAL_PROMPT_TEMPLATE } from "@/constants/prompts";

/**
 * Summarizes long conversations by keeping recent messages and adding earlier context as a summary
 */
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

/**
 * Builds the prompt for AI model consumption
 */
export function buildPrompt(
  messages: OpenRouterMessage[],
  messageContent: string,
  isOnline: boolean
): OpenRouterMessage[] {
  const filteredMessages = messages.filter(
    (msg) => !msg.content.startsWith("Error ")
  );

  if (isOnline) {
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
