import { useKeyboardShortcuts as useAppKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSidebar } from "../../ui/sidebar";
import { useConversationList } from "@/components/chat/sidebar/hooks/useConversationList";
import { useConversations } from "@/providers/ConversationsProvider";
import { useConversationId } from "@/hooks/useConversationId";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useLayoutShortcuts = () => {
  const { open, setOpen } = useSidebar();
  const { handleNewChat } = useConversationList();
  const { togglePinConversation } = useConversations();
  const conversationId = useConversationId();
  const navigate = useNavigate();

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
      navigate({ search: "?modal=shortcuts" });
    },
    onRenameChat: () => {
      // This is also a hack, a better event system should be in place
      document.dispatchEvent(new CustomEvent("conversation:rename"));
    },
  });
}; 