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
  syncCloudToLocal,
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
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(
  undefined
);

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const { config } = useUserConfig();
  const { user } = useAuth();
  const [isSynced, setIsSynced] = useState(false);
  const storeInCloud = config.storeConversationsInCloud;

  // Initial sync from cloud to local, runs only once
  useEffect(() => {
    const syncOnLoad = async () => {
      // The sync is initiated only if a user is logged in, cloud storage is enabled in settings,
      // and the sync has not already been completed in this session.
      if (user && storeInCloud && !isSynced) {
        // Set sync status to true immediately to prevent duplicate runs
        // caused by re-renders or StrictMode while the async operation is in progress.
        setIsSynced(true);

        const toastId = toast.loading("Syncing conversations from cloud...");
        try {
          await syncCloudToLocal(user.$id);
          toast.success("Conversations synced successfully.", { id: toastId });
        } catch (error) {
          console.error("Failed to sync from cloud:", error);
          toast.error("Failed to sync conversations. Check the console.", {
            id: toastId,
          });
          // On failure, reset the flag. This allows a re-sync attempt if dependencies change.
          setIsSynced(false);
        }
      }
    };
    syncOnLoad();
    // The isSynced flag in the dependency array is crucial to prevent re-runs.
  }, [user, storeInCloud, isSynced]);

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
        const { messages, ...convoDetails } = newConversation;
        await createConversationInCloud(convoDetails, user!.$id);
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
        const { messages, ...convoDetails } = newConversation;
        await createConversationInCloud(convoDetails, user!.$id);
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
      if (getCloudSync()) {
        await deleteConversationFromCloud(id);
      }
      toast.success("Conversation deleted.");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation.");
    }
  }, [getCloudSync]);

  const togglePinConversation = useCallback(async (id: string) => {
    try {
      let pinned: boolean | undefined;
      await db.conversations.where("id").equals(id).modify(convo => {
        convo.pinned = !convo.pinned;
        pinned = convo.pinned;
      });
      if (getCloudSync() && pinned !== undefined) {
        await updateConversationInCloud(id, { pinned });
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Failed to update pin status.");
    }
  }, [getCloudSync]);

  const updateConversationTitle = useCallback(async (id: string, newTitle: string) => {
    try {
      await db.conversations.where("id").equals(id).modify(convo => {
        convo.title = newTitle;
      });
      if (getCloudSync()) {
        await updateConversationInCloud(id, { title: newTitle });
      }
    } catch (error) {
      console.error("Error updating conversation title:", error);
      toast.error("Failed to update title.");
    }
  }, [getCloudSync]);

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