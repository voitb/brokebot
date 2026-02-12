import { createContext, useContext, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Conversation, type Message, type Folder } from "@/lib/db";

import { toast } from "sonner";

interface ConversationsContextType {
  conversations: Conversation[];
  folders: Folder[];
  createEmptyConversation: (title?: string, folderId?: string) => Promise<string | null>;
  addMessage: (conversationId: string, message: Omit<Message, "id" | "createdAt">) => Promise<string>;
  updateMessage: (conversationId: string, messageId: string, newContent: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  togglePinConversation: (id: string) => Promise<void>;
  updateConversationTitle: (id: string, newTitle: string) => Promise<void>;
  moveConversationToFolder: (conversationId: string, folderId: string | null) => Promise<void>;
  createFolder: (name: string) => Promise<string | null>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolderName: (id: string, newName: string) => Promise<void>;
}

export const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const rawConversations = useLiveQuery(
    () => db.conversations.orderBy("updatedAt").reverse().toArray(),
    []
  );

  const folders = useLiveQuery(
    () => db.folders.orderBy("createdAt").reverse().toArray(),
    []
  );

  const conversations = rawConversations
    ? [...rawConversations].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      })
    : [];

  const createEmptyConversation = async (
    title: string = "New Conversation",
    folderId?: string
  ): Promise<string | null> => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title,
      messages: [],
      pinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      folderId,
    };

    try {
      await db.conversations.add(newConversation);
      return newConversation.id;
    } catch {
      toast.error("Failed to create conversation.");
      return null;
    }
  };

  const addMessage = async (
    conversationId: string,
    message: Omit<Message, "id" | "createdAt">
  ): Promise<string> => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    try {
      await db.conversations.where("id").equals(conversationId).modify(convo => {
        convo.messages.push(newMessage);
        convo.updatedAt = new Date();
      });
      return newMessage.id;
    } catch (error) {
      toast.error("Failed to save message.");
      throw error;
    }
  };

  const updateMessage = async (
    conversationId: string,
    messageId: string,
    newContent: string
  ) => {
    try {
      await db.conversations.where("id").equals(conversationId).modify(convo => {
        const messageIndex = convo.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1 && convo.messages[messageIndex].content !== newContent) {
          convo.messages[messageIndex].content = newContent;
          convo.updatedAt = new Date();
        }
      });
    } catch {
      // Silently ignore - message update is non-critical
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await db.conversations.delete(id);
      toast.success("Conversation deleted.");
    } catch {
      toast.error("Failed to delete conversation.");
    }
  };

  const togglePinConversation = async (id: string) => {
    try {
      await db.conversations.where("id").equals(id).modify(convo => {
        convo.pinned = !convo.pinned;
      });
    } catch {
      toast.error("Failed to update pin status.");
    }
  };

  const updateConversationTitle = async (id: string, newTitle: string) => {
    try {
      await db.conversations.where("id").equals(id).modify(convo => {
        convo.title = newTitle;
        convo.updatedAt = new Date();
      });
    } catch {
      toast.error("Failed to update title.");
    }
  };

  const moveConversationToFolder = async (
    conversationId: string,
    folderId: string | null
  ) => {
    try {
      await db.conversations.where("id").equals(conversationId).modify(convo => {
        convo.folderId = folderId ?? undefined;
        convo.updatedAt = new Date();
      });
    } catch {
      toast.error("Failed to move conversation to folder.");
    }
  };

  const createFolder = async (name: string): Promise<string | null> => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await db.folders.add(newFolder);
      toast.success(`Folder "${name}" created.`);
      return newFolder.id;
    } catch {
      toast.error("Failed to create folder.");
      return null;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await db.conversations.where("folderId").equals(id).modify(convo => {
        delete convo.folderId;
      });
      await db.folders.delete(id);
      toast.success("Folder deleted.");
    } catch {
      toast.error("Failed to delete folder.");
    }
  };

  const updateFolderName = async (id: string, newName: string) => {
    try {
      await db.folders.where("id").equals(id).modify(folder => {
        folder.name = newName;
        folder.updatedAt = new Date();
      });
    } catch {
      toast.error("Failed to update folder name.");
    }
  };

  const value: ConversationsContextType = {
    conversations,
    folders: folders || [],
    createEmptyConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    togglePinConversation,
    updateConversationTitle,
    moveConversationToFolder,
    createFolder,
    deleteFolder,
    updateFolderName,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error("useConversations must be used within a ConversationsProvider");
  }
  return context;
}
