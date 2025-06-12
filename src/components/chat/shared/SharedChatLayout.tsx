import React from "react";
import { ScrollArea } from "../../ui/scroll-area";
import { TooltipProvider } from "../../ui/tooltip";
import { SharedChatHeader } from "./components/SharedChatHeader";
import { SharedChatInfo } from "./components/SharedChatInfo";
import { SharedChatMessages } from "./components/SharedChatMessages";
import { useSharedChat } from "./hooks/useSharedChat";
import type { Conversation, Message, ISharedLink } from "../../../lib/db";

interface SharedChatLayoutProps {
  conversation: Conversation;
  messages: Message[];
  sharedLink: ISharedLink;
}

/**
 * Standalone layout for viewing shared chat conversations
 */
export const SharedChatLayout: React.FC<SharedChatLayoutProps> = ({
  conversation,
  messages,
  sharedLink,
}) => {
  const {
    theme,
    handleCopyLink,
    handleDownloadChat,
    toggleTheme,
    handleLogoClick,
  } = useSharedChat(conversation, messages, sharedLink);

  return (
    <TooltipProvider>
      <ScrollArea className="h-screen">
        <div className="min-h-screen bg-background flex flex-col">
          <SharedChatHeader
            theme={theme}
            sharedLink={sharedLink}
            onToggleTheme={toggleTheme}
            onCopyLink={handleCopyLink}
            onDownloadChat={handleDownloadChat}
            onLogoClick={handleLogoClick}
          />

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
                <SharedChatInfo
                  conversation={conversation}
                  messages={messages}
                  sharedLink={sharedLink}
                />
                <SharedChatMessages messages={messages} />
              </div>
            </ScrollArea>
          </div>

          <footer className="text-center py-4 text-xs text-muted-foreground border-t">
            Powered by{" "}
            <a
              href="https://github.com/your-repo/local-gpt" // Replace with your repo link
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              Local-GPT
            </a>
            .
          </footer>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
};
