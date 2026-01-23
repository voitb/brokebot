import { useLiveQuery } from "dexie-react-hooks";
import { db, type Conversation, type Message } from "@/lib/db";

export { useConversations } from "@/app/providers/conversations-provider";

export interface UseConversationReturn {
  conversation: Conversation | undefined;
  messages: Message[];
}

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