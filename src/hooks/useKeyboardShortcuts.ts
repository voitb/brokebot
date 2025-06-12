import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversationId } from './useConversationId';

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
  const conversationId = useConversationId();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore shortcuts when typing in input/textarea
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLElement && event.target.isContentEditable
    ) {
      return;
    }

    const { ctrlKey, metaKey, key, altKey } = event;
    const cmdOrCtrl = ctrlKey || metaKey;

    switch (true) {
      // Alt + N - New Chat
      case altKey && key === 'n':
        event.preventDefault();
        if (onNewChat) {
          onNewChat();
        } else {
          navigate('/chat');
        }
        break;

      // Ctrl/Cmd + B - Toggle Sidebar
      case altKey && key === 'b':
        event.preventDefault();
        onToggleSidebar?.();
        break;

      // Ctrl/Cmd + J - Search (changed from Ctrl+K to avoid conflict)
      case altKey && key === 'j':
        event.preventDefault();
        onSearch?.();
        break;

      // Ctrl/Cmd + P - Pin current chat (changed from Ctrl+F)
      case altKey && key === 'p' && !!conversationId:
        event.preventDefault();
        onPinChat?.();
        break;

      // Alt + R - Rename current chat  
      case altKey && key === 'r' && !!conversationId:
        event.preventDefault();
        onRenameChat?.();
        break;

      // Alt + Delete - Delete current chat
      case altKey && key === 'Delete' && !!conversationId:
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
      navigate('/chat');
    },
    navigateHome: () => navigate('/'),
    currentConversationId: conversationId,
    onShowShortcuts,
  };
} 