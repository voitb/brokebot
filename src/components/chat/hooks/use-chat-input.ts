import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "@/hooks/use-conversations";
import { useConversationId } from "@/hooks/use-conversation-id";
import { useModel } from "@/providers/model-provider";
import {
  findLastMessageByRole,
  buildPrompt,
  truncateTitle,
  ERROR_MESSAGE_PREFIX,
} from "@/components/chat/input/utils/chat-input-utils";
import { showErrorToast } from "@/components/chat/input/utils/chat-error-utils";
import { useMessageStream } from "./use-message-stream";

const ERROR_GENERATING = `${ERROR_MESSAGE_PREFIX}Error generating response. Please try regenerating or check your API key configuration.`;
const ERROR_REGENERATING = `${ERROR_MESSAGE_PREFIX}Error regenerating response. Please try again.`;

interface UseChatInputReturn {
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  isGenerating: boolean;
  handleMessageSubmit: (message?: string) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
  stopGeneration: () => void;
}

export function useChatInput(): UseChatInputReturn {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const conversationId = useConversationId();
  const navigate = useNavigate();

  const {
    createEmptyConversation,
    addMessage,
    updateMessage,
    updateConversationTitle,
  } = useConversations();
  const { messages } = useConversation(conversationId);
  const { currentModel } = useModel();
  const { isGenerating, streamResponse, stopGeneration } = useMessageStream();

  const handleMessageSubmit = async (customMessage?: string) => {
    const content = (customMessage || message).trim();
    if (!content || isLoading || isGenerating) return;
    if (!currentModel) return;

    setIsLoading(true);
    setMessage("");

    try {
      const activeConversationId = conversationId ?? await createEmptyConversation();
      if (!activeConversationId) throw new Error("Failed to create conversation");

      const isNew = !conversationId;
      if (isNew) navigate(`/chat/${activeConversationId}`);

      await addMessage(activeConversationId, { role: "user", content });
      const responseId = await addMessage(activeConversationId, { role: "assistant", content: "" });
      if (!responseId) throw new Error("Failed to create response message");

      if (isNew) await updateConversationTitle(activeConversationId, truncateTitle(content));

      const prompt = buildPrompt(messages, content, { mode: currentModel.type === "online" ? "online" : "local" });
      const { content: response, error } = await streamResponse(prompt, (chunk) => {
        updateMessage(activeConversationId, responseId, chunk);
      });

      if (error) {
        showErrorToast(error, { onRetry: () => handleMessageSubmit(content), navigate });
        updateMessage(activeConversationId, responseId, ERROR_GENERATING);
        return;
      }

      await updateMessage(activeConversationId, responseId, response);
    } catch (error) {
      showErrorToast(error, { navigate });
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateLastResponse = async () => {
    if (!conversationId || messages.length < 2 || isLoading || isGenerating) return;

    const lastAssistant = findLastMessageByRole(messages, "assistant");
    const lastUser = findLastMessageByRole(messages, "user");
    if (!lastAssistant || !lastUser || !currentModel) return;

    await updateMessage(conversationId, lastAssistant.id, "");

    try {
      const prompt = buildPrompt(
        messages.slice(0, -1),
        lastUser.content,
        { mode: currentModel.type === "online" ? "online" : "local" }
      );

      const { error } = await streamResponse(prompt, (chunk) => {
        updateMessage(conversationId, lastAssistant.id, chunk);
      });

      if (error) {
        showErrorToast(error, { onRetry: () => regenerateLastResponse(), navigate });
        updateMessage(conversationId, lastAssistant.id, ERROR_REGENERATING);
      }
    } catch (error) {
      showErrorToast(error, { navigate });
      updateMessage(conversationId, lastAssistant.id, ERROR_REGENERATING);
    }
  };

  return {
    message,
    setMessage,
    isLoading,
    isGenerating,
    handleMessageSubmit,
    regenerateLastResponse,
    stopGeneration,
  };
}
