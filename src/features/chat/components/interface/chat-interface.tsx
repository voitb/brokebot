import { ChatHeader } from "../header/chat-header";
import { ChatMessages } from "../messages/chat-messages/chat-messages";
import { ChatInput } from "../input/chat-input/";
import { useChatInput } from "@/features/chat/hooks/use-chat-input";
import { ErrorBoundary } from "@/components/errors/error-boundary";

export function ChatInterface() {
  const {
    message,
    setMessage,
    isLoading,
    isGenerating,
    handleMessageSubmit,
    regenerateLastResponse,
    stopGeneration,
  } = useChatInput();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ChatHeader />
      <ErrorBoundary>
        <ChatMessages
          isLoading={isLoading}
          isGenerating={isGenerating}
          onRegenerate={regenerateLastResponse}
          onStopGeneration={stopGeneration}
        />
      </ErrorBoundary>
      <ChatInput
        message={message}
        setMessage={setMessage}
        isLoading={isLoading}
        isGenerating={isGenerating}
        onSend={handleMessageSubmit}
        onStopGeneration={stopGeneration}
      />
    </div>
  );
}
