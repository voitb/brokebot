import { useMemo } from "react";

export interface KeyboardShortcut {
  label: string;
  keys: string;
}

export interface KeyboardShortcutGroup {
  title: string;
  shortcuts: KeyboardShortcut[];
}

/**
 * Custom hook for keyboard shortcuts configuration
 */
export const useKeyboardShortcuts = (): KeyboardShortcutGroup[] => {
  const shortcuts = useMemo(() => [
    {
      title: "General",
      shortcuts: [
        { label: "New Chat", keys: "Alt+N" },
        { label: "Toggle Sidebar", keys: "Alt+B" },
        { label: "Search", keys: "Alt+J" },
        { label: "Show Shortcuts", keys: "?" },
      ],
    },
    {
      title: "Chat Actions",
      shortcuts: [
        { label: "Pin Chat", keys: "Alt+P" },
        { label: "Start/Stop Recording", keys: "Ctrl+M" },
        { label: "Rename Chat", keys: "Alt+R" },
        { label: "Delete Chat", keys: "Alt+Del" },
        { label: "Close Modal", keys: "Esc" },
      ],
    },
  ], []);

  return shortcuts;
}; 