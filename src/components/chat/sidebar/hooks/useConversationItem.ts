import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations } from "../../../../providers/ConversationsProvider";
import { useConversationId } from "../../../../hooks/useConversationId";
import type { Conversation } from "../../../../lib/db";

export const useConversationItem = (conversation: Conversation) => {
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

  const isActive = currentConversationId === conversation.id;

  const handleConversationClick = () => {
    if (!isEditing) {
      navigate(`/chat/${conversation.id}`);
    }
  };

  const handlePinToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await togglePinConversation(conversation.id);
    setIsMenuOpen(false);
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

  const handleMove = useCallback(
    async (folderId: string | null) => {
      await moveConversationToFolder(conversation.id, folderId);
      setIsMenuOpen(false);
    },
    [conversation.id, moveConversationToFolder]
  );

  const handleCreateFolderAndMove = useCallback(async (folderName: string) => {
    const newFolderId = await createFolder(folderName);
    if (newFolderId) {
      await handleMove(newFolderId);
    }
  }, [createFolder, handleMove]);

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
}; 