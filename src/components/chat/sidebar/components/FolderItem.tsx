import React, { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight, Folder as FolderIcon, MoreHorizontal, Edit, Trash2, MessageSquarePlus } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import type { FolderWithConversations } from "../hooks/useConversationList";
import { Button } from "../../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { useConversations } from "../../../../providers/ConversationsProvider";
import { useConversationList } from "../hooks/useConversationList";
import { InputDialog } from "../../../dialogs/InputDialog";

interface FolderItemProps {
  folder: FolderWithConversations;
}

export const FolderItem: React.FC<FolderItemProps> = ({ folder }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);
  const { deleteFolder, updateFolderName } = useConversations();
  const { handleNewChat } = useConversationList();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the folder "${folder.name}"? This will not delete the conversations inside.`)) {
      deleteFolder(folder.id);
    }
  };

  const handleRename = (newName: string) => {
    if (newName && newName.trim() !== "") {
      updateFolderName(folder.id, newName);
    }
  };
  
  const handleNewChatInFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleNewChat(folder.id);
  }

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
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
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={e => e.stopPropagation()}>
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" onClick={e => e.stopPropagation()}>
                <DropdownMenuItem onClick={handleNewChatInFolder}>
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  New Chat in Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
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
          <p className="text-xs text-muted-foreground px-2 py-1">No conversations in this folder.</p>
        )}
      </Collapsible.Content>
       <InputDialog
        open={isRenameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        title="Rename folder"
        description={`Enter a new name for the folder "${folder.name}".`}
        inputLabel="New folder name"
        initialValue={folder.name}
        onConfirm={handleRename}
        confirmText="Rename"
      />
    </Collapsible.Root>
  );
}; 