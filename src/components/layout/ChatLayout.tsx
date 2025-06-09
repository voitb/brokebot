import React from "react";
import type { ReactNode } from "react";
import { ChatSidebar } from "./ChatSidebar";

interface ChatLayoutProps {
  children: ReactNode;
}

/**
 * Simple chat layout with sidebar and main content area
 * @deprecated Use ResponsiveChatLayout instead for better responsive design
 */
export const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden">
      <ChatSidebar />
      <main className="flex-1 flex flex-col bg-background">{children}</main>
    </div>
  );
};
