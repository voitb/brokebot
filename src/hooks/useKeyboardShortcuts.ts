import { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface UseKeyboardShortcutsProps {
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onSearch?: () => void;
  onPinChat?: () => void;
  onRenameChat?: () => void;
  onDeleteChat?: () => void;
  onShowShortcuts?: () => void;
}

export function useKeyboardShortcuts({
  onToggleSidebar,
  onNewChat,
  onSearch,
  onPinChat,
  onRenameChat,
  onDeleteChat,
  onShowShortcuts,
}: UseKeyboardShortcutsProps = {}) {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore shortcuts when typing in input/textarea
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLElement && event.target.isContentEditable
    ) {
      return;
    }

    const { ctrlKey, metaKey, key } = event;
    const cmdOrCtrl = ctrlKey || metaKey;

    switch (true) {
      // Ctrl/Cmd + Shift + N - New Chat
      case cmdOrCtrl && event.shiftKey && key === 'N':
        event.preventDefault();
        if (onNewChat) {
          onNewChat();
        } else {
          const newConversationId = Date.now();
          navigate(`/chat/${newConversationId}`);
        }
        break;

      // Ctrl/Cmd + B - Toggle Sidebar
      case cmdOrCtrl && key === 'b':
        event.preventDefault();
        onToggleSidebar?.();
        break;

      // Ctrl/Cmd + K - Search
      case cmdOrCtrl && key === 'k':
        event.preventDefault();
        onSearch?.();
        break;

      // Ctrl/Cmd + F - Favourite current chat
      case cmdOrCtrl && key === 'f' && !!conversationId:
        event.preventDefault();
        onPinChat?.();
        break;

      // F2 - Rename current chat
      case key === 'F2' && !!conversationId:
        event.preventDefault();
        onRenameChat?.();
        break;

      // Delete - Delete current chat
      case key === 'Delete' && !!conversationId:
        event.preventDefault();
        onDeleteChat?.();
        break;

      // ? - Show shortcuts
      case key === '?' && !cmdOrCtrl:
        event.preventDefault();
        onShowShortcuts?.();
        break;

      // Escape - Close dialogs/modals (handled by components)
      case key === 'Escape':
        // Let components handle this
        break;

      default:
        break;
    }
  }, [
    navigate,
    conversationId,
    onToggleSidebar,
    onNewChat,
    onSearch,
    onPinChat,
    onRenameChat,
    onDeleteChat,
    onShowShortcuts,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Return functions that components can call
    createNewChat: () => {
      const newConversationId = Date.now();
      navigate(`/chat/${newConversationId}`);
    },
    navigateHome: () => navigate('/'),
    currentConversationId: conversationId,
  };
} 