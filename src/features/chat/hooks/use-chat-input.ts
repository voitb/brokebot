import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useConversations } from "@/hooks/use-conversations";
import { useConversationId } from "@/hooks/use-conversation-id";
import { useModel } from "@/hooks/use-model";
import {
  findLastMessageByRole,
  buildPrompt,
  buildConversationTitle,
  ERROR_MESSAGE_PREFIX,
  WAITING_FOR_SHARED_ENGINE,
} from "@/features/chat/utils/chat-input-utils";
import { showErrorToast } from "@/features/chat/utils/chat-error-utils";
import type { OpenRouterMessage } from "@/features/chat/api/openrouter";
import { useActiveConversation } from "./use-active-conversation";
import { useMessageStream } from "./use-message-stream";
import { useIsGenerating, useIsWaitingForSharedEngine } from "./active-generations";

const ERROR_GENERATING_ONLINE = `${ERROR_MESSAGE_PREFIX}Error generating response. Please try regenerating or check your API key configuration.`;
const ERROR_GENERATING_LOCAL = `${ERROR_MESSAGE_PREFIX}Error generating response. Please try regenerating or reloading the local model.`;
const ERROR_REGENERATING = `${ERROR_MESSAGE_PREFIX}Error regenerating response. Please try again.`;
const UNSENT_PREFIX = `${ERROR_MESSAGE_PREFIX}Not sent: `;
const TRUNCATED_REPLY = "The reply hit the token limit and was cut off.";

interface UseChatInputReturn {
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  isGenerating: boolean;
  isWaitingForSharedEngine: boolean;
  handleMessageSubmit: (message?: string) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
  stopGeneration: () => void;
}

export function useChatInput(): UseChatInputReturn {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const conversationId = useConversationId();
  const navigate = useNavigate();

  const { addMessage, updateMessage, updateConversationTitle } = useConversations();
  const { messages } = useActiveConversation();
  const { currentModel } = useModel();
  const { streamResponse, stopGeneration } = useMessageStream();
  const isGenerating = useIsGenerating(conversationId);
  const isWaitingForSharedEngine = useIsWaitingForSharedEngine(
    conversationId,
    currentModel?.type === "local"
  );

  const streamIntoResponse = async (
    targetConversationId: string,
    responseId: string,
    prompt: OpenRouterMessage[],
    errorPlaceholder: string
  ): Promise<void> => {
    const chunkWrites: Promise<void>[] = [];

    const { content, error, isTruncated } = await streamResponse(
      targetConversationId,
      prompt,
      (chunk) => {
        const write = updateMessage(targetConversationId, responseId, chunk);
        chunkWrites.push(write);
        // observed by the Promise.all below; this only keeps a failed chunk write from
        // being reported as an unhandled rejection before that await reaches it
        write.catch(() => undefined);
      }
    );

    await Promise.all(chunkWrites);

    if (error) {
      showErrorToast(error, {
        onRetry: () => {
          streamIntoResponse(targetConversationId, responseId, prompt, errorPlaceholder).catch(
            (retryError: unknown) => showErrorToast(retryError, { navigate })
          );
        },
        navigate,
      });
      await updateMessage(targetConversationId, responseId, errorPlaceholder);
      return;
    }

    if (isTruncated) {
      toast.info(TRUNCATED_REPLY);
    }

    await updateMessage(targetConversationId, responseId, content);
  };

  const handleMessageSubmit = async (customMessage?: string) => {
    const content = (customMessage || message).trim();
    if (!conversationId || !content || isLoading || isGenerating) return;
    if (!currentModel) return;

    setIsLoading(true);
    setMessage("");

    try {
      const isFirstMessage = messages.length === 0;
      const userMessageId = await addMessage(conversationId, { role: "user", content });

      let responseId: string;
      try {
        responseId = await addMessage(conversationId, { role: "assistant", content: "" });
      } catch (error) {
        await updateMessage(conversationId, userMessageId, `${UNSENT_PREFIX}${content}`);
        throw error;
      }

      if (isFirstMessage) {
        await updateConversationTitle(conversationId, buildConversationTitle(content));
      }

      const isOnline = currentModel.type === "online";
      const prompt = buildPrompt(messages, content, { mode: isOnline ? "online" : "local" });
      await streamIntoResponse(
        conversationId,
        responseId,
        prompt,
        isOnline ? ERROR_GENERATING_ONLINE : ERROR_GENERATING_LOCAL
      );
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateLastResponse = async () => {
    if (!conversationId || messages.length < 2 || isLoading || isGenerating) return;
    if (isWaitingForSharedEngine) {
      toast.info(WAITING_FOR_SHARED_ENGINE);
      return;
    }

    const lastAssistant = findLastMessageByRole(messages, "assistant");
    const lastUser = findLastMessageByRole(messages, "user");
    if (!lastAssistant || !lastUser || !currentModel) return;

    await updateMessage(conversationId, lastAssistant.id, "");

    try {
      const historyBeforeLastUser = messages.slice(0, messages.lastIndexOf(lastUser));
      const prompt = buildPrompt(historyBeforeLastUser, lastUser.content, {
        mode: currentModel.type === "online" ? "online" : "local",
      });

      await streamIntoResponse(conversationId, lastAssistant.id, prompt, ERROR_REGENERATING);
    } catch {
      await updateMessage(conversationId, lastAssistant.id, ERROR_REGENERATING);
    }
  };

  return {
    message,
    setMessage,
    isLoading,
    isGenerating,
    isWaitingForSharedEngine,
    handleMessageSubmit,
    regenerateLastResponse,
    stopGeneration: () => {
      if (conversationId) stopGeneration(conversationId);
    },
  };
}
