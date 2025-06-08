import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MoreHorizontal, Star, Edit, Trash2 } from "lucide-react";
import type { ConversationGroup } from "../../types";
import type { IConversation } from "../../lib/db";
import { useConversations } from "../../hooks/useConversations";
import { Button } from "../ui/button";
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
  const { conversations, deleteConversation, togglePinConversation } =
    useConversations();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    conversationId: string | null;
    conversationTitle: string;
  }>({
    open: false,
    conversationId: null,
    conversationTitle: "",
  });

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

  const handleConversationClick = (conversationId: number) => {
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
    console.log("Rename conversation:", conversationId);
    // TODO: Implement rename functionality with IndexedDB
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
                // Check if this conversation is currently active
                conversations?.find(
                  (c) => parseInt(c.id.slice(-8), 16) === conversation.id
                )?.id === conversationId
                  ? "bg-primary/20 border-l-2 border-primary text-primary"
                  : openMenuId === conversation.id
                  ? "bg-muted"
                  : "hover:bg-muted"
              }`}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <div className="flex items-center justify-between min-w-0">
                <span className="truncate flex-1">{conversation.title}</span>

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
