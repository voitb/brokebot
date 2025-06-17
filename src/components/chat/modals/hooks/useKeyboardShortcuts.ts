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
        { label: "New Chat", keys: "g n" },
        { label: "Toggle Sidebar", keys: "g s" },
        { label: "Search", keys: "g f  or  /" },
        { label: "Show Shortcuts", keys: "?" },
      ],
    },
    {
      title: "Chat Actions",
      shortcuts: [
        { label: "Pin Chat", keys: "g p" },
        { label: "Rename Chat", keys: "g r" },
        { label: "Delete Chat", keys: "g d" },
        { label: "Close Modal", keys: "Esc" },
      ],
    },
  ], []);

  return shortcuts;
}; 