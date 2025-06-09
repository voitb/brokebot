import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "../../../../hooks/useConversations";
import { useWebLLM } from "../../../../providers/WebLLMProvider";

interface UseChatInputReturn {
  isLoading: boolean;
  handleMessageSubmit: (message: string) => Promise<void>;
}

export function useChatInput(): UseChatInputReturn {
  const [isLoading, setIsLoading] = useState(false);
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { createConversation, addMessage, updateConversationTitle } = useConversations();
  const { conversation } = useConversation(conversationId);
  const { engine } = useWebLLM();

  const handleMessageSubmit = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);

    try {
      let currentConversationId = conversationId;

      // If no conversation ID, create new conversation
      if (!currentConversationId) {
        const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
        const newConversationId = await createConversation(title, message);

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
          content: message,
        });

        // If this is first message in empty conversation, update title
        if (conversation && conversation.messages.length === 0) {
          const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
          await updateConversationTitle(currentConversationId, title);
        }
      }

      // If AI engine is ready, generate response
      if (engine && currentConversationId) {
        try {
          const response = await engine.chat.completions.create({
            messages: [{ role: "user", content: message }],
            temperature: 0.7,
            max_tokens: 1000,
          });

          const aiResponse = response.choices[0]?.message?.content ||
            "Sorry, I couldn't generate a response.";

          await addMessage(currentConversationId, {
            role: "assistant",
            content: aiResponse,
          });
        } catch (aiError) {
          console.error("AI response error:", aiError);
          await addMessage(currentConversationId, {
            role: "assistant",
            content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, navigate, createConversation, addMessage, updateConversationTitle, conversation, engine]);

  return {
    isLoading,
    handleMessageSubmit,
  };
} 