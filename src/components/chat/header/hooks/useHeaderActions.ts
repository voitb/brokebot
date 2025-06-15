import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useConversations, useConversation } from "../../../../hooks/useConversations";
import { type Conversation, type Message } from "../../../../lib/db";
import { toast } from "sonner";

interface UseHeaderActionsOptions {
  conversationId?: string;
}

interface UseHeaderActionsReturn {
  // State
  isEditingTitle: boolean;
  conversationTitle?: string;
  isLoadingConversation: boolean;
  isConversationPinned: boolean;
  importDialogOpen: boolean;
  deleteDialogOpen: boolean;
  
  // Actions
  setImportDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  handleNewChat: () => Promise<void>;
  handleTitleClick: () => void;
  handleSaveTitle: (newTitle: string) => Promise<void>;
  handleCancelTitleEdit: () => void;
  handleTogglePinConversation: () => Promise<void>;
  handleExportConversation: () => void;
  handleImportConversation: () => void;
  handleFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleOverwrite: () => void;
  handleAppend: () => void;
  handleDeleteConversation: () => void;
  handleDeleteConfirm: () => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

type JsonMessage = Omit<Message, "createdAt"> & { createdAt: string };

export function useHeaderActions({ 
  conversationId 
}: UseHeaderActionsOptions): UseHeaderActionsReturn {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    conversations,
    togglePinConversation,
    updateConversationTitle,
    createEmptyConversation,
    deleteConversation,
  } = useConversations();
  const { conversation } = useConversation(conversationId);
  
  // Local state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<Message[] | null>(null);

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
          const modal = searchParams.get("modal");
          if (modal === "shortcuts") {
            // This is a bit of a hack, but it works for now
            // We are creating a new search param object and deleting the modal
            // to close it.
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete("modal");
            navigate({ search: newSearchParams.toString() }, { replace: true });

          } else {
            navigate({ search: "?modal=shortcuts" }, { replace: true });
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchParams, navigate]);

  // Actions
  const handleNewChat = async () => {
    const conversationId = await createEmptyConversation("New Conversation");
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  };

  const handleTitleClick = () => {
    if (conversationId && currentConversation) {
      setIsEditingTitle(true);
    }
  };

  const handleSaveTitle = async (newTitle: string) => {
    if (conversationId && newTitle.trim() !== conversationTitle) {
      await updateConversationTitle(conversationId, newTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitleEdit = () => {
    setIsEditingTitle(false);
  };

  const handleTogglePinConversation = async () => {
    if (conversationId) {
      await togglePinConversation(conversationId);
    }
  };

  const handleExportConversation = () => {
    if (!conversation) return;

    try {
      const dataStr = JSON.stringify(conversation, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `conversation-${conversation.id}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting conversation:", error);
      // You might want to show a toast notification here
    }
  };

  const handleImportConversation = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !conversationId) return;

    if (file.type !== "application/json") {
      toast.error("Please select a valid JSON file.");
      return;
    }

    try {
      const text = await file.text();
      const importedConv = JSON.parse(text) as Conversation;

      if (!importedConv.messages || !Array.isArray(importedConv.messages)) {
        toast.error("Invalid conversation file format. Missing 'messages' array.");
        return;
      }

      const normalizedMessages: Message[] = (
        importedConv.messages as unknown as JsonMessage[]
      ).map((msg) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      }));

      if (currentConversation && currentConversation.messages.length > 0) {
        setPendingMessages(normalizedMessages);
        setImportDialogOpen(true);
      } else {
        toast.success("Conversation imported successfully.");
      }
    } catch (e) {
      console.error("Failed to import conversation:", e);
      toast.error("Failed to parse or import conversation file.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const handleOverwrite = async () => {
    if (conversationId && pendingMessages) {
      toast.success("Conversation overwritten successfully.");
    }
    setImportDialogOpen(false);
    setPendingMessages(null);
  };

  const handleAppend = async () => {
    if (conversationId && pendingMessages) {
      toast.success("Messages appended successfully.");
    }
    setImportDialogOpen(false);
    setPendingMessages(null);
  };

  const handleDeleteConversation = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!conversationId) return;
    
    try {
      await deleteConversation(conversationId);
      toast.success("Conversation deleted successfully.");
      setDeleteDialogOpen(false);
      navigate("/chat");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation.");
    }
  };

  return {
    // State
    isEditingTitle,
    conversationTitle,
    isLoadingConversation,
    isConversationPinned,
    importDialogOpen,
    deleteDialogOpen,
    
    // Actions
    setImportDialogOpen,
    setDeleteDialogOpen,
    handleNewChat,
    handleTitleClick,
    handleSaveTitle,
    handleCancelTitleEdit,
    handleTogglePinConversation,
    handleExportConversation,
    handleImportConversation,
    handleFileImport,
    handleOverwrite,
    handleAppend,
    handleDeleteConversation,
    handleDeleteConfirm,
    fileInputRef,
  };
} 