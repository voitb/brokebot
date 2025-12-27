import { useState, useTransition, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations } from "../../../../providers/ConversationsProvider";
import type { Conversation, Folder } from "../../../../lib/db";

export interface FolderWithConversations extends Folder {
  conversations: Conversation[];
}

interface UseConversationListReturn {
  searchTerm: string;
  isSearching: boolean;
  pinnedConversations: Conversation[];
  foldersWithConversations: FolderWithConversations[];
  unfoldedConversations: Conversation[];
  setSearchTerm: (term: string) => void;
  handleNewChat: (folderId?: string) => Promise<void>;
}

export function useConversationList(): UseConversationListReturn {
  const navigate = useNavigate();
  const { conversations, folders, createEmptyConversation } = useConversations();
  const [searchTerm, setSearchTerm] = useState("");
  const [deferredSearchTerm, setDeferredSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    startTransition(() => {
      setDeferredSearchTerm(term);
    });
  };

  const processedData = useMemo(() => {
    if (!conversations || !folders) {
      return {
        pinned: [] as Conversation[],
        foldersWithConversations: [] as FolderWithConversations[],
        unfolded: [] as Conversation[],
      };
    }

    const term = deferredSearchTerm.toLowerCase().trim();

    const filteredConversations = term
      ? conversations.filter((conversation) => {
          if (conversation.title.toLowerCase().includes(term)) {
            return true;
          }

          const hasMatchingMessage = conversation.messages.some((message) =>
            message.content.toLowerCase().includes(term)
          );

          return hasMatchingMessage;
        })
      : conversations;

    const conversationIdsInFilteredFolders = new Set<string>();

    const filteredFolders = term
      ? folders.filter((folder) => folder.name.toLowerCase().includes(term))
      : folders;

    if (term) {
      const folderIds = new Set(filteredFolders.map((f) => f.id));
      conversations.forEach((c) => {
        if (c.folderId && folderIds.has(c.folderId)) {
          conversationIdsInFilteredFolders.add(c.id);
        }
      });
    }

    const combinedFilteredConversations = conversations.filter(
      (c) =>
        filteredConversations.some((fc) => fc.id === c.id) ||
        conversationIdsInFilteredFolders.has(c.id)
    );

    const pinned = combinedFilteredConversations.filter((c) => c.pinned);
    const pinnedIds = new Set(pinned.map((c) => c.id));

    const folderMap = new Map<string, FolderWithConversations>();
    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, conversations: [] });
    });

    const unfolded: Conversation[] = [];
    combinedFilteredConversations.forEach((convo) => {
      if (pinnedIds.has(convo.id)) return;

      if (convo.folderId && folderMap.has(convo.folderId)) {
        folderMap.get(convo.folderId)!.conversations.push(convo);
      } else {
        unfolded.push(convo);
      }
    });

    folderMap.forEach((folder) => {
      folder.conversations.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    });

    unfolded.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const finalFolders = Array.from(folderMap.values()).filter(
      (f) =>
        filteredFolders.some((ff) => ff.id === f.id) || f.conversations.length > 0
    );

    return {
      pinned,
      foldersWithConversations: finalFolders,
      unfolded,
    };
  }, [conversations, folders, deferredSearchTerm]);

  const handleNewChat = async (folderId?: string) => {
    const conversationId = await createEmptyConversation(
      "New Conversation",
      folderId
    );
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  };

  return {
    searchTerm,
    isSearching: isPending,
    setSearchTerm: handleSearchChange,
    handleNewChat,
    pinnedConversations: processedData.pinned,
    foldersWithConversations: processedData.foldersWithConversations,
    unfoldedConversations: processedData.unfolded,
  };
}
