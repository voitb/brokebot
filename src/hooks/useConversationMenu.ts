import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IConversation } from '../lib/db';

export const useConversationMenu = (
  conversations: IConversation[] | null,
  togglePinConversation: (id: string) => Promise<void>
) => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const handleConversationClick = (conversationId: number, editingId: number | null) => {
    // Don't navigate if we're editing
    if (editingId === conversationId) return;

    // Convert UI ID back to original string ID for navigation
    const originalConversation = conversations?.find(
      (c) => parseInt(c.id.slice(-8), 16) === conversationId
    );
    if (originalConversation) {
      navigate(`/chat/${originalConversation.id}`);
    }
  };

  const handleFavouriteConversation = async (conversationId: number) => {
    const originalConversation = conversations?.find(
      (c) => parseInt(c.id.slice(-8), 16) === conversationId
    );
    if (originalConversation) {
      await togglePinConversation(originalConversation.id);
    }
  };

  const getOriginalConversation = (conversationId: number) => {
    return conversations?.find(
      (c) => parseInt(c.id.slice(-8), 16) === conversationId
    );
  };

  return {
    openMenuId,
    setOpenMenuId,
    handleConversationClick,
    handleFavouriteConversation,
    getOriginalConversation,
  };
}; 