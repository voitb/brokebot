import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations } from "../../../../providers/ConversationsProvider";
import type { Conversation, Folder } from "../../../../lib/db";

export interface FolderWithConversations extends Folder {
  conversations: Conversation[];
}

interface UseConversationListReturn {
  // State
  searchTerm: string;
  isSearching: boolean;
  pinnedConversations: Conversation[];
  foldersWithConversations: FolderWithConversations[];
  unfoldedConversations: Conversation[];
  
  // Actions
  setSearchTerm: (term: string) => void;
  handleNewChat: (folderId?: string) => Promise<void>;
}

export function useConversationList(): UseConversationListReturn {
  const navigate = useNavigate();
  const { conversations, folders, createEmptyConversation } = useConversations();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setDebouncedSearchTerm("");
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const processedData = useMemo(() => {
    if (!conversations || !folders) {
      return {
        pinned: [],
        foldersWithConversations: [],
        unfolded: [],
      };
    }

    const term = debouncedSearchTerm.toLowerCase().trim();
    
    // 1. Initial filtering of conversations - enhanced content search
    const filteredConversations = term
      ? conversations.filter(conversation => {
          // Search in title
          if (conversation.title.toLowerCase().includes(term)) {
            return true;
          }
          
          // Search in message content
          const hasMatchingMessage = conversation.messages.some(message => 
            message.content.toLowerCase().includes(term)
          );
          
          return hasMatchingMessage;
        })
      : conversations;
      
    const conversationIdsInFilteredFolders = new Set<string>();

    // 2. Filter folders by name
    const filteredFolders = term 
      ? folders.filter(folder => folder.name.toLowerCase().includes(term))
      : folders;
      
    if (term) {
      const folderIds = new Set(filteredFolders.map(f => f.id));
      conversations.forEach(c => {
        if (c.folderId && folderIds.has(c.folderId)) {
          conversationIdsInFilteredFolders.add(c.id);
        }
      });
    }

    const combinedFilteredConversations = conversations.filter(c => 
      filteredConversations.some(fc => fc.id === c.id) || conversationIdsInFilteredFolders.has(c.id)
    );

    // 3. Separate pinned conversations (they are always top-level)
    const pinned = combinedFilteredConversations.filter(c => c.pinned);
    const pinnedIds = new Set(pinned.map(c => c.id));

    // 4. Create folder map
    const folderMap = new Map<string, FolderWithConversations>();
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, conversations: [] });
    });
    
    // 5. Group conversations into folders or the 'unfolded' list
    const unfolded: Conversation[] = [];
    combinedFilteredConversations.forEach(convo => {
      if (pinnedIds.has(convo.id)) return; // Skip pinned

      if (convo.folderId && folderMap.has(convo.folderId)) {
        folderMap.get(convo.folderId)!.conversations.push(convo);
      } else {
        unfolded.push(convo);
      }
    });

    // Sort conversations within each folder by date
    folderMap.forEach(folder => {
      folder.conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    });

    // Sort unfolded conversations by date
    unfolded.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const finalFolders = Array.from(folderMap.values()).filter(f => 
      // show folder if it's in the filtered list or if it contains any filtered conversations
      filteredFolders.some(ff => ff.id === f.id) || f.conversations.length > 0
    );

    return {
      pinned,
      foldersWithConversations: finalFolders,
      unfolded,
    };
  }, [conversations, folders, debouncedSearchTerm]);

  // Handle new chat creation
  const handleNewChat = useCallback(async (folderId?: string) => {
    const conversationId = await createEmptyConversation("New Conversation", folderId);
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  }, [createEmptyConversation, navigate]);

  return {
    searchTerm,
    isSearching,
    setSearchTerm,
    handleNewChat,
    pinnedConversations: processedData.pinned,
    foldersWithConversations: processedData.foldersWithConversations,
    unfoldedConversations: processedData.unfolded,
  };
} 