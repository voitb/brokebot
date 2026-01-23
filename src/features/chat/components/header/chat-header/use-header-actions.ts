import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "@/hooks/use-conversations";
import { useConversationBackup } from "@/hooks/use-conversation-backup";
import { useTitleEdit } from "./use-title-edit";
import { useConversationIO } from "./use-conversation-io";
import { useConversationDelete } from "./use-conversation-delete";

interface UseHeaderActionsOptions {
  conversationId?: string;
}

interface UseHeaderActionsReturn {
  isEditingTitle: boolean;
  conversationTitle?: string;
  isLoadingConversation: boolean;
  isConversationPinned: boolean;
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

  const { isEditingTitle, handleTitleClick, handleSaveTitle, handleCancelTitleEdit } =
    useTitleEdit({
      conversationId,
      currentTitle: conversationTitle,
      onSaveTitle: updateConversationTitle,
    });

  const {
    fileInputRef,
    handleExportConversation,
    handleImportConversation,
    handleFileImport,
  } = useConversationIO({
    conversation,
    importConversations,
  });

  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDeleteConversation,
    handleDeleteConfirm,
  } = useConversationDelete({
    conversationId,
    deleteConversation,
  });

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
