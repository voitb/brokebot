import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, Rocket, Search, Paperclip } from "lucide-react";
import type { QualityLevel } from "../../types";
import { ModelSelector } from "./ModelSelector";
import { Button } from "../ui/button";
import { AutosizeTextarea } from "../ui/auto-size-textarea";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  useConversations,
  useConversation,
} from "../../hooks/useConversations";
import { useWebLLM } from "../../providers/WebLLMProvider";
import { ScrollArea } from "../ui";

// Importy shadcn - tymczasowo komentowane do czasu instalacji
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// import { Badge } from '../ui/badge';

interface ChatInputProps {
  quality?: QualityLevel;
}

export function ChatInput({ quality = "high" }: ChatInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { createConversation, addMessage, updateConversationTitle } =
    useConversations();
  const { conversation } = useConversation(conversationId);
  const { engine, isLoading: isEngineLoading } = useWebLLM();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;

    if (!message.trim()) return;

    setIsLoading(true);
    e.currentTarget.reset();

    try {
      let currentConversationId = conversationId;

      // Jeśli nie ma conversation ID, stwórz nową rozmowę
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
        // Dodaj wiadomość użytkownika do istniejącej rozmowy (może być pusta)
        await addMessage(currentConversationId, {
          role: "user",
          content: message,
        });

        // Jeśli to pierwsza wiadomość w pustej rozmowie, zaktualizuj tytuł
        if (conversation && conversation.messages.length === 0) {
          const title =
            message.slice(0, 50) + (message.length > 50 ? "..." : "");
          await updateConversationTitle(currentConversationId, title);
        }
      }

      // Jeśli silnik AI jest gotowy, wygeneruj odpowiedź
      if (engine && currentConversationId) {
        try {
          const response = await engine.chat.completions.create({
            messages: [{ role: "user", content: message }],
            temperature: 0.7,
            max_tokens: 1000,
          });

          const aiResponse =
            response.choices[0]?.message?.content ||
            "Sorry, I couldn't generate a response.";

          await addMessage(currentConversationId, {
            role: "assistant",
            content: aiResponse,
          });
        } catch (aiError) {
          console.error("AI response error:", aiError);
          await addMessage(currentConversationId, {
            role: "assistant",
            content:
              "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        const formEvent = new Event("submit", {
          bubbles: true,
          cancelable: true,
        });
        form.dispatchEvent(formEvent);
      }
    }
  };

  const isDisabled = isLoading || isEngineLoading;

  return (
    <TooltipProvider>
      <div className="p-3  border-border bg-background w-[60%] mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Input Area - ultra compact */}
          <div className="flex items-end gap-2">
            <AutosizeTextarea
              name="message"
              className="flex-1 text-sm resize-none"
              placeholder="Type your message..."
              disabled={isDisabled}
              onKeyDown={handleKeyDown}
              maxHeight={300}
              minHeight={40}
            />

            {/* Send Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isDisabled}
                  className="h-9 w-9 p-0 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send (Enter)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </form>

        {/* Options Bar - ultra compact */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            {/* Model Selector */}
            <ModelSelector disabled={isDisabled} />

            {/* Quality Selector */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                >
                  <Rocket className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">{quality}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quality: {quality}</p>
              </TooltipContent>
            </Tooltip>

            {/* Search Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                >
                  <Search className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search web</p>
              </TooltipContent>
            </Tooltip>

            {/* Attach Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach files</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Status Badge - smaller */}
          <Badge variant="secondary" className="text-xs h-5 px-2">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse mr-1" />
            {isEngineLoading ? "Loading..." : "Local"}
          </Badge>
        </div>
      </div>
    </TooltipProvider>
  );
}
