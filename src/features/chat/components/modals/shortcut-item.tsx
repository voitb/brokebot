interface ShortcutItemProps {
  label: string;
  keys: string;
}

export function ShortcutItem({ label, keys }: ShortcutItemProps) {
  return (
    <div className="flex justify-between items-center">
      <span>{label}</span>
      <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
        {keys}
      </kbd>
    </div>
  );
} 