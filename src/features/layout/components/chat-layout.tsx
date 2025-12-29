import type { ReactNode } from "react";
import { ChatSidebar } from "./chat-sidebar";

interface ChatLayoutProps {
  children: ReactNode;
}

/**
 * Simple chat layout with sidebar and main content area
 * @deprecated Use ResponsiveChatLayout instead for better responsive design
 */
export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden">
      <ChatSidebar />
      <main className="flex-1 flex flex-col bg-background">{children}</main>
    </div>
  );
}
