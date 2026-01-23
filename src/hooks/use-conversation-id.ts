import { useLocation } from "react-router-dom";

export function useConversationId(): string | undefined {
  const location = useLocation();
  const match = location.pathname.match(/^\/chat\/(.+)$/);
  return match ? match[1] : undefined;
}
