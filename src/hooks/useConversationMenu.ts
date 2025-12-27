import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Conversation } from '../lib/db';

/**
 * Finds a conversation by its UI numeric ID.
 * UI IDs are derived from the last 8 hex characters of the original string ID.
 */
const findConversationByUiId = (
  conversations: Conversation[] | null,
  uiId: number
): Conversation | undefined => {
  return conversations?.find(
    (c) => parseInt(c.id.slice(-8), 16) === uiId
  );
};

export const useConversationMenu = (
  conversations: Conversation[] | null,
  togglePinConversation: (id: string) => Promise<void>
) => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleConversationClick = (conversationId: number, editingId: number | null) => {
    if (editingId === conversationId) return;

    const originalConversation = findConversationByUiId(conversations, conversationId);
    if (originalConversation) {
      navigate(`/chat/${originalConversation.id}`);
    }
  };

  const handleFavouriteConversation = async (conversationId: number) => {
    const originalConversation = findConversationByUiId(conversations, conversationId);
    if (originalConversation) {
      await togglePinConversation(originalConversation.id);
    }
  };

  const getOriginalConversation = (conversationId: number) => {
    return findConversationByUiId(conversations, conversationId);
  };

  return {
    openMenuId,
    setOpenMenuId,
    handleConversationClick,
    handleFavouriteConversation,
    getOriginalConversation,
  };
};
