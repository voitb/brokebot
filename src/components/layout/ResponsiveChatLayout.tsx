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
      window.location.href = "/chat";
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

  return (
    <SidebarContext.Provider value={{ sidebarOpen }}>
      <SidebarProvider
        className="bg-background! overflow-hidden"
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      >
        <Sidebar className="border-none! bg-background! [&>div]:bg-background! w-80 shrink-0">
          <SidebarContent className="bg-background! overflow-hidden">
            <ChatSidebar />
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="min-w-0 flex-1">
          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SidebarContext.Provider>
  );
}
