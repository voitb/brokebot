import { useEffect, useCallback, useRef } from 'react';
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
  const lastKeyRef = useRef<string>('');
  const timeoutRef = useRef<number | undefined>(undefined);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore shortcuts when typing in input/textarea
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLElement && event.target.isContentEditable
    ) {
      return;
    }

    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
    
    // Clear timeout if exists
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Handle key sequences (g + letter)
    if (lastKeyRef.current === 'g') {
      lastKeyRef.current = '';
      event.preventDefault();
      
      switch (key) {
        case 'n': // g + n = New Chat
          if (onNewChat) {
            onNewChat();
          } else {
            navigate('/chat');
          }
          break;
        case 's': // g + s = Toggle Sidebar
          onToggleSidebar?.();
          break;
        case 'f': // g + f = Search
          onSearch?.();
          break;
        case 'p': // g + p = Pin current chat
          if (conversationId) {
            onPinChat?.();
          }
          break;
        case 'r': // g + r = Rename current chat
          if (conversationId) {
            onRenameChat?.();
          }
          break;
        case 'd': // g + d = Delete current chat
          if (conversationId) {
            onDeleteChat?.();
          }
          break;
        default:
          // Invalid sequence, ignore
          break;
      }
      return;
    }

    // Handle single key shortcuts
    switch (true) {
      // g - Start sequence
      case key === 'g' && !ctrlKey && !metaKey && !altKey && !shiftKey:
        event.preventDefault();
        lastKeyRef.current = 'g';
        // Reset sequence after 2 seconds
        timeoutRef.current = window.setTimeout(() => {
          lastKeyRef.current = '';
        }, 2000);
        break;

      // / - Focus search (common pattern)
      case key === '/' && !ctrlKey && !metaKey && !altKey && !shiftKey:
        event.preventDefault();
        onSearch?.();
        break;

      // ? - Show shortcuts
      case key === '?' && !ctrlKey && !metaKey && !altKey && !shiftKey:
        event.preventDefault();
        onShowShortcuts?.();
        break;

      // Escape - Close dialogs/modals (handled by components)
      case key === 'Escape':
        // Let components handle this
        lastKeyRef.current = ''; // Reset sequence
        break;

      default:
        // Reset sequence on any other key
        lastKeyRef.current = '';
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
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
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