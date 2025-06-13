// src/hooks/useConversations.ts
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Conversation, type Message } from "../lib/db";
import { v4 as uuidv4 } from "uuid";
import { useUserConfig } from "./useUserConfig";
import {
  syncCloudToLocal,
  createConversationInCloud,
  addMessageToCloud,
  deleteConversationFromCloud,
  updateConversationInCloud,
} from "../lib/appwrite/database";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useCallback } from "react";
import { toast } from "sonner"; 

export function useConversations() {
  const { config } = useUserConfig();
  const { user } = useAuth(); 
  
  const storeInCloud = config.storeConversationsInCloud;

  // Initial sync from cloud to local
  useEffect(() => {
    const syncOnLoad = async () => {
      if (user && storeInCloud  ) {
        const toastId = toast.loading("Syncing conversations from cloud...");
        try {
          await syncCloudToLocal(user.$id);
          toast.success("Conversations synced successfully.", { id: toastId }); 
        } catch (error) {
          console.error("Failed to sync from cloud:", error);
          toast.error("Failed to sync conversations. Check the console.", { id: toastId });
        }
      }
    };
    syncOnLoad();
  }, [user, storeInCloud, ]);

  const conversations = useLiveQuery(
    () =>
      db.conversations.orderBy("updatedAt").reverse().sortBy("pinned"),
    [],
    []
  );

  const getCloudSync = useCallback(() => {
    return user && storeInCloud;
  }, [user, storeInCloud]);

  const createConversation = async (
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
      return null;
    }
  };

  const createEmptyConversation = async (title: string = "New Conversation"): Promise<string | null> => {
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
      return null;
    }
  };

  const addMessage = async (
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
  };

  const deleteConversation = async (id: string) => {
    try {
      await db.conversations.delete(id);
      if (getCloudSync()) {
        await deleteConversationFromCloud(id);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const togglePinConversation = async (id: string) => {
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
    }
  };

  const updateConversationTitle = async (id: string, newTitle: string) => {
    try {
      await db.conversations.where("id").equals(id).modify(convo => {
        convo.title = newTitle;
      });
      if (getCloudSync()) {
        await updateConversationInCloud(id, { title: newTitle });
      }
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  return {
    conversations,
    createConversation,
    createEmptyConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    togglePinConversation,
    updateConversationTitle,
  };
}

// Hook to get a specific conversation
export function useConversation(conversationId: string | undefined) {
  const conversation = useLiveQuery(
    () => conversationId ? db.conversations.get(conversationId) : undefined,
    [conversationId]
  );

  return {
    conversation,
    messages: conversation?.messages || [],
  };
}