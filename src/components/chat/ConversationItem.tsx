import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MoreHorizontal, Star, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EditableConversationTitle } from "./EditableConversationTitle";
import { DeleteConversationDialog } from "./DeleteConversationDialog";
import { useConversations } from "../../hooks/useConversations";
import type { IConversation } from "../../lib/db";

interface ConversationItemProps {
  conversation: IConversation;
}

/**
 * Individual conversation item with menu actions
 */
export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
}) => {
  const navigate = useNavigate();
  const { conversationId: currentConversationId } = useParams<{
    conversationId: string;
  }>();
  const { togglePinConversation, updateConversationTitle, deleteConversation } =
    useConversations();

  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Check if this conversation is currently active
  const isActive = currentConversationId === conversation.id;

  // Handle conversation click
  const handleConversationClick = () => {
    if (!isEditing) {
      navigate(`/chat/${conversation.id}`);
    }
  };

  // Handle pin toggle
  const handlePinToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await togglePinConversation(conversation.id);
    setIsMenuOpen(false);
  };

  // Handle rename
  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  // Handle save rename
  const handleSaveRename = async (newTitle: string) => {
    if (newTitle.trim() !== conversation.title) {
      await updateConversationTitle(conversation.id, newTitle.trim());
    }
    setIsEditing(false);
  };

  // Handle cancel rename
  const handleCancelRename = () => {
    setIsEditing(false);
  };

  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
    setIsMenuOpen(false);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    await deleteConversation(conversation.id);
    setDeleteDialogOpen(false);

    // If we're deleting the current conversation, navigate to chat home
    if (isActive) {
      navigate("/chat");
    }
  };

  // Get item styles based on state
  const getItemStyles = () => {
    if (isEditing || isActive) {
      return "bg-primary/10 border-primary text-primary font-medium";
    } else if (isMenuOpen) {
      return "bg-muted/70";
    } else {
      return "hover:bg-muted/50";
    }
  };

  return (
    <>
      <div
        className={`group/item relative px-2 py-1.5 text-sm text-foreground rounded-md cursor-pointer ${getItemStyles()}`}
        onClick={handleConversationClick}
        onDoubleClick={handleRename}
      >
        <div className="flex items-center justify-between min-w-0">
          {isEditing ? (
            <EditableConversationTitle
              initialTitle={conversation.title}
              onSave={handleSaveRename}
              onCancel={handleCancelRename}
            />
          ) : (
            <span className="truncate flex-1">{conversation.title}</span>
          )}

          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 transition-opacity bg-muted/90 hover:bg-muted/100 backdrop-blur-sm shrink-0 z-10 ${
                  isMenuOpen
                    ? "opacity-100"
                    : "opacity-0 group-hover/item:opacity-100"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
            >
              <DropdownMenuItem onClick={handlePinToggle}>
                <Star
                  className={`w-4 h-4 mr-2 ${
                    conversation.pinned ? "fill-current text-yellow-500" : ""
                  }`}
                />
                {conversation.pinned ? "Remove from" : "Add to"} Favourites
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRename}>
                <Edit className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DeleteConversationDialog
        open={deleteDialogOpen}
        conversationTitle={conversation.title}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};
