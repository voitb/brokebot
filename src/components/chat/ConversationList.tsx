import { useConversations } from "../../hooks/useConversations";
import { useConversationGroups } from "../../hooks/useConversationGroups";
import { useConversationEdit } from "../../hooks/useConversationEdit";
import { useConversationMenu } from "../../hooks/useConversationMenu";
import { useConversationDelete } from "../../hooks/useConversationDelete";
import { ConversationGroup } from "./ConversationGroup";
import { DeleteConversationDialog } from "./DeleteConversationDialog";

interface ConversationListProps {
  searchQuery?: string;
}

export function ConversationList({ searchQuery = "" }: ConversationListProps) {
  const {
    conversations,
    deleteConversation,
    togglePinConversation,
    updateConversationTitle,
  } = useConversations();

  console.log("🟢 conversations", conversations);

  // Custom hooks for different concerns
  const { filteredGroups } = useConversationGroups(conversations, searchQuery);

  const {
    editingId,
    handleRenameConversation,
    handleSaveRename,
    handleCancelRename,
  } = useConversationEdit(
    filteredGroups,
    conversations,
    updateConversationTitle
  );

  const {
    openMenuId,
    setOpenMenuId,
    handleConversationClick,
    handleFavouriteConversation,
    getOriginalConversation,
  } = useConversationMenu(conversations, togglePinConversation);

  const {
    deleteConfirmation,
    handleDeleteConversation,
    openDeleteConfirmation,
    closeDeleteConfirmation,
  } = useConversationDelete(deleteConversation);

  // Event handlers for conversation actions
  const handleConversationItemClick = (conversationId: number) => {
    handleConversationClick(conversationId, editingId);
  };

  const handleFavouriteToggle = async (conversationId: number) => {
    await handleFavouriteConversation(conversationId);
  };

  const handleRename = (conversationId: number) => {
    handleRenameConversation(conversationId);
    setOpenMenuId(null);
  };

  const handleDelete = (conversationId: number) => {
    const originalConversation = getOriginalConversation(conversationId);
    const conversation = filteredGroups
      .flatMap((g) => g.conversations)
      .find((c) => c.id === conversationId);

    if (originalConversation && conversation) {
      openDeleteConfirmation(originalConversation.id, conversation.title);
    }
  };

  const handleSaveRenameWrapper = async (
    conversationId: number,
    newTitle: string
  ) => {
    await handleSaveRename(conversationId, newTitle);
  };

  const handleMenuOpenChange = (conversationId: number | null) => {
    setOpenMenuId(conversationId);
  };

  // Show no results message if search query yields no results
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
        <ConversationGroup
          key={group.label}
          group={group}
          conversations={conversations}
          editingId={editingId}
          openMenuId={openMenuId}
          onConversationClick={handleConversationItemClick}
          onFavouriteToggle={handleFavouriteToggle}
          onRename={handleRename}
          onDelete={handleDelete}
          onSaveRename={handleSaveRenameWrapper}
          onCancelRename={handleCancelRename}
          onMenuOpenChange={handleMenuOpenChange}
        />
      ))}

      <DeleteConversationDialog
        open={deleteConfirmation.open}
        conversationTitle={deleteConfirmation.conversationTitle}
        onConfirm={() => {
          if (deleteConfirmation.conversationId) {
            handleDeleteConversation(deleteConfirmation.conversationId);
          }
        }}
        onCancel={closeDeleteConfirmation}
      />
    </div>
  );
}
