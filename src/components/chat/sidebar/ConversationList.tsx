import React, { useState, useEffect, useRef } from "react";
import { FolderPlus } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";
import { ConversationGroup } from "./components/ConversationGroup";
import { SearchBar, NewChatButton, UserProfile, FolderItem } from "./components"; 
import { useConversationList } from "./hooks/useConversationList";
import { useConversations } from "../../../providers/ConversationsProvider";
import { Button } from "../../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { InputDialog } from "../../dialogs/InputDialog";

/**
 * Main conversation list component with search and grouping
 */
export const ConversationList: React.FC = () => {
  const {
    searchTerm,
    isSearching,
    pinnedConversations,
    foldersWithConversations,
    unfoldedConversations,
    setSearchTerm,
    handleNewChat,
  } = useConversationList();

  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const { createFolder } = useConversations();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleFocusSearch = () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };

    document.addEventListener("app:focus-search", handleFocusSearch);
    return () => {
      document.removeEventListener("app:focus-search", handleFocusSearch);
    };
  }, []);

  const handleCreateFolder = (name: string) => {
    createFolder(name);
  };

  return (
    <>
    <div className="flex flex-col h-full">
        {/* Header with New Chat and New Folder buttons */}
      <div className="p-4 pb-3">
          <div className="flex items-center space-x-2">
            <NewChatButton onNewChat={handleNewChat} className="flex-1" />
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsFolderDialogOpen(true)}
                  >
                    <FolderPlus className="h-4 w-4" />
                    <span className="sr-only">Create new folder</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>Create new folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <SearchBar
          ref={searchInputRef}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isSearching={isSearching}
          placeholder="Search conversations and messages..."
        />
      </div>

      {/* Conversation Groups */}
      <div className="flex-1 min-h-0 px-4">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {/* Pinned Conversations */}
            {pinnedConversations.length > 0 && (
              <ConversationGroup
                title="Favourites"
                conversations={pinnedConversations}
              />
            )}

              {/* Folders */}
              {foldersWithConversations.map((folder) => (
                <FolderItem key={folder.id} folder={folder} />
              ))}

            {/* Recent Conversations */}
              {unfoldedConversations.length > 0 && (
              <ConversationGroup
                title="Recent"
                  conversations={unfoldedConversations}
              />
            )}

            {/* Empty state */}
            {pinnedConversations.length === 0 &&
                foldersWithConversations.length === 0 &&
                unfoldedConversations.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">
                    {searchTerm
                        ? "No conversations found matching your search"
                      : "No conversations yet"}
                  </p>
                  {searchTerm && (
                    <p className="text-xs mt-1 text-muted-foreground/70">
                      Try searching with different keywords
                    </p>
                  )}
                </div>
              )}
          </div>
        </ScrollArea>
      </div>

      {/* User Profile at bottom */}
      <div className="mt-auto">
        <UserProfile />
      </div>
    </div>
      <InputDialog
        open={isFolderDialogOpen}
        onOpenChange={setIsFolderDialogOpen}
        title="Create new folder"
        description="Enter a name for your new folder to help you organize your conversations."
        inputLabel="Folder name"
        onConfirm={handleCreateFolder}
        confirmText="Create"
      />
    </>
  );
}; 