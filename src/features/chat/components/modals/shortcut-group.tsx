import { ShortcutItem } from "./shortcut-item";
import type { KeyboardShortcutGroup } from "@/constants/keyboard-shortcuts";

interface ShortcutGroupProps {
  group: KeyboardShortcutGroup;
}

/**
 * Keyboard shortcuts group component
 */
export function ShortcutGroup({ group }: ShortcutGroupProps) {
  return (
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
  );
} 