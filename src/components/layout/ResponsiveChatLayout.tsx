import { useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { ChatSidebar } from "./ChatSidebar";
import React from "react";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../ui/sidebar";

// Context for backward compatibility
const SidebarContext = createContext<{ sidebarOpen: boolean }>({
  sidebarOpen: true,
});

export const useSidebarContext = () => {
  const legacyContext = useContext(SidebarContext);
  return { sidebarOpen: legacyContext.sidebarOpen };
};

interface ResponsiveChatLayoutProps {
  children: ReactNode;
}

export function ResponsiveChatLayout({ children }: ResponsiveChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onToggleSidebar: () => setSidebarOpen(!sidebarOpen),
    onNewChat: () => {
      const newConversationId = Date.now();
      window.location.href = `/chat/${newConversationId}`;
    },
    onSearch: () => {
      const searchInput = document.querySelector(
        'input[type="search"]'
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
    onRenameChat: () => {
      document.dispatchEvent(new CustomEvent("conversation:rename"));
    },
  });

  console.log("🟢 ResponsiveChatLayout");

  return (
    <SidebarContext.Provider value={{ sidebarOpen }}>
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <Sidebar>
          <SidebarContent>
            <ChatSidebar />
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          {/* Mobile Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 flex-1 justify-center">
              <h1 className="text-lg font-bold">BrokeBot</h1>
              <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                💸 Free
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SidebarContext.Provider>
  );
}
