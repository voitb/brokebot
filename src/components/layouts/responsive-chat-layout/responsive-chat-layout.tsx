import type { ReactNode } from "react";
import { ChatSidebar } from "../chat-sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useLayoutShortcuts } from "./use-layout-shortcuts";

interface ResponsiveChatLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  onboarding: ReactNode;
}

function LayoutManager() {
  useLayoutShortcuts();

  return null;
}

export function ResponsiveChatLayout({ children, sidebar, onboarding }: ResponsiveChatLayoutProps) {
  return (
    <SidebarProvider className="bg-background! overflow-hidden">
      <LayoutManager />
      {onboarding}
      <Sidebar className="border-none! bg-background! [&>div]:bg-background! w-80 shrink-0">
        <SidebarContent className="bg-background! overflow-hidden">
          <ChatSidebar sidebar={sidebar} />
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0 flex-1">
        <main className="flex-1 flex flex-col min-w-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
