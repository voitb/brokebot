import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "../../../../hooks/useConversations";
import { useConversationId } from "../../../../hooks/useConversationId";
import { useModel } from "../../../../providers/ModelProvider";
import { toast } from "sonner";
import {
  findLastMessageByRole,
  buildPrompt,
  truncateTitle,
} from "../utils/chatInputUtils";
import { showErrorToast } from "../utils/chatErrorUtils";
import { useMessageStream } from "./useMessageStream";

const ERROR_GENERATING = "Error generating response. Please try regenerating or check your API key configuration.";
const ERROR_REGENERATING = "Error regenerating response. Please try again.";

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
        showErrorToast(error, () => handleMessageSubmit(content), navigate);
        updateMessage(activeConversationId, responseId, ERROR_GENERATING);
        return;
      }

      await updateMessage(activeConversationId, responseId, response);
    } catch (error) {
      showErrorToast(error, undefined, navigate);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateLastResponse = async () => {
    if (!conversationId || messages.length < 2 || isLoading || isGenerating) return;

    const lastAssistant = findLastMessageByRole(messages, "assistant");
    const lastUser = findLastMessageByRole(messages, "user");
    if (!lastAssistant || !lastUser || !currentModel) return;

    updateMessage(conversationId, lastAssistant.id, "");

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
        toast.error(ERROR_REGENERATING);
        updateMessage(conversationId, lastAssistant.id, ERROR_REGENERATING);
      }
    } catch (error) {
      showErrorToast(error, undefined, navigate);
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
