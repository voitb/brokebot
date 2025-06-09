import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { ConversationGroup } from '../types';
import type { IConversation } from '../lib/db';

export const useConversationEdit = (
  filteredGroups: ConversationGroup[],
  conversations: IConversation[] | null,
  updateConversationTitle: (id: string, title: string) => Promise<void>
) => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [editingId, setEditingId] = useState<number | null>(null);

  // Listen for global rename event from keyboard shortcuts
  useEffect(() => {
    const handleGlobalRename = () => {
      if (!conversationId) return;

      // Find the current conversation in the filtered groups
      const currentConversation = filteredGroups
        .flatMap((g) => g.conversations)
        .find((c) => {
          const originalConversation = conversations?.find(
            (orig) => parseInt(orig.id.slice(-8), 16) === c.id
          );
          return originalConversation?.id === conversationId;
        });

      if (currentConversation) {
        setEditingId(currentConversation.id);
      }
    };

    // Custom event for global rename
    document.addEventListener("conversation:rename", handleGlobalRename);
    return () =>
      document.removeEventListener("conversation:rename", handleGlobalRename);
  }, [conversationId, filteredGroups, conversations]);

  const handleRenameConversation = (conversationId: number) => {
    const conversation = filteredGroups
      .flatMap((g) => g.conversations)
      .find((c) => c.id === conversationId);

    if (conversation) {
      setEditingId(conversationId);
    }
  };

  const handleSaveRename = async (conversationId: number, newTitle: string) => {
    const originalConversation = conversations?.find(
      (c) => parseInt(c.id.slice(-8), 16) === conversationId
    );

    if (originalConversation && newTitle !== originalConversation.title) {
      await updateConversationTitle(originalConversation.id, newTitle);
    }

    setEditingId(null);
  };

  const handleCancelRename = () => {
    setEditingId(null);
  };

  return {
    editingId,
    handleRenameConversation,
    handleSaveRename,
    handleCancelRename,
  };
}; 