import { createContext, useContext, useRef, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Conversation, type Message, type Folder } from "@/lib/db";

import { toast } from "sonner";

interface ConversationsContextType {
  conversations: Conversation[];
  folders: Folder[];
  isLoading: boolean;
  createEmptyConversation: (title?: string, folderId?: string) => Promise<string>;
  addMessage: (conversationId: string, message: Omit<Message, "id" | "createdAt">) => Promise<string>;
  updateMessage: (conversationId: string, messageId: string, newContent: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  togglePinConversation: (id: string) => Promise<void>;
  updateConversationTitle: (id: string, newTitle: string) => Promise<void>;
  moveConversationToFolder: (conversationId: string, folderId: string | null) => Promise<void>;
  createFolder: (name: string) => Promise<string>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolderName: (id: string, newName: string) => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const rawConversations = useLiveQuery(
    () => db.conversations.orderBy("updatedAt").reverse().toArray(),
    []
  );

  const rawFolders = useLiveQuery(
    () => db.folders.orderBy("createdAt").reverse().toArray(),
    []
  );

  const pendingContent = useRef(new Map<string, string>());
  const runningWrites = useRef(new Map<string, Promise<void>>());

  const isLoading = rawConversations === undefined || rawFolders === undefined;

  const conversations = rawConversations
    ? [...rawConversations].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      })
    : [];

  const folders = rawFolders ?? [];

  const createEmptyConversation = async (
    title: string = "New Conversation",
    folderId?: string
  ): Promise<string> => {
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
    } catch (error) {
      toast.error("Failed to create conversation.");
      throw error;
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
    const key = `${conversationId}:${messageId}`;
    pendingContent.current.set(key, newContent);

    const running = runningWrites.current.get(key);
    if (running) return running;

    const write = (async () => {
      try {
        for (;;) {
          const content = pendingContent.current.get(key);
          if (content === undefined) break;
          pendingContent.current.delete(key);

          await db.conversations.where("id").equals(conversationId).modify(convo => {
            const messageIndex = convo.messages.findIndex(msg => msg.id === messageId);
            if (messageIndex !== -1 && convo.messages[messageIndex].content !== content) {
              convo.messages[messageIndex].content = content;
              convo.updatedAt = new Date();
            }
          });
        }
      } catch (error) {
        pendingContent.current.delete(key);
        toast.error("Failed to save message.");
        throw error;
      } finally {
        runningWrites.current.delete(key);
      }
    })();

    runningWrites.current.set(key, write);
    return write;
  };

  const deleteConversation = async (id: string) => {
    try {
      await db.conversations.delete(id);
    } catch (error) {
      toast.error("Failed to delete conversation.");
      throw error;
    }
  };

  const togglePinConversation = async (id: string) => {
    try {
      await db.conversations.where("id").equals(id).modify(convo => {
        convo.pinned = !convo.pinned;
      });
    } catch (error) {
      toast.error("Failed to update pin status.");
      throw error;
    }
  };

  const updateConversationTitle = async (id: string, newTitle: string) => {
    try {
      await db.conversations.where("id").equals(id).modify(convo => {
        convo.title = newTitle;
        convo.updatedAt = new Date();
      });
    } catch (error) {
      toast.error("Failed to update title.");
      throw error;
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
    } catch (error) {
      toast.error("Failed to move conversation to folder.");
      throw error;
    }
  };

  const createFolder = async (name: string): Promise<string> => {
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
    } catch (error) {
      toast.error("Failed to create folder.");
      throw error;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await db.transaction("rw", db.conversations, db.folders, async () => {
        await db.conversations.where("folderId").equals(id).modify(convo => {
          delete convo.folderId;
        });
        await db.folders.delete(id);
      });
      toast.success("Folder deleted.");
    } catch (error) {
      toast.error("Failed to delete folder.");
      throw error;
    }
  };

  const updateFolderName = async (id: string, newName: string) => {
    try {
      await db.folders.where("id").equals(id).modify(folder => {
        folder.name = newName;
        folder.updatedAt = new Date();
      });
    } catch (error) {
      toast.error("Failed to update folder name.");
      throw error;
    }
  };

  const value: ConversationsContextType = {
    conversations,
    folders,
    isLoading,
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
