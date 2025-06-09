import React from "react";
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
import type { Conversation } from "../../types";

interface ConversationItemProps {
  conversation: Conversation;
  isEditing: boolean;
  isMenuOpen: boolean;
  isActive: boolean;
  onConversationClick: () => void;
  onFavouriteToggle: (e: React.MouseEvent) => void;
  onRename: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onSaveRename: (newTitle: string) => void;
  onCancelRename: () => void;
  onMenuOpenChange: (open: boolean) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isEditing,
  isMenuOpen,
  isActive,
  onConversationClick,
  onFavouriteToggle,
  onRename,
  onDelete,
  onSaveRename,
  onCancelRename,
  onMenuOpenChange,
}) => {
  const getItemStyles = () => {
    if (isEditing) {
      return "bg-primary/10 border-l-2 border-primary text-primary font-medium";
    } else if (isActive) {
      return "bg-primary/10 border-primary text-primary font-medium";
    } else if (isMenuOpen) {
      return "bg-muted/70";
    } else {
      return "hover:bg-muted/50";
    }
  };

  return (
    <div
      className={`group relative px-2 py-1.5 text-sm text-foreground rounded-md cursor-pointer ${getItemStyles()}`}
      onClick={onConversationClick}
    >
      <div className="flex items-center justify-between min-w-0">
        {isEditing ? (
          <EditableConversationTitle
            initialTitle={conversation.title}
            onSave={onSaveRename}
            onCancel={onCancelRename}
          />
        ) : (
          <span className="truncate flex-1">{conversation.title}</span>
        )}

        <DropdownMenu onOpenChange={onMenuOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 transition-opacity bg-muted/90 hover:bg-muted/100 backdrop-blur-sm shrink-0 z-10 ${
                isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onFavouriteToggle}>
              <Star
                className={`w-4 h-4 mr-2 ${
                  conversation.isPinned ? "fill-current text-yellow-500" : ""
                }`}
              />
              {conversation.isPinned ? "Remove from" : "Add to"} Favourites
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRename}>
              <Edit className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
