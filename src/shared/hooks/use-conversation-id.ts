import { useLocation } from "react-router-dom";

/**
 * Hook to extract conversation ID from pathname
 * Handles routes like /chat/123 -> returns "123"
 * For /chat -> returns undefined
 */
export function useConversationId(): string | undefined {
  const location = useLocation();
  
  // Match pattern /chat/:id
  const match = location.pathname.match(/^\/chat\/(.+)$/);
  
  return match ? match[1] : undefined;
} 