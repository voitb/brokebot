import { MoreHorizontal, Star, Edit, Trash2, FolderPlus, Folder, FolderSymlink, FolderMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdown-menu";
import { EditableConversationTitle } from "../editable-conversation-title";
import { DeleteConversationDialog } from "../delete-conversation-dialog";
import { useConversationItem } from "./use-conversation-item";
import type { Conversation } from "@/lib/db";
import { InputDialog } from "@/components/ui/input-dialog";

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({
  conversation,
}: ConversationItemProps) {
  const {
    isEditing,
    isMenuOpen,
    deleteDialogOpen,
    isCreateFolderDialogOpen,
    isPinned,
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
    isActive,
  } = useConversationItem(conversation);

  const itemStyles = isEditing || isActive
    ? "bg-primary/10 border-primary text-primary font-medium"
    : isMenuOpen
      ? "bg-muted/70"
      : "hover:bg-muted/50";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-current={isActive ? "page" : undefined}
        aria-label={`${conversation.title}${isPinned ? ", pinned" : ""}${isActive ? ", currently selected" : ""}`}
        className={`group/item relative px-2 py-1.5 text-sm text-foreground rounded-md cursor-pointer ${itemStyles}`}
        onClick={handleConversationClick}
        onDoubleClick={handleRename}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleConversationClick();
          }
        }}
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
                aria-label={`Actions for ${conversation.title}`}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
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
                  className={isPinned ? "fill-current text-yellow-500" : ""}
                />
                {isPinned ? "Remove from" : "Add to"} Favourites
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRename}>
                <Edit />
                Rename
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FolderSymlink />
                  Move to folder
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-48">
                    <DropdownMenuItem onClick={() => setCreateFolderDialogOpen(true)}>
                      <FolderPlus />
                      New folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {folders?.map((folder) => (
                      <DropdownMenuItem
                        key={folder.id}
                        onClick={() => handleMove(folder.id)}
                        disabled={conversation.folderId === folder.id}
                      >
                        <Folder />
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                    {conversation.folderId && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleMove(null)}
                        >
                          <FolderMinus />
                          Remove from folder
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                <Trash2 />
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
}
