import type { ReactNode } from "react";
import { ChatSidebar } from "./ChatSidebar";

interface ChatLayoutProps {
  children: ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  console.log("🟢 ChatLayout");
  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden">
      <ChatSidebar />
      <main className="flex-1 flex flex-col bg-background">{children}</main>
    </div>
  );
}
