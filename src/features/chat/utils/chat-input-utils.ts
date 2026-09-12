import { toast } from "sonner";

import type { OpenRouterMessage } from "@/features/chat/api/openrouter";
import { COMPLETE_AI_RULES, CONTEXTUAL_PROMPT_TEMPLATE } from "@/features/chat/constants/prompts";
import type { AttachedFile } from "./file-upload-utils";
import { escapeFileTagClosers, parseMessage } from "./parse-message";
import type { Message } from "@/lib/db";

const TITLE_MAX_LENGTH = 50;

// the default local model runs a 4096-token context; ~4 characters per token, minus room for the reply
const LOCAL_PROMPT_CHAR_BUDGET = 12_000;

// online models take far more context, but the request body still needs a ceiling
const ONLINE_PROMPT_CHAR_BUDGET = 400_000;

// the attachments of one message ride in that body too, so they get the same ceiling
const ATTACHMENT_TOTAL_CHAR_BUDGET = 400_000;

export const ERROR_MESSAGE_PREFIX = "[ERROR]: ";

export const WAITING_FOR_SHARED_ENGINE = "Waiting for the reply in another conversation…";

export type PromptMode = "online" | "local";

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
  const characters = Array.from(message);
  return characters.slice(0, maxLength).join("") + (characters.length > maxLength ? "..." : "");
}

export function buildConversationTitle(message: string): string {
  const { content, attachments } = parseMessage(message, { extractThinking: false });
  return truncateTitle(content || attachments[0]?.name || message);
}

const SUMMARY_HEADER = "\n\nPrevious conversation summary:\n";
const SUMMARY_FOOTER = "\n\nContinue the conversation based on this context.";

function totalLength(messages: OpenRouterMessage[]): number {
  return messages.reduce((sum, msg) => sum + msg.content.length, 0);
}

function takeNewestWithin<T>(items: T[], size: (item: T) => number, budget: number): T[] {
  const kept: T[] = [];
  let remaining = budget;

  for (let i = items.length - 1; i >= 0; i--) {
    remaining -= size(items[i]);
    if (remaining < 0) break;
    kept.unshift(items[i]);
  }

  return kept;
}

export function summarizeConversation(
  messages: OpenRouterMessage[],
  maxMessages: number = 10
): OpenRouterMessage[] {
  const systemMessages = messages.filter((msg) => msg.role === "system");
  const userAssistantMessages = messages.filter((msg) => msg.role !== "system");

  const budget = LOCAL_PROMPT_CHAR_BUDGET - totalLength(systemMessages);
  const recent = userAssistantMessages.slice(-maxMessages);
  const withinBudget = takeNewestWithin(recent, (msg) => msg.content.length, budget);
  const recentMessages = withinBudget.length > 0 ? withinBudget : recent.slice(-1);

  const summaryLines = takeNewestWithin(
    userAssistantMessages
      .slice(0, -maxMessages)
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`),
    (line) => line.length + 1,
    budget -
      totalLength(recentMessages) -
      systemMessages.length * (SUMMARY_HEADER.length + SUMMARY_FOOTER.length)
  );

  if (summaryLines.length === 0) {
    return [...systemMessages, ...recentMessages];
  }

  const summary = summaryLines.join("\n");

  const enhancedSystemMessages = systemMessages.map((msg) => ({
    ...msg,
    content: `${msg.content}${SUMMARY_HEADER}${summary}${SUMMARY_FOOTER}`,
  }));

  return [...enhancedSystemMessages, ...recentMessages];
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
    const historyLines = filteredMessages
      .slice(-10)
      .map(
        (msg) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      );

    const budget =
      ONLINE_PROMPT_CHAR_BUDGET - CONTEXTUAL_PROMPT_TEMPLATE.length - messageContent.length;
    const history = takeNewestWithin(historyLines, (line) => line.length + 2, budget).join("\n\n");

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
      const safeName = f.file.name.replace(/[<>&"']/g, "") || "attachment";
      return `<file name="${safeName}">\n${escapeFileTagClosers(f.content)}\n</file>`;
    })
    .join("\n\n");
}

function selectFilesWithinBudget(files: AttachedFile[]): AttachedFile[] {
  return takeNewestWithin(files, (file) => file.content.length, ATTACHMENT_TOTAL_CHAR_BUDGET);
}

export interface BuiltMessage {
  message: string;
  sent: AttachedFile[];
}

export function buildMessageWithFiles(message: string, files: AttachedFile[]): BuiltMessage {
  const sent = selectFilesWithinBudget(files);

  if (sent.length < files.length) {
    const dropped = files
      .slice(0, files.length - sent.length)
      .map((file) => file.file.name)
      .join(", ");
    toast.info(`Too much attached text for one message. Not sent: ${dropped}. They stay attached for your next message.`);
  }

  const fileContents = formatAttachedFiles(sent);
  if (!fileContents) return { message, sent };
  return { message: `${message}\n\n${fileContents}`.trim(), sent };
}
