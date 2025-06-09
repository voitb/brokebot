import { useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MoreHorizontal, Star, Edit, Trash2 } from "lucide-react";
import type { ConversationGroup } from "../../types";
import type { IConversation } from "../../lib/db";
import { useConversations } from "../../hooks/useConversations";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState } from "react";

// Helper function to group conversations by time periods
const groupConversationsByTime = (
  conversations: IConversation[]
): ConversationGroup[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const pinned = conversations.filter((c) => c.pinned);
  const unpinned = conversations.filter((c) => !c.pinned);

  const todayConversations = unpinned.filter((c) => c.updatedAt >= today);
  const yesterdayConversations = unpinned.filter(
    (c) => c.updatedAt >= yesterday && c.updatedAt < today
  );
  const lastWeekConversations = unpinned.filter(
    (c) => c.updatedAt >= lastWeek && c.updatedAt < yesterday
  );
  const olderConversations = unpinned.filter((c) => c.updatedAt < lastWeek);

  const groups: ConversationGroup[] = [];

  if (pinned.length > 0) {
    groups.push({
      label: "Pinned",
      conversations: pinned.map((c) => ({
        id: parseInt(c.id.slice(-8), 16) || 1, // Convert string ID to number for UI compatibility
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        isPinned: c.pinned,
      })),
    });
  }

  if (todayConversations.length > 0) {
    groups.push({
      label: "Today",
      conversations: todayConversations.map((c) => ({
        id: parseInt(c.id.slice(-8), 16) || 1,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        isPinned: c.pinned,
      })),
    });
  }

  if (yesterdayConversations.length > 0) {
    groups.push({
      label: "Yesterday",
      conversations: yesterdayConversations.map((c) => ({
        id: parseInt(c.id.slice(-8), 16) || 1,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        isPinned: c.pinned,
      })),
    });
  }

  if (lastWeekConversations.length > 0) {
    groups.push({
      label: "Last 7 Days",
      conversations: lastWeekConversations.map((c) => ({
        id: parseInt(c.id.slice(-8), 16) || 1,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        isPinned: c.pinned,
      })),
    });
  }

  if (olderConversations.length > 0) {
    groups.push({
      label: "Older",
      conversations: olderConversations.map((c) => ({
        id: parseInt(c.id.slice(-8), 16) || 1,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        isPinned: c.pinned,
      })),
    });
  }

  return groups;
};

interface ConversationListProps {
  searchQuery?: string;
}

export function ConversationList({ searchQuery = "" }: ConversationListProps) {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const {
    conversations,
    deleteConversation,
    togglePinConversation,
    updateConversationTitle,
  } = useConversations();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    conversationId: string | null;
    conversationTitle: string;
  }>({
    open: false,
    conversationId: null,
    conversationTitle: "",
  });
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingId && editInputRef.current) {
      // Use setTimeout to ensure DOM is updated and input is rendered
      setTimeout(() => {
        if (editInputRef.current) {
          editInputRef.current.focus();
          editInputRef.current.select();
          // Force cursor to be visible immediately
          editInputRef.current.setSelectionRange(
            editInputRef.current.value.length,
            editInputRef.current.value.length
          );
        }
      }, 0);
    }
  }, [editingId]);

  // Group conversations and filter based on search query
  const filteredGroups = useMemo(() => {
    if (!conversations) return [];

    const grouped = groupConversationsByTime(conversations);

    if (!searchQuery) return grouped;

    return grouped
      .map((group) => ({
        ...group,
        conversations: group.conversations.filter((conversation) =>
          conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((group) => group.conversations.length > 0);
  }, [conversations, searchQuery]);

  // Listen for global rename event from keyboard shortcuts
  useEffect(() => {
    const handleGlobalRename = () => {
      if (!conversationId) return;

      // Find the current conversation in the filtered groups
      const currentConversation = filteredGroups
        .flatMap((g) => g.conversations)
        .find((c) => {
          const originalConversation = conversations?.find(
            (orig) => parseInt(orig.id.slice(-8), 16) === c.id
          );
          return originalConversation?.id === conversationId;
        });

      if (currentConversation) {
        setEditingId(currentConversation.id);
        setEditingTitle(currentConversation.title);
      }
    };

    // Custom event for global rename
    document.addEventListener("conversation:rename", handleGlobalRename);
    return () =>
      document.removeEventListener("conversation:rename", handleGlobalRename);
  }, [conversationId, filteredGroups, conversations]);

  const handleConversationClick = (conversationId: number) => {
    // Don't navigate if we're editing
    if (editingId === conversationId) return;

    // Convert UI ID back to original string ID for navigation
    const originalConversation = conversations?.find(
      (c) => parseInt(c.id.slice(-8), 16) === conversationId
    );
    if (originalConversation) {
      navigate(`/chat/${originalConversation.id}`);
    }
  };

  const handleFavouriteConversation = async (
    conversationId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    const originalConversation = conversations?.find(
      (c) => parseInt(c.id.slice(-8), 16) === conversationId
    );
    if (originalConversation) {
      await togglePinConversation(originalConversation.id);
    }
  };

  const handleRenameConversation = (
    conversationId: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    const conversation = filteredGroups
      .flatMap((g) => g.conversations)
      .find((c) => c.id === conversationId);

    if (conversation) {
      setEditingId(conversationId);
      setEditingTitle(conversation.title);
      setOpenMenuId(null); // Close dropdown
    }
  };

  const handleSaveRename = async () => {
    if (!editingId || !editingTitle.trim()) return;

    const originalConversation = conversations?.find(
      (c) => parseInt(c.id.slice(-8), 16) === editingId
    );

    if (
      originalConversation &&
      editingTitle.trim() !== originalConversation.title
    ) {
      await updateConversationTitle(
        originalConversation.id,
        editingTitle.trim()
      );
    }

    setEditingId(null);
    setEditingTitle("");
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey && e.key === "Enter") {
      e.preventDefault();
      handleSaveRename();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelRename();
    }
  };

  const handleDeleteConversation = async (conversationStringId: string) => {
    await deleteConversation(conversationStringId);
    setDeleteConfirmation({
      open: false,
      conversationId: null,
      conversationTitle: "",
    });
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmation({
      open: false,
      conversationId: null,
      conversationTitle: "",
    });
  };

  if (filteredGroups.length === 0 && searchQuery) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        No conversations found for "{searchQuery}"
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredGroups.map((group) => (
        <div key={group.label}>
          <h2 className="text-xs text-muted-foreground font-semibold mb-2 px-2">
            {group.label}
          </h2>
          {group.conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative px-2 py-1.5 text-sm text-foreground rounded-md transition-all duration-200 cursor-pointer ${
                // Check if this conversation is currently active - porównaj string ID
                (() => {
                  const originalConversation = conversations?.find(
                    (c) => parseInt(c.id.slice(-8), 16) === conversation.id
                  );
                  const isActive = originalConversation?.id === conversationId;
                  const isEditing = editingId === conversation.id;
                  const isMenuOpen = openMenuId === conversation.id;

                  if (isActive || isEditing) {
                    return "bg-primary/10 border-l-2 border-primary text-primary font-medium";
                  } else if (isMenuOpen) {
                    return "bg-muted/70";
                  } else {
                    return "hover:bg-muted/50";
                  }
                })()
              }`}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <div className="flex items-center justify-between min-w-0">
                {editingId === conversation.id ? (
                  <Input
                    ref={editInputRef}
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 h-auto p-0 border-0 shadow-none bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Alt+Enter to save, Esc to cancel"
                  />
                ) : (
                  <span className="truncate flex-1">{conversation.title}</span>
                )}

                {/* Proper shadcn dropdown menu on hover with better positioning */}
                <DropdownMenu
                  onOpenChange={(open) => {
                    setOpenMenuId(open ? conversation.id : null);
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 transition-opacity bg-muted/90 hover:bg-muted/100 backdrop-blur-sm shrink-0 z-10 ${
                        openMenuId === conversation.id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavouriteConversation(conversation.id, e);
                      }}
                    >
                      <Star
                        className={`w-4 h-4 mr-2 ${
                          conversation.isPinned
                            ? "fill-current text-yellow-500"
                            : ""
                        }`}
                      />
                      {conversation.isPinned ? "Remove from" : "Add to"}{" "}
                      Favourites
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameConversation(conversation.id, e);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        const originalConversation = conversations?.find(
                          (c) =>
                            parseInt(c.id.slice(-8), 16) === conversation.id
                        );
                        if (originalConversation) {
                          setDeleteConfirmation({
                            open: true,
                            conversationId: originalConversation.id,
                            conversationTitle: conversation.title,
                          });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {group.label !== "Last 7 Days" && <div className="h-4" />}
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={deleteConfirmation.open}
        onOpenChange={handleCloseDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the conversation "
              {deleteConfirmation.conversationTitle}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDeleteConfirmation}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmation.conversationId) {
                  handleDeleteConversation(deleteConfirmation.conversationId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
