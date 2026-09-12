import { useState, useOptimistic, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useConversations } from "@/hooks/use-conversations";
import { useConversationId } from "@/hooks/use-conversation-id";
import type { Conversation, Folder } from "@/lib/db";

export interface UseConversationItemReturn {
  isEditing: boolean;
  isMenuOpen: boolean;
  deleteDialogOpen: boolean;
  isCreateFolderDialogOpen: boolean;
  isActive: boolean;
  isPinned: boolean;
  folders: Folder[];
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCreateFolderDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleConversationClick: () => void;
  handlePinToggle: (e: React.MouseEvent) => Promise<void>;
  handleRename: (e: React.MouseEvent) => void;
  startEditing: () => void;
  handleSaveRename: (newTitle: string) => Promise<void>;
  handleCancelRename: () => void;
  handleDelete: (e: React.MouseEvent) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleMove: (folderId: string | null) => Promise<void>;
  handleCreateFolderAndMove: (folderName: string) => Promise<void>;
}

export function useConversationItem(conversation: Conversation): UseConversationItemReturn {
  const navigate = useNavigate();
  const currentConversationId = useConversationId();
  const {
    togglePinConversation,
    updateConversationTitle,
    deleteConversation,
    moveConversationToFolder,
    createFolder,
    folders,
  } = useConversations();

  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCreateFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);

  const [optimisticPinned, setOptimisticPinned] = useOptimistic(
    conversation.pinned,
    (_, newPinned: boolean) => newPinned
  );

  const isActive = currentConversationId === conversation.id;

  const handleConversationClick = () => {
    if (!isEditing) {
      navigate(`/chat/${conversation.id}`);
    }
  };

  const handlePinToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    startTransition(async () => {
      setOptimisticPinned(!conversation.pinned);
      await togglePinConversation(conversation.id);
    });
  };

  const startEditing = () => {
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startEditing();
  };

  const handleSaveRename = async (newTitle: string) => {
    if (newTitle.trim() && newTitle.trim() !== conversation.title) {
      await updateConversationTitle(conversation.id, newTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
    setIsMenuOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteConversation(conversation.id);
    } catch {
      return;
    }
    toast.success("Conversation deleted successfully.");
    setDeleteDialogOpen(false);
    if (isActive) {
      navigate("/chat");
    }
  };

  const handleMove = async (folderId: string | null) => {
    await moveConversationToFolder(conversation.id, folderId);
    setIsMenuOpen(false);
  };

  const handleCreateFolderAndMove = async (folderName: string) => {
    const newFolderId = await createFolder(folderName);
    await handleMove(newFolderId);
  };

  return {
    isEditing,
    isMenuOpen,
    deleteDialogOpen,
    isCreateFolderDialogOpen,
    isActive,
    isPinned: optimisticPinned,
    folders,
    setIsMenuOpen,
    setDeleteDialogOpen,
    setCreateFolderDialogOpen,
    handleConversationClick,
    handlePinToggle,
    handleRename,
    startEditing,
    handleSaveRename,
    handleCancelRename,
    handleDelete,
    handleDeleteConfirm,
    handleMove,
    handleCreateFolderAndMove,
  };
}
