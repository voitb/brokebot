import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal showing keyboard shortcuts for the app
 */
export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate Local-GPT faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">General</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>New Chat</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+N
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Toggle Sidebar</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+B
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Search</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+J
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Show Shortcuts</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    ?
                  </kbd>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Chat Actions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Pin Chat</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+P
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rename Chat</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+R
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delete Chat</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Alt+Del
                  </kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span>Close Modal</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    Esc
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
