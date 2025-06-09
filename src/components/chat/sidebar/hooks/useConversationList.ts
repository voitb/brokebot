import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations } from "../../../../hooks/useConversations";
import type { IConversation } from "../../../../lib/db";

interface UseConversationListReturn {
  // State
  searchTerm: string;
  filteredConversations: IConversation[];
  pinnedConversations: IConversation[];
  unpinnedConversations: IConversation[];
  
  // Actions
  setSearchTerm: (term: string) => void;
  handleNewChat: () => Promise<void>;
}

export function useConversationList(): UseConversationListReturn {
  const navigate = useNavigate();
  const { conversations, createEmptyConversation } = useConversations();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    
    if (!searchTerm.trim()) {
      return conversations;
    }

    const term = searchTerm.toLowerCase();
    return conversations.filter(conversation =>
      conversation.title.toLowerCase().includes(term) ||
      conversation.messages.some(message =>
        message.content.toLowerCase().includes(term)
      )
    );
  }, [conversations, searchTerm]);

  // Separate pinned and unpinned conversations
  const pinnedConversations = useMemo(() => 
    filteredConversations.filter(c => c.pinned),
    [filteredConversations]
  );

  const unpinnedConversations = useMemo(() => 
    filteredConversations.filter(c => !c.pinned),
    [filteredConversations]
  );

  // Handle new chat creation
  const handleNewChat = useCallback(async () => {
    const conversationId = await createEmptyConversation("New Conversation");
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  }, [createEmptyConversation, navigate]);

  return {
    // State
    searchTerm,
    filteredConversations,
    pinnedConversations,
    unpinnedConversations,
    
    // Actions
    setSearchTerm,
    handleNewChat,
  };
} 