import { useState, useEffect, useEffectEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UseConversationDeleteOptions {
  conversationId?: string;
  deleteConversation: (conversationId: string) => Promise<void>;
}

interface UseConversationDeleteReturn {
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  handleDeleteConversation: () => void;
  handleDeleteConfirm: () => Promise<void>;
}

export function useConversationDelete({
  conversationId,
  deleteConversation,
}: UseConversationDeleteOptions): UseConversationDeleteReturn {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onDeleteEvent = useEffectEvent((eventConversationId: string) => {
    if (eventConversationId === conversationId) {
      setDeleteDialogOpen(true);
    }
  });

  useEffect(() => {
    const handleDelete = (event: Event) => {
      const customEvent = event as CustomEvent;
      onDeleteEvent(customEvent.detail?.conversationId);
    };

    document.addEventListener("conversation:delete", handleDelete);
    return () => {
      document.removeEventListener("conversation:delete", handleDelete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onDeleteEvent is from useEffectEvent (stable)
  }, []);

  const handleDeleteConversation = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!conversationId) return;

    try {
      await deleteConversation(conversationId);
      toast.success("Conversation deleted successfully.");
      setDeleteDialogOpen(false);
      navigate("/chat");
    } catch {
      toast.error("Failed to delete conversation.");
    }
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDeleteConversation,
    handleDeleteConfirm,
  };
}
