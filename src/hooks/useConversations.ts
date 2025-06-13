// src/hooks/useConversations.ts
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";

// The main hook is now a context consumer, managed by ConversationsProvider
export { useConversations } from "@/providers/ConversationsProvider";

// Hook to get a specific conversation by its ID
export function useConversation(conversationId: string | undefined) {
  const conversation = useLiveQuery(
    () => (conversationId ? db.conversations.get(conversationId) : undefined),
    [conversationId]
  );

  return {
    conversation,
    messages: conversation?.messages || [],
  };
}