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
    handleDownloadHtmlPage,
  } = useSharedChat(conversation, messages, sharedLink);

  return (
    <TooltipProvider>
      <div className="h-screen bg-background flex flex-col">
        <SharedChatHeader
          theme={theme}
          sharedLink={sharedLink}
          onToggleTheme={toggleTheme}
          onCopyLink={handleCopyLink}
          onDownloadChat={handleDownloadChat}
          onLogoClick={handleLogoClick}
          onDownloadHtmlPage={handleDownloadHtmlPage}
        />

        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
              <SharedChatInfo
                conversation={conversation}
                messages={messages}
                sharedLink={sharedLink}
              />
              <SharedChatMessages messages={messages} />
            </div>
          </ScrollArea>
        </main>

        <footer className="text-center p-4 text-sm text-muted-foreground  ">
          Powered by{" "}
          <a
            href="https://github.com/your-repo/brokebot" // Replace with your repo link
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            brokebot
          </a>
        </footer>
      </div>
    </TooltipProvider>
  );
};
