import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "../../../../hooks/useConversations";
import { useConversationId } from "../../../../hooks/useConversationId";
import { useModel } from "../../../../providers/ModelProvider";
import { toast } from "sonner";
import { buildPrompt } from "../utils/chatInputUtils";
import { showErrorToast } from "../utils/chatErrorUtils";
import { useMessageStream } from "./useMessageStream";

const TITLE_MAX_LENGTH = 50;

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
    const messageContent = (customMessage || message).trim();
    if (!messageContent || isLoading || isGenerating) return;

    setIsLoading(true);
    setMessage("");

    let currentConversationId = conversationId;
    let responseMessageId: string | undefined;
    let isNewConversation = false;

    try {
      if (!currentConversationId) {
        const newConversationId = await createEmptyConversation();
        if (newConversationId) {
          currentConversationId = newConversationId;
          isNewConversation = true;
          navigate(`/chat/${newConversationId}`);
        } else {
          throw new Error("Failed to create conversation");
        }
      }

      await addMessage(currentConversationId, {
        role: "user",
        content: messageContent,
      });

      responseMessageId = await addMessage(currentConversationId, {
        role: "assistant",
        content: "",
      });

      if (isNewConversation) {
        const title =
          messageContent.slice(0, TITLE_MAX_LENGTH) +
          (messageContent.length > TITLE_MAX_LENGTH ? "..." : "");
        await updateConversationTitle(currentConversationId, title);
      }

      if (!responseMessageId || !currentConversationId || !currentModel) {
        throw new Error("Failed to create response message");
      }

      const conversationMessages = buildPrompt(
        messages,
        messageContent,
        currentModel.type === "online"
      );

      const result = await streamResponse(conversationMessages, (content) => {
        updateMessage(currentConversationId as string, responseMessageId as string, content);
      });

      if (result.error) {
        showErrorToast(result.error, () => handleMessageSubmit(messageContent), navigate);
        updateMessage(
          currentConversationId,
          responseMessageId,
          "⚠️ Error generating response. Please try regenerating or check your API key configuration."
        );
      } else {
        await updateMessage(currentConversationId, responseMessageId, result.content);
      }
    } catch (error) {
      showErrorToast(error, undefined, navigate);
      if (currentConversationId && responseMessageId) {
        updateMessage(
          currentConversationId,
          responseMessageId,
          "⚠️ Error sending message. Please check your configuration and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateLastResponse = async () => {
    if (!conversationId || messages.length < 2 || isLoading || isGenerating) return;

    const lastAiMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === "assistant");
    if (!lastAiMessage) return;

    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === "user");
    if (!lastUserMessage) return;

    updateMessage(conversationId, lastAiMessage.id, "");

    try {
      if (currentModel) {
        const messagesToProcess = messages.slice(0, -1);
        const conversationMessages = buildPrompt(
          messagesToProcess,
          lastUserMessage.content,
          currentModel.type === "online"
        );

        const result = await streamResponse(conversationMessages, (content) => {
          updateMessage(conversationId, lastAiMessage.id, content);
        });

        if (result.error) {
          toast.error("Failed to regenerate response. Please try again.");
          updateMessage(
            conversationId,
            lastAiMessage.id,
            "⚠️ Error regenerating response. Please try again."
          );
        } else {
          await updateMessage(conversationId, lastAiMessage.id, result.content);
        }
      }
    } catch (error) {
      showErrorToast(error, undefined, navigate);
      updateMessage(
        conversationId,
        lastAiMessage.id,
        "⚠️ Error regenerating response. Please try again."
      );
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
