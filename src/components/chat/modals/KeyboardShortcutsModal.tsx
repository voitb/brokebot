import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { ShortcutGroup } from "./components";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal showing keyboard shortcuts for the app
 */
export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = React.memo(({
  open,
  onOpenChange,
}) => {
  const shortcutGroups = useKeyboardShortcuts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate brokebot faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcutGroups.map((group) => (
              <ShortcutGroup key={group.title} group={group} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
