import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "../../../../hooks/useConversations";
import { useConversationId } from "../../../../hooks/useConversationId";
import { useWebLLM } from "../../../../providers/WebLLMProvider";

interface UseChatInputReturn {
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  isGenerating: boolean;
  handleMessageSubmit: (message?: string) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
}

export function useChatInput(): UseChatInputReturn {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const conversationId = useConversationId();
  const navigate = useNavigate();
  const { createConversation, addMessage, updateMessage, updateConversationTitle } = useConversations();
  const { conversation, messages } = useConversation(conversationId);
  const { engine, systemMessage } = useWebLLM();

  const generateAIResponse = useCallback(async (userMessage: string, aiMessageId: string, conversationId: string) => {
    if (!engine) return;

    setIsGenerating(true);
    
    try {
      let accumulatedResponse = "";

      const response = await engine.chat.completions.create({
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });

      // Stream the response
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          accumulatedResponse += content;
          
          // Update the message with accumulated content
          await updateMessage(conversationId, aiMessageId, accumulatedResponse);
        }
      }

      // Fallback if no content was streamed
      if (!accumulatedResponse.trim()) {
        await updateMessage(conversationId, aiMessageId, 
          "Sorry, I couldn't generate a response."
        );
      }

    } catch (aiError) {
      console.error("AI response error:", aiError);
      await updateMessage(conversationId, aiMessageId,
        "I'm sorry, I'm having trouble processing your request right now. Please try again later."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [engine, systemMessage, updateMessage]);

  const handleMessageSubmit = useCallback(async (messageToSend?: string) => {
    const messageContent = messageToSend || message;
    if (!messageContent.trim()) return;

    setIsLoading(true);
    
    // Clear input after submission
    if (!messageToSend) {
      setMessage("");
    }

    try {
      let currentConversationId = conversationId;

      // If no conversation ID, create new conversation
      if (!currentConversationId) {
        const title = messageContent.slice(0, 50) + (messageContent.length > 50 ? "..." : "");
        const newConversationId = await createConversation(title, messageContent);

        if (newConversationId) {
          currentConversationId = newConversationId;
          navigate(`/chat/${newConversationId}`);
        } else {
          throw new Error("Failed to create conversation");
        }
      } else {
        // Add user message to existing conversation (may be empty)
        await addMessage(currentConversationId, {
          role: "user",
          content: messageContent,
        });

        // If this is first message in empty conversation, update title
        if (conversation && conversation.messages.length === 0) {
          const title = messageContent.slice(0, 50) + (messageContent.length > 50 ? "..." : "");
          await updateConversationTitle(currentConversationId, title);
        }
      }

      setIsLoading(false);

      // If AI engine is ready, generate response
      if (engine && currentConversationId) {
        // Add placeholder for AI message that will be streamed
        const aiMessageId = await addMessage(currentConversationId, {
          role: "assistant",
          content: "",
        });

        await generateAIResponse(messageContent, aiMessageId, currentConversationId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  }, [message, conversationId, navigate, createConversation, addMessage, updateConversationTitle, conversation, engine, generateAIResponse]);

  const regenerateLastResponse = useCallback(async () => {
    if (!conversationId || !messages || messages.length < 2) return;

    // Find the last user message and AI response
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === "user");
    const lastAiMessage = [...messages].reverse().find(msg => msg.role === "assistant");

    if (!lastUserMessage || !lastAiMessage) return;

    // Clear the AI response and regenerate
    await updateMessage(conversationId, lastAiMessage.id, "");
    await generateAIResponse(lastUserMessage.content, lastAiMessage.id, conversationId);
  }, [conversationId, messages, updateMessage, generateAIResponse]);

  return {
    message,
    setMessage,
    isLoading,
    isGenerating,
    handleMessageSubmit,
    regenerateLastResponse,
  };
} 