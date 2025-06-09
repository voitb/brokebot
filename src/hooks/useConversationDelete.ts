import { useState } from 'react';

interface DeleteConfirmationState {
  open: boolean;
  conversationId: string | null;
  conversationTitle: string;
}

export const useConversationDelete = (
  deleteConversation: (id: string) => Promise<void>
) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
    open: false,
    conversationId: null,
    conversationTitle: "",
  });

  const handleDeleteConversation = async (conversationStringId: string) => {
    await deleteConversation(conversationStringId);
    setDeleteConfirmation({
      open: false,
      conversationId: null,
      conversationTitle: "",
    });
  };

  const openDeleteConfirmation = (conversationId: string, title: string) => {
    setDeleteConfirmation({
      open: true,
      conversationId,
      conversationTitle: title,
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      open: false,
      conversationId: null,
      conversationTitle: "",
    });
  };

  return {
    deleteConfirmation,
    handleDeleteConversation,
    openDeleteConfirmation,
    closeDeleteConfirmation,
  };
}; 