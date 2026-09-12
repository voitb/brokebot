import { createContext, useContext } from "react";
import type { UseConversationReturn } from "@/hooks/use-conversations";

export const ActiveConversationContext = createContext<UseConversationReturn>({
  conversation: undefined,
  messages: [],
});

export function useActiveConversation(): UseConversationReturn {
  return useContext(ActiveConversationContext);
}
