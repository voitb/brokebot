import { MoreHorizontal, Settings, Keyboard, Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderActionsMenuProps {
  conversationId?: string;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenExport: () => void;
  onImportConversation: () => void;
  onDeleteConversation: () => void;
}

export function HeaderActionsMenu({
  conversationId,
  onOpenSettings,
  onOpenShortcuts,
  onOpenExport,
  onImportConversation,
  onDeleteConversation,
}: HeaderActionsMenuProps) {
  return (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem onClick={onOpenSettings}>
        <Settings />
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onOpenShortcuts}>
        <Keyboard />
        Shortcuts
      </DropdownMenuItem>

      {conversationId && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onOpenExport}>
            <Download />
            Export conversation
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onImportConversation}>
            <Upload />
            Import conversation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onDeleteConversation}>
            <Trash2 />
            Delete conversation
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
  );
}
