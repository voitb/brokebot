import { useState } from 'react';

interface DeleteConfirmationState {
  open: boolean;
  conversationId: string | null;
  conversationTitle: string;
}

const INITIAL_STATE: DeleteConfirmationState = {
  open: false,
  conversationId: null,
  conversationTitle: "",
};

export const useConversationDelete = (
  deleteConversation: (id: string) => Promise<void>
) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>(INITIAL_STATE);

  const handleDeleteConversation = async (conversationStringId: string) => {
    await deleteConversation(conversationStringId);
    setDeleteConfirmation(INITIAL_STATE);
  };

  const openDeleteConfirmation = (conversationId: string, title: string) => {
    setDeleteConfirmation({
      open: true,
      conversationId,
      conversationTitle: title,
    });
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation(INITIAL_STATE);
  };

  return {
    deleteConfirmation,
    handleDeleteConversation,
    openDeleteConfirmation,
    closeDeleteConfirmation,
  };
}; 