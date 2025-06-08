import { useState, createContext, useContext } from "react";
import { Menu, PanelLeftClose } from "lucide-react";
import type { ReactNode } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import React from "react";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

// Context for sidebar state
const SidebarContext = createContext<{ sidebarOpen: boolean }>({
  sidebarOpen: true,
});

export const useSidebarContext = () => useContext(SidebarContext);

interface ResponsiveChatLayoutProps {
  children: ReactNode;
}

export function ResponsiveChatLayout({ children }: ResponsiveChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onToggleSidebar: () => setDesktopSidebarOpen(!desktopSidebarOpen),
    onNewChat: () => {
      const newConversationId = Date.now();
      // Use navigate instead of direct location change
      const navigate = window.location.pathname.includes("/chat")
        ? () => (window.location.href = `/chat/${newConversationId}`)
        : () => (window.location.href = `/chat/${newConversationId}`);
      navigate();
    },
    onSearch: () => {
      // Focus search input in sidebar
      const searchInput = document.querySelector(
        'input[type="search"]'
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
  });

  return (
    <SidebarContext.Provider value={{ sidebarOpen: desktopSidebarOpen }}>
      <div className="bg-background text-foreground flex h-screen overflow-hidden">
        {/* Desktop Sidebar with shadcn Collapsible */}
        <Collapsible
          open={desktopSidebarOpen}
          onOpenChange={setDesktopSidebarOpen}
          className="hidden lg:flex"
        >
          <div className="relative">
            <CollapsibleContent className="w-72 h-screen data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left">
              <div className="relative w-full h-full">
                <ChatSidebar />
                {/* Desktop Close Button */}
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <ChatSidebar />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-background min-h-screen">
          {/* Mobile Header with Menu */}
          <div className="lg:hidden flex items-center justify-between p-3 border-b border-border bg-card/50">
            <div className="flex items-center gap-2">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
              </Sheet>
              <h1 className="text-lg font-bold">BrokeBot</h1>
            </div>
            <div className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
              💸 Free
            </div>
          </div>

          {/* Desktop Open Sidebar Button */}
          {!desktopSidebarOpen && (
            <div className="hidden lg:block absolute top-4 left-4 z-10">
              <Collapsible
                open={desktopSidebarOpen}
                onOpenChange={setDesktopSidebarOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 shadow-lg"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          )}

          {/* Chat Content */}
          <div className="flex-1 flex flex-col">{children}</div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
