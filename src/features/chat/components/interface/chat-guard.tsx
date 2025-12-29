import type { ReactNode } from "react";
import { useConversationId } from "@/features/chat/hooks/use-conversation-id";
import { useChatGuard } from "@/features/chat/hooks/use-chat-guard";

interface ChatGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ChatGuard component that validates conversation existence
 * Shows loading state while checking, redirects if conversation not found
 */
export function ChatGuard({
  children,
  fallback = null,
}: ChatGuardProps) {
  const conversationId = useConversationId();
  const { isChecking } = useChatGuard({ conversationId });

  // Show fallback or nothing while checking
  if (isChecking) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
