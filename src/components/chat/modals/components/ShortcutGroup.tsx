import React from "react";
import { ShortcutItem } from "./ShortcutItem";
import type { KeyboardShortcutGroup } from "../hooks/useKeyboardShortcuts";

interface ShortcutGroupProps {
  group: KeyboardShortcutGroup;
}

/**
 * Keyboard shortcuts group component
 */
export const ShortcutGroup: React.FC<ShortcutGroupProps> = React.memo(({
  group,
}) => (
  <div>
    <h4 className="font-medium mb-3">{group.title}</h4>
    <div className="space-y-2 text-sm">
      {group.shortcuts.map((shortcut) => (
        <ShortcutItem
          key={shortcut.label}
          label={shortcut.label}
          keys={shortcut.keys}
        />
      ))}
    </div>
  </div>
)); 