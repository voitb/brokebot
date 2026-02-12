import { useState, useRef, useEffect, useEffectEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useConversations, useConversation } from "@/hooks/use-conversations";
import { useConversationBackup } from "@/hooks/use-conversation-backup";
import { type Conversation } from "@/lib/db";
import { ConversationSchema } from "@/lib/schemas/conversation-schema";

interface UseHeaderActionsOptions {
  conversationId?: string;
}

interface UseHeaderActionsReturn {
  isEditingTitle: boolean;
  conversationTitle?: string;
  isLoadingConversation: boolean;
  isConversationPinned: boolean;
  hasMessages: boolean;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  handleNewChat: () => Promise<void>;
  handleTitleClick: () => void;
  handleSaveTitle: (newTitle: string) => Promise<void>;
  handleCancelTitleEdit: () => void;
  handleTogglePinConversation: () => Promise<void>;
  handleExportConversation: () => void;
  handleImportConversation: () => void;
  handleFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteConversation: () => void;
  handleDeleteConfirm: () => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function useHeaderActions({
  conversationId,
}: UseHeaderActionsOptions): UseHeaderActionsReturn {
  const navigate = useNavigate();
  const {
    conversations,
    togglePinConversation,
    updateConversationTitle,
    createEmptyConversation,
    deleteConversation,
  } = useConversations();
  const { conversation } = useConversation(conversationId);
  const { importConversations } = useConversationBackup();

  const currentConversation = conversations?.find(
    (c) => c.id === conversationId
  );
  const conversationTitle = currentConversation?.title;
  const isConversationPinned = currentConversation?.pinned || false;
  const isLoadingConversation = conversationId
    ? conversation === undefined
    : false;

  // --- Title editing ---
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const onRenameEvent = useEffectEvent(() => {
    if (conversationId && conversationTitle !== undefined) {
      setIsEditingTitle(true);
    }
  });

  useEffect(() => {
    const handleRename = () => {
      onRenameEvent();
    };

    document.addEventListener("conversation:rename", handleRename);
    return () => {
      document.removeEventListener("conversation:rename", handleRename);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onRenameEvent is from useEffectEvent (stable)
  }, []);

  const handleTitleClick = () => {
    if (conversationId && conversationTitle !== undefined) {
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = async (newTitle: string) => {
    if (conversationId && newTitle.trim() !== conversationTitle) {
      await updateConversationTitle(conversationId, newTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitleEdit = () => {
    setIsEditingTitle(false);
  };

  // --- Conversation IO ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportConversation = () => {
    if (!conversation) return;

    try {
      const dataStr = JSON.stringify(conversation, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `conversation-${conversation.id}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch {
      toast.error("Failed to export conversation.");
    }
  };

  const handleImportConversation = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please select a valid JSON file.");
      return;
    }

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      const parsed = ConversationSchema.safeParse(jsonData);

      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        const fieldPath = firstIssue?.path.join(".") || "unknown";
        toast.error(
          `Invalid conversation format: ${fieldPath} - ${firstIssue?.message}`
        );
        return;
      }

      const importedConv = parsed.data as Conversation;
      const importedCount = await importConversations([importedConv]);

      if (importedCount > 0) {
        toast.success("Conversation imported successfully!");
        navigate(`/chat/${importedConv.id}`);
      } else {
        toast.info("Conversation already exists. No changes were made.");
      }
    } catch {
      toast.error("Failed to parse conversation file. Invalid JSON.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // --- Conversation delete ---
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

  // --- New chat ---
  const handleNewChat = async () => {
    const newConversationId = await createEmptyConversation("New Conversation");
    if (newConversationId) {
      navigate(`/chat/${newConversationId}`);
    }
  };

  const handleTogglePinConversation = async () => {
    if (conversationId) {
      await togglePinConversation(conversationId);
    }
  };

  return {
    isEditingTitle,
    conversationTitle,
    isLoadingConversation,
    isConversationPinned,
    hasMessages: (conversation?.messages?.length ?? 0) > 0,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleNewChat,
    handleTitleClick,
    handleSaveTitle,
    handleCancelTitleEdit,
    handleTogglePinConversation,
    handleExportConversation,
    handleImportConversation,
    handleFileImport,
    handleDeleteConversation,
    handleDeleteConfirm,
    fileInputRef,
  };
}
