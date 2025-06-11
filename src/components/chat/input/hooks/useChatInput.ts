import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "../../../../hooks/useConversations";
import { useConversationId } from "../../../../hooks/useConversationId";
import { useModel } from "../../../../providers/ModelProvider";
import { COMPLETE_AI_RULES } from "../../../../lib/aiRules";
import type { OpenRouterMessage } from "../../../../lib/openrouter";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const conversationId = useConversationId();
  const navigate = useNavigate();
  const { createEmptyConversation, addMessage, updateMessage, updateConversationTitle } = useConversations();
  const { messages } = useConversation(conversationId);
  const { currentModel, streamMessage } = useModel();

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  const handleMessageSubmit = useCallback(async (customMessage?: string) => {
    const messageContent = (customMessage || message).trim();
    if (!messageContent || isLoading || isGenerating) return;

    setIsLoading(true);
    setMessage("");

    try {
      let currentConversationId = conversationId;

      // Create new conversation if needed
      if (!currentConversationId) {
        const newConversationId = await createEmptyConversation();
        if (newConversationId) {
          currentConversationId = newConversationId;
          navigate(`/conversation/${newConversationId}`);
        } else {
          throw new Error("Failed to create conversation");
        }
      }

      // Add user message
      await addMessage(currentConversationId, {
        role: "user",
        content: messageContent,
      });

      // Create placeholder AI message
      const aiMessageId = await addMessage(currentConversationId, {
        role: "assistant",
        content: "",
      });

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        const title = messageContent.slice(0, 50) + (messageContent.length > 50 ? "..." : "");
        await updateConversationTitle(currentConversationId, title);
      }

      // Generate AI response
      if (currentModel) {
        console.log(`Generating response with model: ${currentModel.name} (${currentModel.type})`);
        
        // Prepare messages for AI including system message
        const conversationMessages: OpenRouterMessage[] = [
          { role: "system", content: COMPLETE_AI_RULES },
          ...messages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
          { role: "user", content: messageContent },
        ];

        console.log('Messages being sent:', conversationMessages);

        abortControllerRef.current = new AbortController();
        setIsGenerating(true);

        try {
          let accumulatedContent = '';
          
          for await (const chunk of streamMessage(conversationMessages)) {
            // Check if generation was aborted
            if (abortControllerRef.current?.signal.aborted) {
              break;
            }

            if (chunk.error) {
              throw new Error(chunk.error);
            }

            accumulatedContent = chunk.content;
            
            // Update message with current content
            updateMessage(currentConversationId, aiMessageId, accumulatedContent);

            if (chunk.isComplete) {
              break;
            }
          }

          console.log('Response generated:', accumulatedContent);
        } finally {
          setIsGenerating(false);
          abortControllerRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    message,
    isLoading,
    isGenerating,
    conversationId,
    createEmptyConversation,
    navigate,
    addMessage,
    messages,
    updateConversationTitle,
    currentModel,
    streamMessage,
    updateMessage,
  ]);

  const regenerateLastResponse = useCallback(async () => {
    if (!conversationId || messages.length < 2 || isLoading || isGenerating) return;

    // Find the last AI message
    const lastAiMessage = messages.slice().reverse().find(msg => msg.role === "assistant");
    if (!lastAiMessage) return;

    try {
      // Clear the last AI message content
      updateMessage(conversationId, lastAiMessage.id, "");

      // Get messages up to the last user message
      const lastUserMessage = messages.slice().reverse().find(msg => msg.role === "user");
      if (!lastUserMessage) return;

      // Generate response with existing messages
      if (currentModel) {
        const conversationMessages: OpenRouterMessage[] = [
          { role: "system", content: COMPLETE_AI_RULES },
          ...messages.slice(0, -1).map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        ];

        setIsGenerating(true);
        abortControllerRef.current = new AbortController();

        try {
          let accumulatedContent = '';
          
          for await (const chunk of streamMessage(conversationMessages)) {
            if (abortControllerRef.current?.signal.aborted) {
              break;
            }

            if (chunk.error) {
              throw new Error(chunk.error);
            }

            accumulatedContent = chunk.content;
            updateMessage(conversationId, lastAiMessage.id, accumulatedContent);

            if (chunk.isComplete) {
              break;
            }
          }
        } finally {
          setIsGenerating(false);
          abortControllerRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error regenerating response:", error);
    }
  }, [conversationId, messages, isLoading, isGenerating, currentModel, streamMessage, updateMessage]);

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