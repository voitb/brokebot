import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations } from "../../../../hooks/useConversations";
import { useConversationId } from "../../../../hooks/useConversationId";
import type { Conversation } from "../../../../lib/db";

export const useConversationItem = (conversation: Conversation) => {
  const navigate = useNavigate();
  const currentConversationId = useConversationId();
  const { togglePinConversation, updateConversationTitle, deleteConversation } =
    useConversations();

  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isActive = currentConversationId === conversation.id;

  const handleConversationClick = useCallback(() => {
    if (!isEditing) {
      navigate(`/chat/${conversation.id}`);
    }
  }, [isEditing, navigate, conversation.id]);

  const handlePinToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await togglePinConversation(conversation.id);
    setIsMenuOpen(false);
  }, [conversation.id, togglePinConversation]);

  const handleRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
    setIsMenuOpen(false);
  }, []);

  const handleSaveRename = useCallback(async (newTitle: string) => {
    if (newTitle.trim() && newTitle.trim() !== conversation.title) {
      await updateConversationTitle(conversation.id, newTitle.trim());
    }
    setIsEditing(false);
  }, [conversation.id, conversation.title, updateConversationTitle]);

  const handleCancelRename = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
    setIsMenuOpen(false);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    await deleteConversation(conversation.id);
    setDeleteDialogOpen(false);
    if (isActive) {
      navigate("/chat");
    }
  }, [conversation.id, deleteConversation, isActive, navigate]);

  const getItemStyles = useCallback(() => {
    if (isEditing || isActive) {
      return "bg-primary/10 border-primary text-primary font-medium";
    } else if (isMenuOpen) {
      return "bg-muted/70";
    } else {
      return "hover:bg-muted/50";
    }
  }, [isEditing, isActive, isMenuOpen]);

  return {
    isEditing,
    isMenuOpen,
    deleteDialogOpen,
    isActive,
    setIsMenuOpen,
    setDeleteDialogOpen,
    handleConversationClick,
    handlePinToggle,
    handleRename,
    handleSaveRename,
    handleCancelRename,
    handleDelete,
    handleDeleteConfirm,
    getItemStyles,
  };
}; 