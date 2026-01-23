import { useKeyboardShortcuts as useAppKeyboardShortcuts } from "@/features/layout/hooks/use-keyboard-shortcuts";
import { useSidebar } from "@/components/ui/sidebar";
import { useConversationList } from "@/hooks";
import { useConversations } from "@/app/providers/conversations-provider";
import { useConversationId } from "@/hooks";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export function useLayoutShortcuts(): void {
  const { open, setOpen } = useSidebar();
  const { handleNewChat } = useConversationList();
  const { togglePinConversation } = useConversations();
  const conversationId = useConversationId();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useAppKeyboardShortcuts({
    onToggleSidebar: () => setOpen(!open),
    onNewChat: handleNewChat,
    onSearch: () => {
      document.dispatchEvent(new CustomEvent("app:focus-search"));
    },
    onPinChat: () => {
      if (conversationId) {
        togglePinConversation(conversationId);
        toast.success("Conversation pin status updated.");
      }
    },
    onDeleteChat: () => {
      if (conversationId) {
        document.dispatchEvent(new CustomEvent("conversation:delete", { detail: { conversationId } }));
      }
    },
    onShowShortcuts: () => {
      const modal = searchParams.get("modal");
      if (modal === "shortcuts") {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("modal");
        navigate({ search: newSearchParams.toString() }, { replace: true });
      } else {
        navigate({ search: "?modal=shortcuts" }, { replace: true });
      }
    },
    onRenameChat: () => {
      document.dispatchEvent(new CustomEvent("conversation:rename"));
    },
  });
}
