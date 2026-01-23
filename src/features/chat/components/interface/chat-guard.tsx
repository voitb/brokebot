import type { ReactNode } from "react";
import { useConversationId } from "@/hooks";
import { useChatGuard } from "@/features/chat/hooks/use-chat-guard";

interface ChatGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ChatGuard({
  children,
  fallback = null,
}: ChatGuardProps) {
  const conversationId = useConversationId();
  const { isChecking } = useChatGuard({ conversationId });

  if (isChecking) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
