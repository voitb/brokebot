import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "../../../../hooks/useConversations";
import { useConversationId } from "../../../../hooks/useConversationId";
import { useWebLLM } from "../../../../providers/WebLLMProvider";

interface UseChatInputReturn {
  isLoading: boolean;
  isGenerating: boolean;
  handleMessageSubmit: (message: string) => Promise<void>;
}

export function useChatInput(): UseChatInputReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const conversationId = useConversationId();
  const navigate = useNavigate();
  const { createConversation, addMessage, updateMessage, updateConversationTitle } = useConversations();
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

      setIsLoading(false);

      // If AI engine is ready, generate response
      if (engine && currentConversationId) {
        setIsGenerating(true);
        
        try {
          // Add placeholder for AI message that will be streamed
          const aiMessageId = await addMessage(currentConversationId, {
            role: "assistant",
            content: "",
          });

          let accumulatedResponse = "";

          const response = await engine.chat.completions.create({
            messages: [{ role: "user", content: message }],
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
              await updateMessage(currentConversationId, aiMessageId, accumulatedResponse);
            }
          }

          // Fallback if no content was streamed
          if (!accumulatedResponse.trim()) {
            await updateMessage(currentConversationId, aiMessageId, 
              "Sorry, I couldn't generate a response."
            );
          }

        } catch (aiError) {
          console.error("AI response error:", aiError);
          await addMessage(currentConversationId, {
            role: "assistant",
            content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
          });
        } finally {
          setIsGenerating(false);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  }, [conversationId, navigate, createConversation, addMessage, updateConversationTitle, conversation, engine]);

  return {
    isLoading,
    isGenerating,
    handleMessageSubmit,
  };
} 