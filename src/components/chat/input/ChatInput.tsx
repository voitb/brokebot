import React from "react";
import { TooltipProvider } from "../../ui/tooltip";
import { useWebLLM } from "../../../providers/WebLLMProvider";
import { MessageForm, OptionsBar } from "./components";
import { useChatInput } from "./hooks";
import type { QualityLevel } from "../../../types";

interface ChatInputProps {
  quality?: QualityLevel;
}

/**
 * Main chat input component with message form and options bar
 */
export const ChatInput: React.FC<ChatInputProps> = ({ quality = "high" }) => {
  const { isLoading: isEngineLoading } = useWebLLM();
  const { isLoading, handleMessageSubmit } = useChatInput();

  const isDisabled = isLoading || isEngineLoading;

  return (
    <TooltipProvider>
      <div className="p-1 pb-4 bg-background w-full max-w-[95%] mx-auto">
        <MessageForm
          onSubmit={handleMessageSubmit}
          disabled={isDisabled}
          placeholder="Type your message..."
        />

        <OptionsBar
          quality={quality}
          disabled={isDisabled}
          isEngineLoading={isEngineLoading}
        />
      </div>
    </TooltipProvider>
  );
};
