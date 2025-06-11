import React from "react";

interface ShortcutItemProps {
  label: string;
  keys: string;
}

/**
 * Individual keyboard shortcut item component
 */
export const ShortcutItem: React.FC<ShortcutItemProps> = React.memo(({
  label,
  keys,
}) => (
  <div className="flex justify-between items-center">
    <span>{label}</span>
    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
      {keys}
    </kbd>
  </div>
)); 