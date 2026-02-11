import { SidebarTrigger } from "@/components/ui/sidebar";
// NOTE: Intentional cross-feature import - layout orchestrates chat sidebar rendering
import { ConversationList } from "@/features/chat/components/sidebar/conversation-list";


export function ChatSidebar() {

  return (
    <aside className="w-full h-full flex flex-col bg-background">
      <div className="p-4 pb-3 flex items-center justify-between border-border">
        <SidebarTrigger />
      </div>

      <div className="flex-1 min-h-0">
        <ConversationList />
      </div>
    </aside>
  );
}
