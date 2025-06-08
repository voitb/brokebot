import { Send, Rocket, Search, Paperclip } from "lucide-react";
import type { ModelType, QualityLevel } from "../../types";
import { ModelSelector } from "./ModelSelector";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// Importy shadcn - tymczasowo komentowane do czasu instalacji
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// import { Badge } from '../ui/badge';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  selectedModel?: ModelType;
  quality?: QualityLevel;
  onModelChange?: (model: ModelType) => void;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  selectedModel = "local",
  quality = "high",
  onModelChange = () => {},
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;

    if (message.trim()) {
      onSendMessage(message.trim());
      e.currentTarget.reset();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  return (
    <TooltipProvider>
      <div className="p-3 border-t border-border bg-background">
        <form onSubmit={handleSubmit}>
          {/* Input Area - ultra compact */}
          <div className="flex items-center gap-2">
            <Input
              name="message"
              className="flex-1 h-9 text-sm"
              placeholder="Type your message..."
              disabled={isLoading}
              onKeyDown={handleKeyDown}
            />

            {/* Send Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
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
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              disabled={isLoading}
            />

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
            {selectedModel === "local" ? "Local" : "Cloud"}
          </Badge>
        </div>
      </div>
    </TooltipProvider>
  );
}
