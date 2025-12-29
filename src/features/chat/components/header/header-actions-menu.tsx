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
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onOpenShortcuts}>
        <Keyboard className="w-4 h-4 mr-2" />
        Shortcuts
      </DropdownMenuItem>

      {conversationId && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onOpenExport}>
            <Download className="w-4 h-4 mr-2" />
            Export conversation
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onImportConversation}>
            <Upload className="w-4 h-4 mr-2" />
            Import conversation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="focus:bg-destructive/10"
            onClick={onDeleteConversation}
          >
            <Trash2 className="w-4 h-4 mr-2 text-destructive" />
            <span className="text-destructive">Delete conversation</span>
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
  );
}
