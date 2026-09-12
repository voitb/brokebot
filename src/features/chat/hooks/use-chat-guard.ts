import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useConversation } from "@/hooks/use-conversations";
import type { Conversation, Message } from "@/lib/db";

const DEFAULT_TIMEOUT_MS = 500;

interface UseChatGuardOptions {
  conversationId?: string;
  timeoutMs?: number;
}

interface UseChatGuardReturn {
  isChecking: boolean;
  conversationExists: boolean;
  conversation: Conversation | undefined;
  messages: Message[];
}

export function useChatGuard({
  conversationId,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: UseChatGuardOptions): UseChatGuardReturn {
  const navigate = useNavigate();
  const { conversation, messages } = useConversation(conversationId);

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
    conversation,
    messages,
  };
}
