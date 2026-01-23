import { useState, type MouseEvent } from "react";
import { useConversations } from "@/app/providers/conversations-provider";
import { useConversationList } from "@/hooks";
import type { Folder } from "@/lib/db";

export interface UseFolderItemReturn {
  isOpen: boolean;
  isMenuOpen: boolean;
  isRenameDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: (e: MouseEvent) => void;
  handleDeleteConfirm: () => void;
  handleRename: (newName: string) => void;
  handleNewChatInFolder: (e: MouseEvent) => void;
  openRenameDialog: () => void;
  closeRenameDialog: () => void;
  closeDeleteDialog: () => void;
}

export function useFolderItem(folder: Folder): UseFolderItemReturn {
  const [isOpen, setIsOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { deleteFolder, updateFolderName } = useConversations();
  const { handleNewChat } = useConversationList();

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
    setIsMenuOpen(false);
  };

  const handleDeleteConfirm = () => {
    deleteFolder(folder.id);
    setDeleteDialogOpen(false);
  };

  const handleRename = (newName: string) => {
    if (newName && newName.trim() !== "") {
      updateFolderName(folder.id, newName.trim());
    }
    setRenameDialogOpen(false);
  };

  const handleNewChatInFolder = (e: MouseEvent) => {
    e.stopPropagation();
    handleNewChat(folder.id);
  };

  const openRenameDialog = () => {
    setRenameDialogOpen(true);
    setIsMenuOpen(false);
  };

  const closeRenameDialog = () => setRenameDialogOpen(false);
  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  return {
    isOpen,
    isMenuOpen,
    isRenameDialogOpen,
    isDeleteDialogOpen,
    setIsOpen,
    setIsMenuOpen,
    handleDelete,
    handleDeleteConfirm,
    handleRename,
    handleNewChatInFolder,
    openRenameDialog,
    closeRenameDialog,
    closeDeleteDialog,
  };
}
