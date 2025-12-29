import { useState, useOptimistic, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations } from "@/app/providers/conversations-provider";
import { useConversationId } from "@/features/chat/hooks/use-conversation-id";
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
  handleSaveRename: (newTitle: string) => Promise<void>;
  handleCancelRename: () => void;
  handleDelete: (e: React.MouseEvent) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleMove: (folderId: string | null) => Promise<void>;
  handleCreateFolderAndMove: (folderName: string) => Promise<void>;
  getItemStyles: () => string;
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
    startTransition(() => {
      setOptimisticPinned(!conversation.pinned);
    });
    setIsMenuOpen(false);
    await togglePinConversation(conversation.id);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
    setIsMenuOpen(false);
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
    await deleteConversation(conversation.id);
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
    if (newFolderId) {
      await handleMove(newFolderId);
    }
  };

  const getItemStyles = () => {
    if (isEditing || isActive) {
      return "bg-primary/10 border-primary text-primary font-medium";
    } else if (isMenuOpen) {
      return "bg-muted/70";
    } else {
      return "hover:bg-muted/50";
    }
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
    handleSaveRename,
    handleCancelRename,
    handleDelete,
    handleDeleteConfirm,
    handleMove,
    handleCreateFolderAndMove,
    getItemStyles,
  };
} 