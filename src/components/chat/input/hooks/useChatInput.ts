import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "../../../../hooks/useConversations";
import { useConversationId } from "../../../../hooks/useConversationId";
import { useModel } from "../../../../providers/ModelProvider";
import { COMPLETE_AI_RULES } from "../../../../lib/aiRules";
import type { OpenRouterMessage } from "../../../../lib/openrouter";
import { toast } from "sonner";

// Funkcja do skracania długich konwersacji
const summarizeConversation = (messages: OpenRouterMessage[], maxMessages: number = 10): OpenRouterMessage[] => {
  if (messages.length <= maxMessages) {
    return messages;
  }

  const systemMessages = messages.filter(msg => msg.role === 'system');
  const userAssistantMessages = messages.filter(msg => msg.role !== 'system');
  
  // Weź ostatnie maxMessages wiadomości user/assistant
  const recentMessages = userAssistantMessages.slice(-maxMessages);
  
  // Jeśli mamy więcej wiadomości, stwórz podsumowanie wcześniejszych
  const olderMessages = userAssistantMessages.slice(0, -maxMessages);
  
  if (olderMessages.length > 0) {
    // Grupuj wiadomości w pary user-assistant
    const conversationPairs = [];
    for (let i = 0; i < olderMessages.length; i += 2) {
      const userMsg = olderMessages[i];
      const assistantMsg = olderMessages[i + 1];
      if (userMsg && assistantMsg) {
        conversationPairs.push(`User: ${userMsg.content}\nAssistant: ${assistantMsg.content}`);
      } else if (userMsg) {
        conversationPairs.push(`User: ${userMsg.content}`);
      }
    }
    
    const summary = conversationPairs.join('\n\n');
    
    // Zamiast tworzyć nowy system message, dodaj podsumowanie do istniejącego
    const enhancedSystemMessages = systemMessages.map(msg => ({
      ...msg,
      content: `${msg.content}\n\nPrevious conversation summary:\n${summary}\n\nContinue the conversation based on this context.`
    }));
    
    return [...enhancedSystemMessages, ...recentMessages];
  }
  
  return [...systemMessages, ...recentMessages];
};

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
  const {
    createEmptyConversation,
    addMessage,
    updateMessage,
    updateConversationTitle,
    updateCompleteAIMessage,
  } = useConversations();
  const { messages } = useConversation(conversationId);
  const { currentModel, streamMessage } = useModel();

  // Keep useCallback for complex async function with abort controller logic
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  // Keep useCallback for very complex async function with many dependencies
  const handleMessageSubmit = useCallback(async (customMessage?: string) => {
    const messageContent = (customMessage || message).trim();
    if (!messageContent || isLoading || isGenerating) return;

    setIsLoading(true);
    setMessage("");

    let currentConversationId = conversationId;
    let aiMessageId: string | undefined;

    try {
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
      aiMessageId = await addMessage(currentConversationId, {
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
        let conversationMessages: OpenRouterMessage[];
        
        if (currentModel.type === "online") {
          // For online models (OpenRouter), combine history into context to avoid rate limiting
          // OpenRouter has limits on number of messages per request
          
          if (messages.length > 0) {
            // Combine previous messages into context
            const previousContext = messages
              .slice(-10) // Take only last 10 messages to keep context manageable
              .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
              .join('\n\n');
            
            // Create system message with rules and context
            const systemWithContext = `${COMPLETE_AI_RULES}

Previous conversation context:
${previousContext}`;

            conversationMessages = [
              { role: "system", content: systemWithContext },
              { role: "user", content: messageContent },
            ];
            
          } else {
            // First message - no previous context
            conversationMessages = [
              { role: "system", content: COMPLETE_AI_RULES },
              { role: "user", content: messageContent },
            ];
            
          }
        } else {
          // For local models, use full message history as before
          const allMessages: OpenRouterMessage[] = [
            { role: "system", content: COMPLETE_AI_RULES },
            ...messages.map(msg => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
            { role: "user", content: messageContent },
          ];

          // Skróć konwersację jeśli jest za długa (max 12 ostatnich wiadomości + system + podsumowanie)
          conversationMessages = summarizeConversation(allMessages, 12);
          
        }

        abortControllerRef.current = new AbortController();
        setIsGenerating(true);

        try {
          let accumulatedContent = '';
          
          for await (const chunk of streamMessage(
            conversationMessages,
            undefined,
            abortControllerRef.current.signal
          )) {
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
          if (aiMessageId) {
            await updateCompleteAIMessage(aiMessageId, accumulatedContent);
          }
        } catch (error) {
          console.error("Error generating response:", error);
          
          // Parse error message to provide better user feedback
          let errorMessage = "Failed to generate response. Please try again.";
          let actionLabel = "Regenerate";
          let actionCallback = () => window.location.reload();
          
          if (error instanceof Error) {
            const message = error.message.toLowerCase();
            
            if (message.includes('api key') || message.includes('unauthorized') || message.includes('401')) {
              errorMessage = "API key error. Please check your API key configuration in Settings.";
              actionLabel = "Open Settings";
              actionCallback = () => {
                // Try to open settings dialog/page - this is a simplified approach
                const settingsButton = document.querySelector('[data-settings-trigger]');
                if (settingsButton) {
                  (settingsButton as HTMLElement).click();
                } else {
                  window.location.reload();
                }
              };
            } else if (message.includes('model not found') || message.includes('model') || message.includes('unsupported')) {
              errorMessage = "Model configuration error. Please select a different model or check your settings.";
              actionLabel = "Select Model";
              actionCallback = () => {
                const modelSelector = document.querySelector('[data-model-selector]');
                if (modelSelector) {
                  (modelSelector as HTMLElement).click();
                } else {
                  window.location.reload();
                }
              };
            } else if (message.includes('timeout') || message.includes('network')) {
              errorMessage = "Network error. Please check your connection and try again.";
              actionLabel = "Retry";
              actionCallback = () => handleMessageSubmit(messageContent);
            } else if (message.includes('rate limit') || message.includes('quota') || message.includes('429')) {
              errorMessage = "API rate limit exceeded. OpenRouter is temporarily limiting requests. Please wait a moment and try again.";
              actionLabel = "Retry in 10s";
              actionCallback = () => {
                setTimeout(() => handleMessageSubmit(messageContent), 10000);
              };
            }
          }
          
          // Show error notification with appropriate action
          toast.error(errorMessage, {
            action: {
              label: actionLabel,
              onClick: actionCallback
            }
          });

          // Clean up empty AI message if it exists
          if (currentConversationId && aiMessageId) {
            updateMessage(currentConversationId, aiMessageId, "⚠️ Error generating response. Please try regenerating or check your API key configuration.");
          }
        } finally {
          setIsGenerating(false);
          abortControllerRef.current = null;
        }
      }
    } catch (error) {
      console.error("Outer catch - Error in message submit:", error);
      
      // Parse error message for outer catch as well
      let errorMessage = "Failed to send message. Please try again.";
      if (error instanceof Error && error.message.toLowerCase().includes('api key')) {
        errorMessage = "API key configuration error. Please check your settings.";
      }
      
      // Show error notification
      toast.error(errorMessage, {
        action: {
          label: "Retry",
          onClick: () => {
            window.location.reload();
          }
        }
      });

      // Clean up empty AI message if it exists
      if (currentConversationId && aiMessageId) {
        updateMessage(currentConversationId, aiMessageId, "⚠️ Error sending message. Please check your configuration and try again.");
      }
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
    updateCompleteAIMessage,
  ]);

  // Keep useCallback for complex async function with many dependencies
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
        let conversationMessages: OpenRouterMessage[];
        
        if (currentModel.type === "online") {
          // For online models (OpenRouter), combine history into context to avoid rate limiting
          const messagesToProcess = messages.slice(0, -1); // Exclude the last AI message
          
          if (messagesToProcess.length > 0) {
            // Combine previous messages into context
            const previousContext = messagesToProcess
              .slice(-10) // Take only last 10 messages to keep context manageable
              .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
              .join('\n\n');
            
            // Create system message with rules and context
            const systemWithContext = `${COMPLETE_AI_RULES}

Previous conversation context:
${previousContext}`;

            conversationMessages = [
              { role: "system", content: systemWithContext },
              { role: "user", content: "Please regenerate your last response based on the conversation context above." },
            ];
            
          } else {
            // No previous context
            conversationMessages = [
              { role: "system", content: COMPLETE_AI_RULES },
              { role: "user", content: "Please provide a response." },
            ];
            
          }
        } else {
          // For local models, use full message history as before
          const allMessages: OpenRouterMessage[] = [
            { role: "system", content: COMPLETE_AI_RULES },
            ...messages.slice(0, -1).map(msg => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
          ];

          // Skróć konwersację jeśli jest za długa
          conversationMessages = summarizeConversation(allMessages, 12);
          
        }

        setIsGenerating(true);
        abortControllerRef.current = new AbortController();

        try {
          let accumulatedContent = '';
          
          for await (const chunk of streamMessage(
            conversationMessages,
            undefined,
            abortControllerRef.current.signal
          )) {
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
          await updateCompleteAIMessage(lastAiMessage.id, accumulatedContent);
        } finally {
          setIsGenerating(false);
          abortControllerRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error regenerating response:", error);
      
      // Show error notification
      toast.error("Failed to regenerate response. Please try again.");
      
      // Set error message in the AI message
      updateMessage(conversationId, lastAiMessage.id, "⚠️ Error regenerating response. Please try again.");
    }
  }, [conversationId, messages, isLoading, isGenerating, currentModel, streamMessage, updateMessage, updateCompleteAIMessage]);

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