import { useLiveQuery } from "dexie-react-hooks";
import { db, type IMessage } from "../lib/db";
import { useCallback } from "react";

export function useConversations() {
  const conversations = useLiveQuery(() =>
    db.conversations.orderBy("createdAt").reverse().toArray()
  );

  const createConversation = useCallback(async (title: string) => {
    try {
      const newConversationId = await db.conversations.add({
        title,
        createdAt: new Date(),
      });
      return newConversationId; 
    } catch (error) {
      console.error("Failed to create conversation:", error);
      return null;
    }
  }, []);

  return { conversations, createConversation };
}

export function useConversation(conversationId: number | null) {
  const messages = useLiveQuery(
    () => {
      if (conversationId === null) return [];
      return db.messages.where({ conversationId }).sortBy("createdAt");
    },
    [conversationId] 
  );

  const addMessage = useCallback(
    async (message: Omit<IMessage, "id" | "createdAt" | "conversationId">) => {
      if (conversationId === null) {
        console.error("Cannot add message without an active conversation.");
        return;
      }
      try {
        await db.messages.add({
          ...message,
          conversationId,
          createdAt: new Date(),
        });
      } catch (error) {
        console.error("Failed to add message:", error);
      }
    },
    [conversationId]
  );

  return { messages, addMessage };
}