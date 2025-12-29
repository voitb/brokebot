import { useState, useEffect, useRef, useEffectEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "@/shared/hooks/use-conversations";
import { useUserConfig } from "@/shared/hooks/use-user-config";
import { type Conversation } from "@/lib/db";
import { toast } from "sonner";

interface UseHeaderActionsOptions {
  conversationId?: string;
}

interface UseHeaderActionsReturn {
  // State
  isEditingTitle: boolean;
  conversationTitle?: string;
  isLoadingConversation: boolean;
  isConversationPinned: boolean;
  deleteDialogOpen: boolean;
  
  // Actions
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
  conversationId
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
  const { importConversations } = useUserConfig();
  
  // Local state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Derived state
  const currentConversation = conversations?.find(c => c.id === conversationId);
  const conversationTitle = currentConversation?.title;
  const isConversationPinned = currentConversation?.pinned || false;
  const isLoadingConversation = conversationId ? conversation === undefined : false;

  // Effect event for delete - always reads latest conversationId
  const onDeleteEvent = useEffectEvent((eventConversationId: string) => {
    if (eventConversationId === conversationId) {
      setDeleteDialogOpen(true);
    }
  });

  // Event listener for deleting chat via shortcut - registered once
  useEffect(() => {
    const handleDelete = (event: Event) => {
      const customEvent = event as CustomEvent;
      onDeleteEvent(customEvent.detail?.conversationId);
    };

    document.addEventListener("conversation:delete", handleDelete);
    return () => {
      document.removeEventListener("conversation:delete", handleDelete);
    };
  }, []);

  // Effect event for rename - always reads latest values
  const onRenameEvent = useEffectEvent(() => {
    if (conversationId && currentConversation) {
      setIsEditingTitle(true);
    }
  });

  // Event listener for renaming chat via shortcut - registered once
  useEffect(() => {
    const handleRename = () => {
      onRenameEvent();
    };

    document.addEventListener("conversation:rename", handleRename);
    return () => {
      document.removeEventListener("conversation:rename", handleRename);
    };
  }, []);

  // Actions
  const handleNewChat = async () => {
    const conversationId = await createEmptyConversation("New Conversation");
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  };

  const handleTitleClick = () => {
    if (conversationId && currentConversation) {
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

  const handleTogglePinConversation = async () => {
    if (conversationId) {
      await togglePinConversation(conversationId);
    }
  };

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

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please select a valid JSON file.");
      return;
    }

    try {
      const text = await file.text();
      const importedConv = JSON.parse(text) as Conversation;

      // Basic validation
      if (
        !importedConv.id ||
        !importedConv.title ||
        !Array.isArray(importedConv.messages)
      ) {
        toast.error(
          "Invalid conversation file format. Missing required fields."
        );
        return;
      }
      
      const importedCount = await importConversations([importedConv]);

      if (importedCount > 0) {
        toast.success("Conversation imported successfully!");
        navigate(`/chat/${importedConv.id}`);
      } else {
        toast.info("Conversation already exists. No changes were made.");
      }
    } catch {
      toast.error("Failed to parse or import conversation file.");
    } finally {
      // Reset file input to allow importing the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
    // State
    isEditingTitle,
    conversationTitle,
    isLoadingConversation,
    isConversationPinned,
    deleteDialogOpen,
    
    // Actions
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