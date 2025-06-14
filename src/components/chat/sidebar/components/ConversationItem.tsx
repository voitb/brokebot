import React from "react";
import { MoreHorizontal, Star, Edit, Trash2, FolderPlus, Folder, FolderSymlink, FolderMinus } from "lucide-react";
import { Button } from "../../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "../../../ui/dropdown-menu";
import { EditableConversationTitle } from "./EditableConversationTitle";
import { DeleteConversationDialog } from "./DeleteConversationDialog";
import { useConversationItem } from "../hooks/useConversationItem";
import type { Conversation } from "../../../../lib/db";
import { InputDialog } from "../../../dialogs/InputDialog";

interface ConversationItemProps {
  conversation: Conversation;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
}) => {
  const {
    isEditing,
    isMenuOpen,
    deleteDialogOpen,
    isCreateFolderDialogOpen,
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
  } = useConversationItem(conversation);

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
                className={`absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 transition-opacity bg-muted/90 hover:bg-muted/100 backdrop-blur-sm shrink-0 z-10 ${isMenuOpen
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
                  className={`w-4 h-4 mr-2 ${conversation.pinned ? "fill-current text-yellow-500" : ""
                    }`}
                />
                {conversation.pinned ? "Remove from" : "Add to"} Favourites
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRename}>
                <Edit className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FolderSymlink className="w-4 h-4 mr-2" />
                  <span>Move to folder</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-48">
                    <DropdownMenuItem onClick={() => setCreateFolderDialogOpen(true)}>
                      <FolderPlus className="w-4 h-4 mr-2" />
                      New folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {folders?.map((folder) => (
                      <DropdownMenuItem
                        key={folder.id}
                        onClick={() => handleMove(folder.id)}
                        disabled={conversation.folderId === folder.id}
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                    {conversation.folderId && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleMove(null)}
                          className="focus:bg-destructive/10"
                        >
                          <FolderMinus className="w-4 h-4 mr-2 text-destructive" />
                          <span className="text-destructive">Remove from folder</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="focus:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                <span className="text-destructive">Delete</span>
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
      <InputDialog
        open={isCreateFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        title="Create a new folder and move"
        description={`Enter a name for the new folder to move "${conversation.title}" into it.`}
        inputLabel="New folder name"
        onConfirm={handleCreateFolderAndMove}
        confirmText="Create & Move"
      />
    </>
  );
}; 