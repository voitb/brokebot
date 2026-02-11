import * as Collapsible from "@radix-ui/react-collapsible";
import {
  ChevronRight,
  Folder as FolderIcon,
  MoreHorizontal,
  Edit,
  Trash2,
  MessageSquarePlus,
} from "lucide-react";
import { ConversationItem } from "../conversation-item";
import { DeleteFolderDialog } from "../delete-folder-dialog";
import { useFolderItem } from "./use-folder-item";
import type { FolderWithConversations } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputDialog } from "@/components/ui/input-dialog";

interface FolderItemProps {
  folder: FolderWithConversations;
}

export function FolderItem({ folder }: FolderItemProps) {
  const {
    isOpen,
    isRenameDialogOpen,
    isDeleteDialogOpen,
    setIsOpen,
    handleDelete,
    handleDeleteConfirm,
    handleRename,
    handleNewChatInFolder,
    openRenameDialog,
    closeRenameDialog,
    closeDeleteDialog,
  } = useFolderItem(folder);

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-1"
    >
      <Collapsible.Trigger asChild>
        <div className="flex items-center justify-between group/folder rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer">
          <div className="flex items-center gap-2 truncate">
            <ChevronRight
              className={`w-4 h-4 transform transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
            />
            <FolderIcon className="w-4 h-4" />
            <span className="font-semibold truncate">{folder.name}</span>
          </div>

          <div className="opacity-0 group-hover/folder:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Actions for folder ${folder.name}`}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={handleNewChatInFolder}>
                  <MessageSquarePlus />
                  New Chat in Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openRenameDialog}>
                  <Edit />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                  <Trash2 />
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Collapsible.Trigger>

      <Collapsible.Content className="pl-4 space-y-1">
        {folder.conversations.map((conversation) => (
          <ConversationItem key={conversation.id} conversation={conversation} />
        ))}
        {isOpen && folder.conversations.length === 0 && (
          <p className="text-xs text-muted-foreground px-2 py-1">
            No conversations in this folder.
          </p>
        )}
      </Collapsible.Content>

      <DeleteFolderDialog
        open={isDeleteDialogOpen}
        folderName={folder.name}
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteDialog}
      />

      <InputDialog
        open={isRenameDialogOpen}
        onOpenChange={(open) => !open && closeRenameDialog()}
        title="Rename folder"
        description={`Enter a new name for the folder "${folder.name}".`}
        inputLabel="New folder name"
        initialValue={folder.name}
        onConfirm={handleRename}
        confirmText="Rename"
      />
    </Collapsible.Root>
  );
}
