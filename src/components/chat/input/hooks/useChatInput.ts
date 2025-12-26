import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "../../../../hooks/useConversations";
import { useConversationId } from "../../../../hooks/useConversationId";
import { useModel } from "../../../../providers/ModelProvider";
import { toast } from "sonner";
import { buildPrompt } from "./chatInputUtils";
import { showErrorToast } from "./useChatErrors";
import { useMessageStream } from "./useMessageStream";

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
    let aiMessageId: string | undefined;

    try {
      if (!currentConversationId) {
        const newConversationId = await createEmptyConversation();
        if (newConversationId) {
          currentConversationId = newConversationId;
          navigate(`/chat/${newConversationId}`);
        } else {
          throw new Error("Failed to create conversation");
        }
      }

      await addMessage(currentConversationId, {
        role: "user",
        content: messageContent,
      });

      aiMessageId = await addMessage(currentConversationId, {
        role: "assistant",
        content: "",
      });

      if (messages.length === 0) {
        const title =
          messageContent.slice(0, 50) + (messageContent.length > 50 ? "..." : "");
        await updateConversationTitle(currentConversationId, title);
      }

      if (currentModel) {
        const conversationMessages = buildPrompt(
          messages,
          messageContent,
          currentModel.type === "online"
        );

        const result = await streamResponse(conversationMessages, (content) => {
          updateMessage(currentConversationId!, aiMessageId!, content);
        });

        if (result.error) {
          showErrorToast(result.error, () => handleMessageSubmit(messageContent));
          updateMessage(
            currentConversationId,
            aiMessageId,
            "⚠️ Error generating response. Please try regenerating or check your API key configuration."
          );
        } else {
          await updateMessage(currentConversationId, aiMessageId, result.content);
        }
      }
    } catch (error) {
      showErrorToast(error);
      if (currentConversationId && aiMessageId) {
        updateMessage(
          currentConversationId,
          aiMessageId,
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
