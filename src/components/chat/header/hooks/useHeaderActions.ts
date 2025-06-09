import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "../../../../hooks/useConversations";

interface UseHeaderActionsOptions {
  conversationId?: string;
}

interface UseHeaderActionsReturn {
  // State
  shortcutsOpen: boolean;
  settingsOpen: boolean;
  isEditingTitle: boolean;
  conversationTitle?: string;
  isLoadingConversation: boolean;
  isConversationPinned: boolean;
  
  // Actions
  setShortcutsOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  handleNewChat: () => Promise<void>;
  handleTitleClick: () => void;
  handleSaveTitle: (newTitle: string) => Promise<void>;
  handleCancelTitleEdit: () => void;
  handleTogglePinConversation: () => Promise<void>;
}

export function useHeaderActions({ 
  conversationId 
}: UseHeaderActionsOptions): UseHeaderActionsReturn {
  const navigate = useNavigate();
  const {
    conversations,
    togglePinConversation,
    updateConversationTitle,
    createEmptyConversation,
  } = useConversations();
  const { conversation } = useConversation(conversationId);
  
  // Local state
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Derived state
  const currentConversation = conversations?.find(c => c.id === conversationId);
  const conversationTitle = currentConversation?.title;
  const isConversationPinned = currentConversation?.pinned || false;
  const isLoadingConversation = conversationId ? conversation === undefined : false;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        // Only if not typing in input/textarea
        if (
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          e.preventDefault();
          setShortcutsOpen(prev => !prev);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Actions
  const handleNewChat = useCallback(async () => {
    const conversationId = await createEmptyConversation("New Conversation");
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  }, [createEmptyConversation, navigate]);

  const handleTitleClick = useCallback(() => {
    if (conversationId && currentConversation) {
      setIsEditingTitle(true);
    }
  }, [conversationId, currentConversation]);

  const handleSaveTitle = useCallback(async (newTitle: string) => {
    if (conversationId && newTitle.trim() !== conversationTitle) {
      await updateConversationTitle(conversationId, newTitle.trim());
    }
    setIsEditingTitle(false);
  }, [conversationId, conversationTitle, updateConversationTitle]);

  const handleCancelTitleEdit = useCallback(() => {
    setIsEditingTitle(false);
  }, []);

  const handleTogglePinConversation = useCallback(async () => {
    if (conversationId) {
      await togglePinConversation(conversationId);
    }
  }, [conversationId, togglePinConversation]);

  return {
    // State
    shortcutsOpen,
    settingsOpen,
    isEditingTitle,
    conversationTitle,
    isLoadingConversation,
    isConversationPinned,
    
    // Actions
    setShortcutsOpen,
    setSettingsOpen,
    handleNewChat,
    handleTitleClick,
    handleSaveTitle,
    handleCancelTitleEdit,
    handleTogglePinConversation,
  };
} 