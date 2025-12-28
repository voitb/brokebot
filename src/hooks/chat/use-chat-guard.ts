import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useConversation } from "../useConversations";

interface UseChatGuardOptions {
  conversationId?: string;
  timeoutMs?: number;
}

interface UseChatGuardReturn {
  isChecking: boolean;
  conversationExists: boolean;
}

export function useChatGuard({ 
  conversationId, 
  timeoutMs = 500 
}: UseChatGuardOptions): UseChatGuardReturn {
  const navigate = useNavigate();
  const { conversation } = useConversation(conversationId);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Skip validation if no conversationId (for general /chat route)
    if (!conversationId) {
      setHasChecked(true);
      return;
    }

    // Create timeout to check if conversation exists
    const timer = setTimeout(() => {
      if (conversation === undefined && !hasChecked) {
        // After timeout, if still undefined, conversation doesn't exist
        toast.error("Conversation not found", {
          description: "The requested conversation does not exist.",
          duration: 4000,
        });
        navigate("/chat", { replace: true });
      }
      setHasChecked(true);
    }, timeoutMs);

    // If conversation is found immediately, mark as checked
    if (conversation !== undefined) {
      setHasChecked(true);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [conversationId, conversation, navigate, hasChecked, timeoutMs]);

  return {
    isChecking: conversationId ? !hasChecked : false,
    conversationExists: conversationId ? conversation !== undefined : true,
  };
} 