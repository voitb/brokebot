import { useState, type MouseEvent } from "react";
import { useConversations } from "@/hooks/use-conversations";
import { useConversationList } from "@/hooks/use-conversation-list";
import type { Folder } from "@/lib/db";

export interface UseFolderItemReturn {
  isOpen: boolean;
  isRenameDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: (e: MouseEvent) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleRename: (newName: string) => Promise<void>;
  handleNewChatInFolder: (e: MouseEvent) => void;
  openRenameDialog: () => void;
  closeRenameDialog: () => void;
  closeDeleteDialog: () => void;
}

export function useFolderItem(folder: Folder): UseFolderItemReturn {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { deleteFolder, updateFolderName } = useConversations();
  const { handleNewChat } = useConversationList();

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteFolder(folder.id);
    } catch {
      return;
    }
    setDeleteDialogOpen(false);
  };

  const handleRename = async (newName: string) => {
    if (newName && newName.trim() !== "") {
      try {
        await updateFolderName(folder.id, newName.trim());
      } catch {
        return;
      }
    }
    setRenameDialogOpen(false);
  };

  const handleNewChatInFolder = (e: MouseEvent) => {
    e.stopPropagation();
    handleNewChat(folder.id);
  };

  const openRenameDialog = () => {
    setRenameDialogOpen(true);
  };

  const closeRenameDialog = () => setRenameDialogOpen(false);
  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  return {
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
  };
}
