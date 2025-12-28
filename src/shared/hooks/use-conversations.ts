// src/hooks/useConversations.ts
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Conversation, type Message } from "@/lib/db";

// The main hook is now a context consumer, managed by ConversationsProvider
export { useConversations } from "@/app/providers/conversations-provider";

export interface UseConversationReturn {
  conversation: Conversation | undefined;
  messages: Message[];
}

// Hook to get a specific conversation by its ID
export function useConversation(conversationId: string | undefined): UseConversationReturn {
  const conversation = useLiveQuery(
    () => (conversationId ? db.conversations.get(conversationId) : undefined),
    [conversationId]
  );

  return {
    conversation,
    messages: conversation?.messages || [],
  };
}