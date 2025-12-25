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
  conversationId,
}: UseActionButtonsOptions): UseActionButtonsReturn {
  const { theme, setTheme } = useTheme();
  const { conversations, togglePinConversation: togglePin } = useConversations();

  const currentConversation = conversations?.find((c) => c.id === conversationId);
  const isConversationPinned = currentConversation?.pinned || false;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const togglePinConversation = async () => {
    if (conversationId) {
      await togglePin(conversationId);
    }
  };

  const openSettings = () => {};

  const openShortcuts = () => {};

  return {
    theme,
    isConversationPinned,
    toggleTheme,
    togglePinConversation,
    openSettings,
    openShortcuts,
  };
}
