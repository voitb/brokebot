import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useConversation } from "../../hooks/useConversations";

interface ChatGuardProps {
  children: React.ReactNode;
}

export function ChatGuard({ children }: ChatGuardProps) {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { conversation } = useConversation(conversationId);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Skip if no conversationId (for general /chat route)
    if (!conversationId) {
      setHasChecked(true);
      return;
    }

    const timer = setTimeout(() => {
      if (conversation === undefined && !hasChecked) {
        toast.error("Conversation not found", {
          description: "The requested conversation does not exist.",
          duration: 4000,
        });
        navigate("/chat", { replace: true });
      }
      setHasChecked(true);
    }, 500);

    // If conversation is found immediately, mark as checked
    if (conversation !== undefined) {
      setHasChecked(true);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [conversationId, conversation, navigate, hasChecked]);

  // Show nothing while checking
  if (conversationId && !hasChecked) {
    return null;
  }

  return <>{children}</>;
}
