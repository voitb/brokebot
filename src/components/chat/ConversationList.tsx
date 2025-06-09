import React from "react";
import { ScrollArea } from "../ui/scroll-area";
import { ConversationGroup } from "./ConversationGroup";
import { SearchBar, NewChatButton, UserProfile } from "./sidebar/components";
import { useConversationList } from "./sidebar/hooks";

/**
 * Main conversation list component with search and grouping
 */
export const ConversationList: React.FC = () => {
  const {
    searchTerm,
    pinnedConversations,
    unpinnedConversations,
    setSearchTerm,
    handleNewChat,
  } = useConversationList();

  return (
    <div className="flex flex-col h-full">
      {/* Header with New Chat button */}
      <div className="p-4 pb-3">
        <NewChatButton onNewChat={handleNewChat} />
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search conversations..."
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

            {/* Recent Conversations */}
            {unpinnedConversations.length > 0 && (
              <ConversationGroup
                title="Recent"
                conversations={unpinnedConversations}
              />
            )}

            {/* Empty state */}
            {pinnedConversations.length === 0 &&
              unpinnedConversations.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">
                    {searchTerm
                      ? "No conversations found"
                      : "No conversations yet"}
                  </p>
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
  );
};
