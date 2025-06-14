import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Conversation, type Message } from "../lib/db";
import { v4 as uuidv4 } from "uuid";
import { useUserConfig } from "../hooks/useUserConfig";
import {
  syncCloudAndLocal,
  createConversationInCloud,
  addMessageToCloud,
  deleteConversationFromCloud,
  updateConversationInCloud,
  updateMessageInCloud,
} from "../lib/appwrite/database";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";

// Define the shape of the context
interface ConversationsContextType {
  conversations: Conversation[];
  createConversation: (
    title: string,
    firstMessageContent: string
  ) => Promise<string | null>;
  createEmptyConversation: (title?: string) => Promise<string | null>;
  addMessage: (
    conversationId: string,
    message: Omit<Message, "id" | "createdAt">
  ) => Promise<string>;
  updateMessage: (
    conversationId: string,
    messageId: string,
    newContent: string
  ) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  togglePinConversation: (id: string) => Promise<void>;
  updateConversationTitle: (id: string, newTitle: string) => Promise<void>;
  updateCompleteAIMessage: (
    messageId: string,
    newContent: string
  ) => Promise<void>;
  triggerSync: (options?: { cloudStorageEnabled: boolean }) => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(
  undefined
);

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const { config } = useUserConfig();
  const { user } = useAuth();
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const storeInCloud = config.storeConversationsInCloud;

  const triggerSync = useCallback(async (options?: { cloudStorageEnabled: boolean }) => {
    // Use the override if provided, otherwise default to the config state.
    // This solves the race condition when toggling the switch.
    const shouldSync = options?.cloudStorageEnabled ?? storeInCloud;

    if (!user || !shouldSync || isSyncing) {
      return;
    }

    setIsSyncing(true);
    const toastId = toast.loading("Syncing conversations with cloud...");
    try {
      await syncCloudAndLocal(user.$id);
      toast.success("Conversations synced successfully.", { id: toastId });
    } catch (error) {
      console.error("Failed to sync from cloud:", error);
      toast.error("Failed to sync conversations. Check the console.", {
        id: toastId,
      });
    } finally {
      setIsSyncing(false);
    }
  }, [user, storeInCloud, isSyncing]);

  // Effect for the very first sync when the app loads
  useEffect(() => {
    if (user && storeInCloud && !isInitialSyncDone) {
      triggerSync();
      setIsInitialSyncDone(true); // Mark initial sync as done for the session
    }
  }, [user, storeInCloud, isInitialSyncDone, triggerSync]);

  const rawConversations = useLiveQuery(
    () => db.conversations.orderBy("updatedAt").reverse().toArray(),
    []
  );

  const conversations = useMemo(() => {
    if (!rawConversations) return [];
    // Sort by pinned status, then by updatedAt (which is already pre-sorted by the query)
    return [...rawConversations].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0; // The primary sort by date is handled by the Dexie query
    });
  }, [rawConversations]);

  // Keep useCallback for helper function used in other useCallback dependencies
  const getCloudSync = useCallback(() => {
    return user && storeInCloud;
  }, [user, storeInCloud]);

  const createConversation = useCallback(async (
    title: string,
    firstMessageContent: string
  ): Promise<string | null> => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title,
      messages: [
        {
          id: uuidv4(),
          role: "user",
          content: firstMessageContent,
          createdAt: new Date(),
        },
      ],
      pinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await db.conversations.add(newConversation);
      if (getCloudSync()) {
        const { messages, id, ...convoDetails } = newConversation;
        await createConversationInCloud(id, convoDetails, user!.$id);
        await addMessageToCloud(messages[0], newConversation.id);
      }
      return newConversation.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation.");
      return null;
    }
  }, [getCloudSync, user]);

  const createEmptyConversation = useCallback(async (title: string = "New Conversation"): Promise<string | null> => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title,
      messages: [],
      pinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await db.conversations.add(newConversation);
      if (getCloudSync()) {
        const { messages, id, ...convoDetails } = newConversation;
        await createConversationInCloud(id, convoDetails, user!.$id);
      }
      return newConversation.id;
    } catch (error) {
      console.error("Error creating empty conversation:", error);
      toast.error("Failed to create conversation.");
      return null;
    }
  }, [getCloudSync, user]);

  const addMessage = useCallback(async (
    conversationId: string,
    message: Omit<Message, "id" | "createdAt">
  ): Promise<string> => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      createdAt: new Date(),
    };

    try {
      await db.conversations.where("id").equals(conversationId).modify(convo => {
        convo.messages.push(newMessage);
        convo.updatedAt = new Date();
      });
       if (getCloudSync()) {
        await addMessageToCloud(newMessage, conversationId);
      }
      return newMessage.id;
    } catch (error) {
      console.error("Error adding message:", error);
      toast.error("Failed to save message.");
      throw error;
    }
  }, [getCloudSync]);

    const updateMessage = useCallback(async (
    conversationId: string,
    messageId: string,
    newContent: string
  ) => {
    try {
      await db.conversations.where("id").equals(conversationId).modify(convo => {
        const messageIndex = convo.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          convo.messages[messageIndex].content = newContent;
          convo.updatedAt = new Date();
        }
      });
      // Note: We don't sync partial message updates to the cloud.
      // The full message is synced by `addMessage` once generation is complete.
    } catch (error) {
      console.error("Error updating message:", error);
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await db.conversations.delete(id);
       
      if (user) {
        try {
          await deleteConversationFromCloud(id);
        } catch {
           console.log(`Conversation ${id} not found in cloud or already deleted.`);
        }
      }
      
      toast.success("Conversation deleted.");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation.");
    }
  }, [user]);

  const togglePinConversation = useCallback(async (id: string) => {
    try {
      let pinned: boolean | undefined;
      await db.conversations.where("id").equals(id).modify(convo => {
        convo.pinned = !convo.pinned;
        pinned = convo.pinned;
      });
       
      if (user && pinned !== undefined) {
        try {
          await updateConversationInCloud(id, { pinned });
        } catch {
           console.log(`Conversation ${id} not found in cloud for pin update.`);
        }
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Failed to update pin status.");
    }
  }, [user]);

  const updateConversationTitle = useCallback(async (id: string, newTitle: string) => {
    try {
      await db.conversations.where("id").equals(id).modify(convo => {
        convo.title = newTitle;
      });
       
      if (user) {
        try {
          await updateConversationInCloud(id, { title: newTitle });
        } catch {
           console.log(`Conversation ${id} not found in cloud for title update.`);
        }
      }
    } catch (error) {
      console.error("Error updating conversation title:", error);
      toast.error("Failed to update title.");
    }
  }, [user]);

  const updateCompleteAIMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (getCloudSync()) {
        try {
          await updateMessageInCloud(messageId, { content: newContent });
        } catch (error) {
          console.error("Failed to sync final AI message:", error);
          toast.error("Failed to save final AI response to the cloud.");
        }
      }
    },
    [getCloudSync]
  );

  const value = useMemo(() => ({
    conversations: conversations || [],
    createConversation,
    createEmptyConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    togglePinConversation,
    updateConversationTitle,
    updateCompleteAIMessage,
    triggerSync,
  }), [
      conversations,
      createConversation,
      createEmptyConversation,
      addMessage,
      updateMessage,
      deleteConversation,
      togglePinConversation,
      updateConversationTitle,
      updateCompleteAIMessage,
      triggerSync,
  ]);

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}

// Custom hook to use the conversations context
export function useConversations() {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error(
      "useConversations must be used within a ConversationsProvider"
    );
  }
  return context;
} 