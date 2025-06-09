import React from "react";
import { useConversationId } from "../../../../hooks/useConversationId";
import { useChatGuard } from "../../../../hooks/chat";

interface ChatGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ChatGuard component that validates conversation existence
 * Shows loading state while checking, redirects if conversation not found
 */
export const ChatGuard: React.FC<ChatGuardProps> = ({
  children,
  fallback = null,
}) => {
  const conversationId = useConversationId();
  const { isChecking } = useChatGuard({ conversationId });

  // Show fallback or nothing while checking
  if (isChecking) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
