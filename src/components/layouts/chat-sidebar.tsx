import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ChatSidebarProps {
  sidebar: ReactNode;
}

export function ChatSidebar({ sidebar }: ChatSidebarProps) {
  return (
    <aside className="w-full h-full flex flex-col bg-background">
      <div className="p-4 pb-3 flex items-center justify-between border-border">
        <SidebarTrigger />
      </div>

      <div className="flex-1 min-h-0">
        {sidebar}
      </div>
    </aside>
  );
}
