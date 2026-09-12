import { useKeyboardShortcuts as useAppKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSidebar } from "@/components/ui/sidebar";
import { useConversationList } from "@/hooks/use-conversation-list";
import { useConversations } from "@/hooks/use-conversations";
import { useConversationId } from "@/hooks/use-conversation-id";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

type LayoutShortcutEvent =
  | "app:focus-search"
  | "conversation:delete"
  | "conversation:rename";

type LayoutShortcutArgs<K extends LayoutShortcutEvent> =
  DocumentEventMap[K]["detail"] extends undefined
    ? []
    : [detail: DocumentEventMap[K]["detail"]];

function dispatchLayoutShortcutEvent<K extends LayoutShortcutEvent>(
  type: K,
  ...[detail]: LayoutShortcutArgs<K>
): void {
  document.dispatchEvent(new CustomEvent(type, { detail }));
}

export function useLayoutShortcuts(): void {
  const { open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar();
  const { handleNewChat } = useConversationList();
  const { togglePinConversation } = useConversations();
  const conversationId = useConversationId();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useAppKeyboardShortcuts({
    onToggleSidebar: () => {
      if (isMobile) {
        setOpenMobile(!openMobile);
      } else {
        setOpen(!open);
      }
    },
    onNewChat: handleNewChat,
    onSearch: () => {
      dispatchLayoutShortcutEvent("app:focus-search");
    },
    onPinChat: async () => {
      if (conversationId) {
        await togglePinConversation(conversationId);
        toast.success("Conversation pin status updated.");
      }
    },
    onDeleteChat: () => {
      if (conversationId) {
        dispatchLayoutShortcutEvent("conversation:delete", { conversationId });
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
      dispatchLayoutShortcutEvent("conversation:rename");
    },
  });
}
