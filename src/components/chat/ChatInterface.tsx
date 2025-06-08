import { useState } from "react";
import { useParams } from "react-router-dom";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import type { Message, ModelType } from "../../types";

export function ChatInterface() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>("local");

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: Date.now(),
      conversationId: parseInt(conversationId || "1"),
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    // AI logic will be here - different based on selectedModel
    setTimeout(() => {
      const modelName =
        selectedModel === "local"
          ? "Local AI (WebLLM)"
          : selectedModel === "gemini"
          ? "Gemini 2.5 Pro"
          : selectedModel === "gpt-4"
          ? "GPT-4 Turbo"
          : "Claude 3.5 Sonnet";

      const aiResponse: Message = {
        id: Date.now() + 1,
        conversationId: parseInt(conversationId || "1"),
        role: "assistant",
        content: `Hello! Here's **${modelName}** 🤖

Welcome to **BrokeBot** - your free AI assistant! 💸

I can help you with:
• **Programming** - code, debugging, architecture
• **Document analysis** - attach .txt, .md, .pdf files  
• **Web search** - I'll search the internet for you
• **Writing** - articles, emails, documentation

How can I help you today?`,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model);
  };

  return (
    <>
      <ChatHeader />
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
      />
    </>
  );
}
