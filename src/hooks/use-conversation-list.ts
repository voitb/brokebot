import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations } from "@/app/providers/conversations-provider";
import type { Conversation, Folder } from "@/lib/db";

export interface FolderWithConversations extends Folder {
  conversations: Conversation[];
}

interface UseConversationListReturn {
  searchTerm: string;
  isSearching: boolean;
  isLoading: boolean;
  pinnedConversations: Conversation[];
  foldersWithConversations: FolderWithConversations[];
  unfoldedConversations: Conversation[];
  setSearchTerm: (term: string) => void;
  handleNewChat: (folderId?: string) => Promise<void>;
}

function processConversationData(
  conversations: Conversation[],
  folders: Folder[],
  searchTerm: string
) {
  const term = searchTerm.toLowerCase().trim();

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

  const filteredFolders = term
    ? folders.filter((folder) => folder.name.toLowerCase().includes(term))
    : folders;

  const conversationIdsInFilteredFolders = new Set<string>();

  if (term) {
    const folderIds = new Set(filteredFolders.map((f) => f.id));
    conversations.forEach((c) => {
      if (c.folderId && folderIds.has(c.folderId)) {
        conversationIdsInFilteredFolders.add(c.id);
      }
    });
  }

  const filteredConversationIds = new Set(filteredConversations.map((c) => c.id));

  const combinedFilteredConversations = conversations.filter(
    (c) =>
      filteredConversationIds.has(c.id) ||
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

    if (convo.folderId) {
      const folder = folderMap.get(convo.folderId);
      if (folder) {
        folder.conversations.push(convo);
      } else {
        unfolded.push(convo);
      }
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
}

export function useConversationList(): UseConversationListReturn {
  const navigate = useNavigate();
  const { conversations, folders, isLoading, createEmptyConversation } =
    useConversations();
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const processedData = processConversationData(
    conversations,
    folders,
    deferredSearchTerm
  );

  const handleNewChat = async (folderId?: string) => {
    let conversationId: string;
    try {
      conversationId = await createEmptyConversation(
        "New Conversation",
        folderId
      );
    } catch {
      return;
    }

    navigate(`/chat/${conversationId}`);
  };

  return {
    searchTerm,
    isSearching: searchTerm !== deferredSearchTerm,
    isLoading,
    setSearchTerm,
    handleNewChat,
    pinnedConversations: processedData.pinned,
    foldersWithConversations: processedData.foldersWithConversations,
    unfoldedConversations: processedData.unfolded,
  };
}
