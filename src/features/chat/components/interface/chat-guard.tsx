import type { ReactNode } from "react";
import { useConversationId } from "@/hooks/use-conversation-id";
import { useChatGuard } from "@/features/chat/hooks/use-chat-guard";
import { ActiveConversationContext } from "@/features/chat/hooks/use-active-conversation";
import { RouteLoadingFallback } from "@/components/ui/route-loading-fallback";

interface ChatGuardProps {
  children: ReactNode;
}

export function ChatGuard({ children }: ChatGuardProps) {
  const conversationId = useConversationId();
  const { isChecking, conversation, messages } = useChatGuard({ conversationId });

  if (isChecking) {
    return <RouteLoadingFallback />;
  }

  return (
    <ActiveConversationContext.Provider value={{ conversation, messages }}>
      {children}
    </ActiveConversationContext.Provider>
  );
}
