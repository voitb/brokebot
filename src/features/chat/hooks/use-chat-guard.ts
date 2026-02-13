import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useConversation } from "@/hooks/use-conversations";

const DEFAULT_TIMEOUT_MS = 500;

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
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: UseChatGuardOptions): UseChatGuardReturn {
  const navigate = useNavigate();
  const { conversation } = useConversation(conversationId);

  const isChecking = !!conversationId && conversation === undefined;

  useEffect(() => {
    if (!conversationId || conversation !== undefined) return;

    const timer = setTimeout(() => {
      toast.error("Conversation not found", {
        description: "The requested conversation does not exist.",
        duration: 4000,
      });
      navigate("/chat", { replace: true });
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [conversationId, conversation, navigate, timeoutMs]);

  return {
    isChecking,
    conversationExists: conversationId ? conversation !== undefined : true,
  };
}
