import { useEffect, useEffectEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConversationId } from '@/hooks';

interface UseKeyboardShortcutsProps {
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onSearch?: () => void;
  onPinChat?: () => void;
  onRenameChat?: () => void;
  onDeleteChat?: () => void;
  onShowShortcuts?: () => void;
}

export interface UseKeyboardShortcutsReturn {
  createNewChat: () => void;
  navigateHome: () => void;
  currentConversationId: string | undefined;
  onShowShortcuts: (() => void) | undefined;
}

export function useKeyboardShortcuts({
  onToggleSidebar,
  onNewChat,
  onSearch,
  onPinChat,
  onRenameChat,
  onDeleteChat,
  onShowShortcuts,
}: UseKeyboardShortcutsProps = {}): UseKeyboardShortcutsReturn {
  const navigate = useNavigate();
  const conversationId = useConversationId();
  const lastKeyRef = useRef<string>('');
  const timeoutRef = useRef<number | undefined>(undefined);

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLElement && event.target.isContentEditable
    ) {
      return;
    }

    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    if (lastKeyRef.current === 'g') {
      lastKeyRef.current = '';
      event.preventDefault();

      switch (key) {
        case 'n':
          if (onNewChat) {
            onNewChat();
          } else {
            navigate('/chat');
          }
          break;
        case 's':
          onToggleSidebar?.();
          break;
        case 'f':
          onSearch?.();
          break;
        case 'p':
          if (conversationId) {
            onPinChat?.();
          }
          break;
        case 'r':
          if (conversationId) {
            onRenameChat?.();
          }
          break;
        case 'd':
          if (conversationId) {
            onDeleteChat?.();
          }
          break;
      }
      return;
    }

    switch (true) {
      case key === 'g' && !ctrlKey && !metaKey && !altKey && !shiftKey:
        event.preventDefault();
        lastKeyRef.current = 'g';
        timeoutRef.current = window.setTimeout(() => {
          lastKeyRef.current = '';
        }, 2000);
        break;

      case key === '/' && !ctrlKey && !metaKey && !altKey && !shiftKey:
        event.preventDefault();
        onSearch?.();
        break;

      case key === '?' && !ctrlKey && !metaKey && !altKey && !shiftKey:
        event.preventDefault();
        onShowShortcuts?.();
        break;

      case key === 'Escape':
        lastKeyRef.current = '';
        break;

      default:
        lastKeyRef.current = '';
        break;
    }
  });

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onKeyDown is from useEffectEvent (stable)
  }, []);

  return {
    createNewChat: () => navigate('/chat'),
    navigateHome: () => navigate('/'),
    currentConversationId: conversationId,
    onShowShortcuts,
  };
}
