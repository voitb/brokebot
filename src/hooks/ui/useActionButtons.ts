import { useCallback } from "react";
import { useConversations } from "../useConversations";
import { useTheme } from "../../providers/ThemeProvider";

interface UseActionButtonsOptions {
  conversationId?: string;
}

interface UseActionButtonsReturn {
  theme: string;
  isConversationPinned: boolean;
  toggleTheme: () => void;
  togglePinConversation: () => Promise<void>;
  openSettings: () => void;
  openShortcuts: () => void;
}

export function useActionButtons({ 
  conversationId 
}: UseActionButtonsOptions): UseActionButtonsReturn {
  const { theme, setTheme } = useTheme();
  const { conversations, togglePinConversation: togglePin } = useConversations();

  // Get current conversation pinned status
  const currentConversation = conversations?.find(c => c.id === conversationId);
  const isConversationPinned = currentConversation?.pinned || false;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Keep useCallback for async function that depends on external state
  const togglePinConversation = useCallback(async () => {
    if (conversationId) {
      await togglePin(conversationId);
    }
  }, [conversationId, togglePin]);

  const openSettings = () => {
    // This will be handled by parent component state
    console.log("Open settings");
  };

  const openShortcuts = () => {
    // This will be handled by parent component state
    console.log("Open shortcuts");
  };

  return {
    theme,
    isConversationPinned,
    toggleTheme,
    togglePinConversation,
    openSettings,
    openShortcuts,
  };
} 