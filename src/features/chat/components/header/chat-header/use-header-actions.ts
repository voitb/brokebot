import { useState, useRef, useEffect, useEffectEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useConversations } from "@/hooks/use-conversations";
import {
  useConversationBackup,
  type ImportedBackupIds,
} from "@/hooks/use-conversation-backup";
import { useActiveConversation } from "@/features/chat/hooks/use-active-conversation";
import {
  parseConversationBackup,
  type ConversationBackup,
} from "@/lib/schemas/conversation-backup-schema";

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
    togglePinConversation,
    updateConversationTitle,
    createEmptyConversation,
    deleteConversation,
  } = useConversations();
  const { conversation } = useActiveConversation();
  const { importConversations } = useConversationBackup();

  const conversationTitle = conversation?.title;
  const isConversationPinned = conversation?.pinned || false;
  const isLoadingConversation = conversationId
    ? conversation === undefined
    : false;

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportConversation = () => {
    if (!conversation) return;

    try {
      const backup = {
        conversations: [conversation],
        folders: [],
        documents: [],
      };
      const dataStr = JSON.stringify(backup, null, 2);
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

    const isJsonFile =
      file.type === "application/json" ||
      (file.type === "" && file.name.endsWith(".json"));

    if (!isJsonFile) {
      toast.error("Please select a valid JSON file.");
      return;
    }

    try {
      let importedBackup: ConversationBackup;

      try {
        const text = await file.text();
        const parsed = parseConversationBackup(JSON.parse(text));

        if (!parsed.success) {
          const firstIssue = parsed.error.issues[0];
          const fieldPath = firstIssue?.path.join(".") || "unknown";
          toast.error(
            `Invalid conversation format: ${fieldPath} - ${firstIssue?.message}`
          );
          return;
        }

        importedBackup = parsed.backup;
      } catch {
        toast.error("Failed to parse conversation file. Invalid JSON.");
        return;
      }

      let imported: ImportedBackupIds;

      try {
        imported = await importConversations(importedBackup);
      } catch {
        return;
      }

      if (imported.conversations.length > 0) {
        toast.success("Conversation imported successfully!");
        navigate(`/chat/${imported.conversations[0]}`);
      } else {
        const restoredCount = imported.folders.length + imported.documents.length;
        toast.info(
          restoredCount > 0
            ? `Conversation already exists. Restored ${restoredCount} folder(s) and document(s).`
            : "Conversation already exists. No changes were made."
        );
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onDeleteEvent = useEffectEvent((eventConversationId: string) => {
    if (eventConversationId === conversationId) {
      setDeleteDialogOpen(true);
    }
  });

  useEffect(() => {
    const handleDelete = (event: DocumentEventMap["conversation:delete"]) => {
      onDeleteEvent(event.detail.conversationId);
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
    } catch {
      return;
    }

    toast.success("Conversation deleted successfully.");
    setDeleteDialogOpen(false);
    navigate("/chat");
  };

  const handleNewChat = async () => {
    let newConversationId: string;

    try {
      newConversationId = await createEmptyConversation("New Conversation");
    } catch {
      return;
    }

    navigate(`/chat/${newConversationId}`);
  };

  const handleTogglePinConversation = async () => {
    if (!conversationId) return;

    try {
      await togglePinConversation(conversationId);
    } catch {
      return;
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
