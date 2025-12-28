import type { ReactNode } from "react";
import { ChatSidebar } from "./chat-sidebar";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from "../ui/sidebar";
import { useLayoutShortcuts } from "./hooks/use-layout-shortcuts";
import { useOnboarding } from "../onboarding/hooks/use-onboarding";
import { OnboardingDialog } from "../onboarding/onboarding-dialog";

interface ResponsiveChatLayoutProps {
  children: ReactNode;
}

const LayoutManager: React.FC = () => {
  useLayoutShortcuts();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  return <OnboardingDialog isOpen={showOnboarding} onClose={completeOnboarding} />;
};

export function ResponsiveChatLayout({ children }: ResponsiveChatLayoutProps) {
  return (
    <SidebarProvider
      className="bg-background! overflow-hidden"
      // Default state can be managed here or through the hook if extended
    >
      <LayoutManager />
      <Sidebar className="border-none! bg-background! [&>div]:bg-background! w-80 shrink-0">
        <SidebarContent className="bg-background! overflow-hidden">
          <ChatSidebar />
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0 flex-1">
        <main className="flex-1 flex flex-col min-w-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
